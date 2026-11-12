"""Collect UNDP Exposure stories into public/data/stories.json.

For every account in sources.json:
  1. Read the account's sitemap.xml to discover every published story
     (title, cover photo, last-modified date).
  2. Read feed.rss for exact publication dates of recent stories.
  3. Try the story's Markdown version (<story>.md) to get every photo.
     Exposure currently blocks automated clients from story pages; when that
     happens the story keeps its cover photo and the block is reported.
  4. Drop translations / duplicates: stories whose cover photos are visually
     identical are grouped, and one is kept (English first).

Stories that are no longer in a sitemap are removed. If a whole account
cannot be read, its previous stories are kept and the failure is reported.

Usage: python collector/collect.py [--limit-md N]
"""

import argparse
import datetime as dt
import difflib
import email.utils
import html
import io
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / "collector" / "sources.json"
DATA = ROOT / "public" / "data" / "stories.json"
REPORT_JSON = ROOT / "public" / "data" / "report.json"
REPORT_MD = ROOT / "reports" / "latest.md"
HASH_CACHE = ROOT / "collector" / "cover-hashes.json"  # cover URL -> fingerprint, so covers are fetched once
MANUAL_DIR = ROOT / "collector" / "manual"  # photo sets captured by hand with the collect page

USER_AGENT = "UNDP-Exposure-Photo-Archive/1.0 (non-commercial photo index)"
DELAY = 0.6            # seconds between requests, to be polite
MD_BLOCK_LIMIT = 3     # consecutive blocked story pages before giving up on an account
HASH_DISTANCE = 12     # max differing bits (of 256) for two covers to count as the same photo
NON_STORY = {"search", "accessibility", "categories", "feed.rss", "about", "portfolio"}

EN_WORDS = set("the a an of and in to for on with from how why what is are our their at by this that be as its it we you your women youth people".split())
ES_WORDS = set("el la los las de del y en para con por una un que su sus como al más mujeres jóvenes".split())
FR_WORDS = set("le la les des du et en pour avec par une un que sur au aux dans est femmes jeunes".split())
PT_WORDS = set("o os as do da dos das e em para com por uma um que no na mulheres".split())


def get(url, binary=False, delay=DELAY):
    time.sleep(delay)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as r:
        body = r.read()
    return body if binary else body.decode("utf-8", "replace")


def base_image(url):
    """Strip Exposure's resize suffix: '.../original.jpg;resize(..).jpg?auto=webp' -> '.../original.jpg'."""
    return url.split(";")[0].split("?")[0]


def parse_sitemap(xml, account):
    stories = []
    for block in xml.split("<url>")[1:]:
        loc = re.search(r"<loc>([^<]+)</loc>", block)
        if not loc:
            continue
        url = html.unescape(loc.group(1)).strip()
        path = url.split(".exposure.co", 1)[-1].strip("/")
        if not path or "/" in path or path.lower() in NON_STORY:
            continue
        img = re.search(r"<image:loc>([^<]+)</image:loc>", block)
        cap = re.search(r"<image:caption>([^<]*)</image:caption>", block)
        mod = re.search(r"<lastmod>([^<]+)</lastmod>", block)
        stories.append({
            "slug": path,
            "url": f"https://{account}.exposure.co/{path}",
            "title": html.unescape(cap.group(1)).strip() if cap else path.replace("-", " ").title(),
            "cover": base_image(html.unescape(img.group(1))) if img else None,
            "lastmod": mod.group(1)[:10] if mod else None,
        })
    return stories


def parse_rss(xml):
    dates = {}
    for item in xml.split("<item>")[1:]:
        link = re.search(r"<link>([^<]+)</link>", item)
        pub = re.search(r"<pubDate>([^<]+)</pubDate>", item)
        if link and pub:
            slug = link.group(1).split(".exposure.co", 1)[-1].strip("/")
            dates[slug] = email.utils.parsedate_to_datetime(pub.group(1)).date().isoformat()
    return dates


