# UNDP Exposure Photo Archive

One searchable collection of the photographs published on UNDP's Exposure sites.
One Exposure story = one card. The design comes from the Figma Make prototype
(`reference/App.prototype.tsx` is the original code).

## How it works

| Part | Where | What it does |
|---|---|---|
| Sources | `collector/sources.json` | The Exposure accounts to collect, with office name, location and region (RBA, RBAS, RBEC, RBLAC, RBAP, GLOBAL). |
| Collector | `collector/collect.py` | Reads each account's sitemap (every published story), RSS feed (publication dates) and, when allowed, each story's `.md` version (every photo). Writes `public/data/stories.json`. |
| Report | `reports/latest.md` | What was collected, and every exception: blocked pages, unreadable sites, removed translations/duplicates. |
| Website | `src/app/App.tsx` | The prototype, reading `stories.json`. Photos load straight from Exposure's image server. |
| Automation | `.github/workflows/update-and-deploy.yml` | Every day: run the collector, save changes, rebuild and publish to GitHub Pages. |

Rules applied by the collector:

- Stories removed from an Exposure site disappear from the archive on the next run.
- A story that is unchanged keeps the photos collected earlier.
- Translations: stories with the same cover photo are treated as one story. The English
  version is kept; if there is none, one other language version is kept.
- If a whole site cannot be read, its previous stories are kept and the failure is reported.

## Adding or changing a source

Edit `collector/sources.json` and add a line:

```json
{"account": "undpexample", "office": "UNDP Example", "location": "Example", "region": "RBA"}
```

`account` is the part before `.exposure.co`. The next daily run picks it up.

## Running it locally

```bash
pip install pillow && python collector/collect.py   # collect
npm install && npm run dev                          # view the site
```

## Known limitation

Exposure's website protection (Cloudflare) blocks automated access to story pages, while still
allowing sitemaps, RSS feeds and the image server. Until Exposure allows the collector
(user agent `UNDP-Exposure-Photo-Archive/1.0`), blocked stories show their cover photo
only, and they're listed in the report. Once access is allowed, the next run fills in every
photo automatically.

## Adding full photo sets by hand

The archive's **Collect photos** page (`collect.html`, e.g. `https://<you>.github.io/<repo>/collect.html`)
lets a person fill in stories one at a time from their own browser:

1. Drag the yellow **+ Add to archive** button to the bookmarks bar.
2. Open a story from the page's to-do list and click the bookmark. The story is ticked off.
3. Click **Download collected stories**, then upload the file to `collector/manual/` on GitHub
   (**Add file → Upload files → Commit changes**). The site rebuilds with those photos.
4. Click **Clear after uploading**.

Captured stories are kept for good. The collector uses them whenever Exposure blocks the story page,
and the report shows how many stories were collected by hand.
