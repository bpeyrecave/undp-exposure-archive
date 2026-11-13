import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { GalleryItem } from "./shared";

// Editors' picks are published as public/data/picks.json. A curator edits a
// draft in their own browser (curator mode), downloads it and uploads it to
// the repository in place of the published file.

export interface Collection {
  id: string;
  name: string;
}

export interface Pick extends GalleryItem {
  collections: string[];
  addedAt: string;
}

export interface PicksFile {
  updated?: string;
  collections: Collection[];
  picks: Pick[];
}

const DRAFT_KEY = "undp-archive-picks-draft";
const CURATOR_KEY = "undp-archive-curator";
const EMPTY: PicksFile = { collections: [], picks: [] };

function readStorage(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage blocked (private window): curator changes then last for this visit only.
  }
}

function sameContent(a: PicksFile, b: PicksFile) {
  const strip = (f: PicksFile) => JSON.stringify({ collections: f.collections, picks: f.picks });
  return strip(a) === strip(b);
}

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "collection"
  );
}

interface PicksContextValue {
  picks: PicksFile;
  loaded: boolean;
  curator: boolean;
  hasDraft: boolean;
  isPicked: (src: string) => boolean;
  pickOf: (src: string) => Pick | undefined;
  pickedInStory: (storyUrl: string) => number;
  setPick: (item: GalleryItem, collections: string[] | null) => void;
  addCollection: (name: string) => string;
  removeCollection: (id: string) => void;
  download: () => void;
  discardDraft: () => void;
  exitCurator: () => void;
}

const PicksContext = createContext<PicksContextValue | null>(null);

export function usePicks() {
  const value = useContext(PicksContext);
  if (!value) throw new Error("usePicks must be used inside PicksProvider");
  return value;
}

export function PicksProvider({ children }: { children: ReactNode }) {
  const [published, setPublished] = useState<PicksFile>(EMPTY);
  const [draft, setDraft] = useState<PicksFile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [curator, setCurator] = useState(false);

  useEffect(() => {
    // ?curate in the address turns curator mode on for this browser.
    const params = new URLSearchParams(location.search);
    if (params.has("curate")) {
      writeStorage(CURATOR_KEY, "1");
      params.delete("curate");
      const query = params.toString();
      history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
    }
    setCurator(readStorage(CURATOR_KEY) === "1");

    fetch(`${import.meta.env.BASE_URL}data/picks.json`, { cache: "no-cache" })
      .then((response) => (response.ok ? response.json() : EMPTY))
      .catch(() => EMPTY)
      .then((file: PicksFile) => {
        const publishedFile = { ...EMPTY, ...file };
        setPublished(publishedFile);
        const saved = readStorage(DRAFT_KEY);
        if (saved) {
          try {
            const savedDraft = JSON.parse(saved) as PicksFile;
            // Once the draft has been uploaded, the published file matches it: forget the draft.
            if (sameContent(savedDraft, publishedFile)) writeStorage(DRAFT_KEY, null);
            else setDraft(savedDraft);
          } catch {
            writeStorage(DRAFT_KEY, null);
          }
        }
        setLoaded(true);
      });
  }, []);

  // Visitors always see the published picks; a curator sees their draft.
  // Collections are always listed A–Z.
  const current = curator && draft ? draft : published;
  const picks = useMemo(
    () => ({ ...current, collections: [...current.collections].sort((a, b) => a.name.localeCompare(b.name)) }),
    [current],
  );

  const update = useCallback(
    (change: (file: PicksFile) => PicksFile) => {
      setDraft((current) => {
        const next = change(current ?? published);
        if (sameContent(next, published)) {
          writeStorage(DRAFT_KEY, null);
          return null;
        }
        writeStorage(DRAFT_KEY, JSON.stringify(next));
        return next;
      });
    },
    [published],
  );

  const bySrc = useMemo(() => new Map(picks.picks.map((pick) => [pick.src, pick])), [picks]);
  // How many photos are picked from each story, keyed by story link.
  const byStory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const pick of picks.picks) {
      const key = pick.storyUrl.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [picks]);

  const value: PicksContextValue = {
    picks,
    loaded,
    curator,
    hasDraft: curator && draft !== null,
    isPicked: (src) => bySrc.has(src),
    pickOf: (src) => bySrc.get(src),
    pickedInStory: (storyUrl) => byStory.get(storyUrl.toLowerCase()) ?? 0,
    // collections === null removes the pick.
    setPick: (item, collections) =>
      update((file) => {
        const others = file.picks.filter((pick) => pick.src !== item.src);
        if (collections === null) return { ...file, picks: others };
        const existing = file.picks.find((pick) => pick.src === item.src);
        const pick: Pick = {
          ...item,
          collections,
          addedAt: existing?.addedAt ?? new Date().toISOString(),
        };
        return { ...file, picks: [pick, ...others] };
      }),
    addCollection: (name) => {
      const base = slugify(name);
      let id = base;
      for (let n = 2; picks.collections.some((c) => c.id === id); n++) id = `${base}-${n}`;
      update((file) => ({ ...file, collections: [...file.collections, { id, name: name.trim() }] }));
      return id;
    },
    removeCollection: (id) =>
      update((file) => ({
        ...file,
        collections: file.collections.filter((c) => c.id !== id),
        picks: file.picks.map((pick) => ({ ...pick, collections: pick.collections.filter((c) => c !== id) })),
      })),
    download: () => {
      const file: PicksFile = { updated: new Date().toISOString(), collections: picks.collections, picks: picks.picks };
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([JSON.stringify(file, null, 1)], { type: "application/json" }));
      link.download = "picks.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    discardDraft: () => {
      writeStorage(DRAFT_KEY, null);
      setDraft(null);
    },
    exitCurator: () => {
      writeStorage(CURATOR_KEY, null);
      setCurator(false);
    },
  };

  return <PicksContext.Provider value={value}>{children}</PicksContext.Provider>;
}