def parse_markdown(md):
    """Return title, publication date, photos and credits from Exposure's .md export."""
    title = re.search(r"^# (.+)$", md, re.M)
    pub = re.search(r"^Published:\s*(.+)$", md, re.M)
    date = None
    if pub:
        try:
            date = dt.datetime.strptime(pub.group(1).strip(), "%B %d, %Y").date().isoformat()
        except ValueError:
            pass
    photos, seen = [], set()
    for alt, src in re.findall(r"!\[([^\]]*)\]\(([^)\s]+)\)", md):
        src = base_image(src)
        if src in seen or "/avatar/" in src:
            continue
        seen.add(src)
        photos.append({"src": src, "alt": alt if alt and alt != "Photo" else ""})
    credits = None
    m = re.search(r"^.*\b(Photos?|Photography|Fotos?|Fotografías?|Crédits? photos?)\b[^\n]{0,200}$", md.split("## Footnotes")[-1], re.M | re.I)
    if m and "## Footnotes" in md:
        credits = m.group(0).strip()[:200]
    return {"title": title.group(1).strip() if title else None, "date": date, "photos": photos, "credits": credits}


def date_from_cover(cover):
    m = re.search(r"/cover-(\d{9,10})\.", cover or "")
    if m:
        return dt.datetime.fromtimestamp(int(m.group(1)), dt.timezone.utc).date().isoformat()
    return None


def dhash(url):
    """256-bit difference hash of a small version of the image (hex string)."""
    img = Image.open(io.BytesIO(get(f"{url};resize(96,_).jpeg", binary=True, delay=0.2))).convert("L").resize((17, 16))
    px = list(img.getdata())
    bits = 0
    for row in range(16):
        for col in range(16):
            bits = (bits << 1) | (px[row * 17 + col] > px[row * 17 + col + 1])
    return f"{bits:064x}"


def english_score(text):
    words = re.findall(r"[a-zà-öø-ÿ']+", text.lower())
    if re.search(r"[Ѐ-ӿ؀-ۿ฀-๿一-鿿ऀ-ॿ]", text):
        return -5
    en = sum(w in EN_WORDS for w in words)
    other = max(sum(w in s for w in words) for s in (ES_WORDS, FR_WORDS, PT_WORDS))
    accents = len(re.findall(r"[áéíóúñçãõàèêâôü¿¡ăîșțşğıö]", text.lower()))
    return en - other - accents


def dedupe(stories, sources_by_account):
    """Group stories whose cover photos are the same picture; keep English first, then country offices.

    Every member of a group must match the group's first story directly, so
    look-alike covers cannot chain unrelated stories together.
    """
    def same_story(a, b):
        # Two English stories with clearly different titles are different stories
        # that happen to reuse a cover photo; translations have different languages.
        if english_score(a["title"]) > 0 and english_score(b["title"]) > 0:
            return difflib.SequenceMatcher(None, a["title"].lower(), b["title"].lower()).ratio() >= 0.6
        return True

    groups = []  # [(seed_hash_int, [stories])]
    for s in stories:
        h = int(s["coverHash"], 16)
        for seed, members in groups:
            if bin(seed ^ h).count("1") <= HASH_DISTANCE and same_story(members[0], s):
                members.append(s)
                break
        else:
            groups.append((h, [s]))

    def rank(s):
        is_office = sources_by_account[s["account"]]["region"] != "GLOBAL" and s["account"] not in ("undparabic", "undpasiapac", "undplac", "undpeurasia")
        return (english_score(s["title"]) > 0, english_score(s["title"]), is_office, len(s["images"]), s["date"] or "")

    kept, dropped = [], []
    for _, group in groups:
        group.sort(key=rank, reverse=True)
        kept.append(group[0])
        for other in group[1:]:
            dropped.append({"id": other["id"], "title": other["title"], "url": other["url"], "keptInstead": group[0]["url"]})
    return kept, dropped


