import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Star, X } from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { downloadPhoto, pad, sized, type GalleryItem } from "./shared";
import { usePicks } from "./picks";

// Full-screen gallery for a story's photos or a set of editors' picks.
export function Lightbox({
  items,
  startIndex = 0,
  heading,
  numberInStory = false,
  onClose,
}: {
  items: GalleryItem[];
  startIndex?: number;
  heading?: string; // replaces "office / region" in the top line, e.g. for picks
  numberInStory?: boolean; // the position doubles as the photo's number in its story
  onClose: () => void;
}) {
  const [imageIndex, setImageIndex] = useState(startIndex);
  const [downloading, setDownloading] = useState(false);
  const item = items[Math.min(imageIndex, items.length - 1)];
  const credits = item.credits || `Photography: ${item.office}`;

  const previous = useCallback(() => {
    setImageIndex((current) => (current - 1 + items.length) % items.length);
  }, [items.length]);

  const next = useCallback(() => {
    setImageIndex((current) => (current + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, onClose, previous]);

  // Preload the neighbouring photos for quick browsing.
  useEffect(() => {
    if (items.length < 2) return;
    [1, -1].forEach((step) => {
      const img = new Image();
      img.src = sized(items[(imageIndex + step + items.length) % items.length].src, 1600);
    });
  }, [imageIndex, items]);

  const download = async () => {
    setDownloading(true);
    await downloadPhoto(item, numberInStory ? imageIndex + 1 : undefined);
    setDownloading(false);
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={item.storyTitle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-black"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/15 px-4 sm:px-7">
        <div className="min-w-0">
          <p className="truncate font-proxima-condensed text-xs font-bold uppercase tracking-[0.16em] text-white/65">
            {heading ? `${heading} · ${item.office}` : `${item.office} / ${item.region}`}
          </p>
          <p className="mt-1 hidden truncate font-card-title text-sm font-semibold text-white sm:block">{item.storyTitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-6 flex h-9 w-9 shrink-0 items-center justify-center border border-white/25 text-white transition-colors hover:bg-white hover:text-black"
          aria-label="Close gallery"
        >
          <X size={17} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 sm:p-8">
        {item.caption && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4 sm:bottom-6 sm:px-12">
            <div className="max-w-2xl bg-black/85 px-4 py-2 backdrop-blur-md border border-white/20 text-center shadow-2xl">
              <p className="font-card-title text-xs leading-relaxed text-white sm:text-[13px]">
                {item.caption}
              </p>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={item.src}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="flex h-full w-full items-center justify-center"
          >
            <ImageWithFallback
              src={sized(item.src, 1600)}
              alt={item.alt || `${item.storyTitle}, photograph ${imageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              className="absolute left-4 flex h-11 w-11 items-center justify-center bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground sm:left-8"
              aria-label="Previous photograph"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-4 flex h-11 w-11 items-center justify-center bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground sm:right-8"
              aria-label="Next photograph"
            >
              <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-white/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-proxima-condensed text-xs font-bold uppercase tracking-[0.14em] text-white/80">
            {item.location}
          </span>
          <span className="hidden text-white/30 sm:inline" aria-hidden="true">·</span>
          <span className="font-proxima-condensed text-[11px] font-medium tracking-[0.04em] text-accent">
            {credits}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <PickControl item={item} />
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="flex items-center gap-1 font-proxima-condensed text-[11px] font-bold uppercase tracking-[0.12em] text-white/70 transition-colors hover:text-accent disabled:opacity-50"
            aria-label={`Download photograph ${imageIndex + 1} in full resolution`}
          >
            {downloading ? "Downloading…" : "Download"}
            <ArrowDown size={13} strokeWidth={1.5} />
          </button>
          <a
            href={item.storyUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 font-proxima-condensed text-[11px] font-bold uppercase tracking-[0.12em] text-white/70 transition-colors hover:text-accent"
          >
            View on Exposure
            <ArrowUpRight size={13} strokeWidth={1.5} />
          </a>
          <span className="font-proxima-condensed text-xs font-bold uppercase tracking-[0.16em] text-white/50">
            {pad(imageIndex + 1)} / {pad(items.length)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Curator-only: pick the current photo and choose its collections.
function PickControl({ item }: { item: GalleryItem }) {
  const { curator, pickOf, setPick, picks, addCollection } = usePicks();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [item.src]);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!curator) return null;
  const pick = pickOf(item.src);

  const toggle = (id: string) => {
    const current = pick?.collections ?? [];
    setPick(item, current.includes(id) ? current.filter((c) => c !== id) : [...current, id]);
  };

  const create = () => {
    const name = newName.trim();
    if (!name) return;
    const id = addCollection(name);
    setPick(item, [...(pick?.collections ?? []), id]);
    setNewName("");
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (!pick) setPick(item, []);
          setOpen((value) => !value);
        }}
        className={`flex items-center gap-1 border px-2 py-1 font-proxima-condensed text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
          pick ? "border-accent bg-accent text-accent-foreground" : "border-white/30 text-white hover:border-accent hover:text-accent"
        }`}
        aria-expanded={open}
      >
        <Star size={12} strokeWidth={2} fill={pick ? "currentColor" : "none"} />
        {pick ? "Picked" : "Pick"}
      </button>

      {open && pick && (
        <div className="absolute bottom-full right-0 z-30 mb-2 w-64 border border-border bg-[#1c2532] p-3 shadow-2xl">
          <p className="mb-2 font-proxima-condensed text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
            Add to collections
          </p>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {picks.collections.length === 0 && (
              <p className="text-xs text-muted-foreground">No collections yet. Create one below.</p>
            )}
            {picks.collections.map((collection) => (
              <label key={collection.id} className="flex cursor-pointer items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={pick.collections.includes(collection.id)}
                  onChange={() => toggle(collection.id)}
                  className="accent-[#ffe17e]"
                />
                {collection.name}
              </label>
            ))}
          </div>
          <form
            className="mt-3 flex gap-1"
            onSubmit={(event) => {
              event.preventDefault();
              create();
            }}
          >
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="New collection"
              className="min-w-0 flex-1 border border-white/20 bg-black/30 px-2 py-1 text-sm text-white placeholder:text-white/40"
            />
            <button type="submit" className="border border-white/20 px-2 font-proxima-condensed text-xs font-bold uppercase text-white hover:border-accent">
              Add
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              setPick(item, null);
              setOpen(false);
            }}
            className="mt-3 font-proxima-condensed text-[11px] font-bold uppercase tracking-[0.12em] text-white/50 hover:text-white"
          >
            Remove from picks
          </button>
        </div>
      )}
    </div>
  );
}