def load_manual():
    """Photo sets captured by hand (public/collect.html), newest capture of each story wins."""
    manual = {}
    for f in sorted(MANUAL_DIR.glob("*.json")):
        try:
            entries = json.loads(f.read_text()).get("stories", [])
        except (ValueError, AttributeError) as e:
            print(f"   skipping {f.name}: {e}")
            continue
        for e in entries:
            url = (e.get("url") or "").lower().rstrip("/")
            photos = [{"src": base_image(p["src"]), "alt": p.get("alt") or ""} for p in e.get("photos", []) if p.get("src")]
            if url and photos and e.get("collectedAt", "") >= manual.get(url, {}).get("collectedAt", ""):
                manual[url] = {**e, "photos": photos}
    return manual


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit-md", type=int, default=None, help="max story pages to try per account (testing)")
    args = ap.parse_args()

    sources = json.loads(SOURCES.read_text())
    by_account = {s["account"]: s for s in sources}
    previous = {s["id"]: s for s in json.loads(DATA.read_text())["stories"]} if DATA.exists() else {}
    prev_hashes = json.loads(HASH_CACHE.read_text()) if HASH_CACHE.exists() else {}
    prev_hashes.update({s["cover"]: s["coverHash"] for s in previous.values() if len(s.get("coverHash") or "") == 64})

    manual = load_manual()
    stories, report_sites = [], []
    for src in sources:
        acct = src["account"]
        site = {"account": acct, "office": src["office"], "url": f"https://{acct}.exposure.co/", "status": "ok",
                "stories": 0, "fullPhotoSets": 0, "coverOnly": 0, "blockedPages": 0, "notes": []}
        report_sites.append(site)
        print(f"== {acct}", flush=True)
        try:
            listed = parse_sitemap(get(f"https://{acct}.exposure.co/sitemap.xml"), acct)
        except Exception as e:
            site["status"] = "sitemap unavailable"
            site["notes"].append(f"Could not read sitemap ({e}); previous stories kept.")
            kept = [s for s in previous.values() if s["account"] == acct]
            stories.extend(kept)
            site["stories"] = len(kept)
            continue
        if not listed:
            site["status"] = "no public stories"
            site["notes"].append("The site's sitemap lists no stories (they may be unlisted, reachable only by direct link).")
        try:
            rss_dates = parse_rss(get(f"https://{acct}.exposure.co/feed.rss"))
        except Exception as e:
            rss_dates = {}
            site["notes"].append(f"RSS feed unavailable ({e}).")

        blocked_run, md_tries, md_blocked_for_site = 0, 0, False
        for item in listed:
            sid = f"{acct}/{item['slug']}"
            prev = previous.get(sid)
            story = {
                "id": sid, "account": acct, "office": src["office"], "location": src["location"],
                "region": src["region"], "title": item["title"], "url": item["url"], "cover": item["cover"],
                "lastmod": item["lastmod"],
                "date": rss_dates.get(item["slug"]) or date_from_cover(item["cover"]) or item["lastmod"],
                "images": [], "credits": None, "photoSet": "cover",
            }
            # Reuse a full photo set collected earlier if the story has not changed since.
            if prev and prev.get("photoSet") == "full" and prev.get("lastmod") == item["lastmod"]:
                story.update({k: prev[k] for k in ("images", "credits", "photoSet", "title", "date")})
            elif not md_blocked_for_site and (args.limit_md is None or md_tries < args.limit_md):
                md_tries += 1
                try:
                    parsed = parse_markdown(get(item["url"] + ".md"))
                    blocked_run = 0
                    if parsed["photos"]:
                        story["images"] = parsed["photos"]
                        story["photoSet"] = "full"
                    story["title"] = parsed["title"] or story["title"]
                    story["date"] = parsed["date"] or story["date"]
                    story["credits"] = parsed["credits"]
                except urllib.error.HTTPError as e:
                    if e.code in (401, 403, 429):
                        site["blockedPages"] += 1
                        blocked_run += 1
                        if blocked_run >= MD_BLOCK_LIMIT:
                            md_blocked_for_site = True
                            site["notes"].append(f"Story pages blocked for automated access (HTTP {e.code}); stopped trying after {MD_BLOCK_LIMIT} attempts.")
                    else:
                        site["notes"].append(f"{item['slug']}: HTTP {e.code}")
                except Exception as e:
                    site["notes"].append(f"{item['slug']}: {e}")
            elif prev and prev.get("photoSet") == "full":
                # Blocked this run but we already have the photos from an earlier run.
                story.update({k: prev[k] for k in ("images", "credits", "photoSet")})

            hand = manual.get(item["url"].lower())
            if story["photoSet"] != "full" and hand:
                story["images"] = hand["photos"]
                story["photoSet"] = "full"
                story["title"] = hand.get("title") or story["title"]
                story["date"] = hand.get("date") or story["date"]
                story["credits"] = hand.get("credits")

            if not story["images"] and story["cover"]:
                story["images"] = [{"src": story["cover"], "alt": ""}]
            if not story["images"]:
                site["notes"].append(f"{item['slug']}: no photos found, skipped.")
                continue
            story["year"] = (story["date"] or "")[:4]

            if story["cover"]:
                h = prev_hashes.get(story["cover"])
                if not h:
                    try:
                        h = dhash(story["cover"])
                    except Exception as e:
                        site["notes"].append(f"{item['slug']}: cover photo missing on Exposure ({e}), skipped.")
                        continue
                story["coverHash"] = h
            else:
                site["notes"].append(f"{item['slug']}: no cover photo, skipped.")
                continue
            stories.append(story)
            site["stories"] += 1
            if hand and story["photoSet"] == "full" and story["images"] == hand["photos"]:
                site["manual"] = site.get("manual", 0) + 1
            site["fullPhotoSets" if story["photoSet"] == "full" else "coverOnly"] += 1
        print(f"   {site['stories']} stories, {site['fullPhotoSets']} full photo sets, {site['blockedPages']} blocked pages", flush=True)

    HASH_CACHE.write_text(json.dumps({s["cover"]: s["coverHash"] for s in stories}, separators=(",", ":")))
    kept, dropped = dedupe(stories, by_account)
    kept.sort(key=lambda s: (s["date"] or "", s["id"]), reverse=True)

    now = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()
    DATA.parent.mkdir(parents=True, exist_ok=True)
    DATA.write_text(json.dumps({"updated": now, "stories": kept}, ensure_ascii=False, separators=(",", ":")))

    report = {
        "updated": now,
        "totals": {
            "accounts": len(sources), "stories": len(kept), "photos": sum(len(s["images"]) for s in kept),
            "fullPhotoSets": sum(s["photoSet"] == "full" for s in kept),
            "coverOnly": sum(s["photoSet"] == "cover" for s in kept),
            "duplicatesRemoved": len(dropped),
            "collectedByHand": sum(s.get("manual", 0) for s in report_sites),
        },
        "sites": report_sites,
        "duplicatesRemoved": dropped,
    }
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=1))
    write_markdown_report(report)
    print(json.dumps(report["totals"]))


def write_markdown_report(r):
    t = r["totals"]
    lines = [
        "# Collection report", "", f"Updated: {r['updated']}", "",
        f"- Accounts checked: {t['accounts']}",
        f"- Stories in archive: {t['stories']}",
        f"- Photos in archive: {t['photos']}",
        f"- Stories with their full photo set: {t['fullPhotoSets']} (collected by hand: {t['collectedByHand']})",
        f"- Stories with cover photo only (story page not accessible): {t['coverOnly']}",
        f"- Translations / duplicates removed: {t['duplicatesRemoved']}",
        "", "## Accounts", "",
        "| Account | Status | Stories | Full photo sets | Cover only | Blocked pages | Notes |",
        "|---|---|---|---|---|---|---|",
    ]
    for s in r["sites"]:
        notes = "; ".join(s["notes"][:3]) + (f" (+{len(s['notes']) - 3} more)" if len(s["notes"]) > 3 else "")
        lines.append(f"| [{s['office']}]({s['url']}) | {s['status']} | {s['stories']} | {s['fullPhotoSets']} | {s['coverOnly']} | {s['blockedPages']} | {notes} |")
    if r["duplicatesRemoved"]:
        lines += ["", "## Translations / duplicates removed", "", "| Removed | Kept instead |", "|---|---|"]
        for d in r["duplicatesRemoved"]:
            lines.append(f"| [{d['title']}]({d['url']}) | {d['keptInstead']} |")
    REPORT_MD.parent.mkdir(parents=True, exist_ok=True)
    REPORT_MD.write_text("\n".join(lines) + "\n")


if __name__ == "__main__":
    sys.exit(main())
