import { useMemo, useState } from "react";
import { ArrowDown, ArrowUpRight, X } from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { downloadPhoto, formatDate, pad, sized, type GalleryItem } from "./shared";
import { usePicks, type Pick } from "./picks";

// Best photos (editors' picks): a photo grid filtered by collection. `collection` comes from
// the address (#picks/<id>) so each collection has its own shareable link.
export function PicksView({
  collection,
  onSelectCollection,
  onOpen,
}: {
  collection: string | null;
  onSelectCollection: (id: string | null) => void;
  onOpen: (items: GalleryItem[], index: number, heading: string) => void;
}) {
  const { picks, loaded, curator, removeCollection } = usePicks();
  const active = picks.collections.find((c) => c.id === collection) ?? null;

  const shown = useMemo(
    () =>
      picks.picks
        .filter((pick) => !active || pick.collections.includes(active.id))
        .sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
    [picks, active],
  );
  const heading = active ? `Best photos · ${active.name}` : "Best photos";

  return (
    <>
      <div className="flex items-center justify-between border-b border-border py-3 sm:py-3.5">
        <nav aria-label="Filter picks by collection" className="flex min-w-0 items-center gap-1 overflow-x-auto pr-3">
          <CollectionTab label="All" count={picks.picks.length} active={!active} onClick={() => onSelectCollection(null)} />
          {picks.collections.map((c) => (
            <span key={c.id} className="flex shrink-0 items-center">
              <CollectionTab
                label={c.name}
                count={picks.picks.filter((pick) => pick.collections.includes(c.id)).length}
                active={active?.id === c.id}
                onClick={() => onSelectCollection(c.id)}
              />
              {curator && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete the collection "${c.name}"? Its photos stay in Best photos.`)) {
                      removeCollection(c.id);
                      if (active?.id === c.id) onSelectCollection(null);
                    }
                  }}
                  className="-ml-2 mr-1 p-1 text-muted-foreground hover:text-foreground"
                  aria-label={`Delete collection ${c.name}`}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </nav>
      </div>

      {!loaded ? (
        <div className="grid auto-rows-[19rem] grid-cols-1 gap-2 pt-2 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse bg-card" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="my-16 flex flex-col items-center justify-center border border-dashed border-border px-6 py-20 text-center">
          <p className="font-card-title text-lg font-semibold text-foreground">
            {active ? `No photos in ${active.name} yet` : "No best photos yet"}
          </p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {curator
              ? "Open any story, then use the Pick button in the photo gallery to add photos here."
              : "Selected photos from UNDP's Exposure stories will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid auto-rows-[19rem] grid-cols-1 gap-2 pt-2 sm:auto-rows-[21rem] sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((pick, index) => (
            <PickCard key={pick.src} pick={pick} onOpen={() => onOpen(shown, index, heading)} />
          ))}
        </div>
      )}
    </>
  );
}

function CollectionTab({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-baseline gap-1.5 px-3 py-1.5 font-proxima-condensed text-sm font-bold uppercase tracking-[0.12em] transition-colors first:pl-0 sm:px-3.5 sm:py-2 ${
        active ? "text-accent" : "text-muted-foreground hover:text-foreground"
      }`}
      aria-pressed={active}
    >
      {label}
      <span className="text-[10px] font-semibold opacity-65">{pad(count)}</span>
    </button>
  );
}

function PickCard({ pick, onOpen }: { pick: Pick; onOpen: () => void }) {
  const [downloading, setDownloading] = useState(false);

  return (
    <article className="group relative isolate overflow-hidden bg-card text-left">
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
        aria-label={`View photograph from: ${pick.storyTitle}`}
      />
      <ImageWithFallback
        src={sized(pick.src, 700)}
        alt={pick.alt || pick.storyTitle}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10 opacity-30 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100" />

      <div className="absolute left-4 top-4 flex items-center gap-2 font-proxima-condensed text-[11px] font-bold uppercase tracking-[0.14em] text-white">
        <span className="bg-accent px-2 py-0.5 text-accent-foreground font-extrabold">{pick.region}</span>
        <span className="drop-shadow-md font-semibold tracking-[0.12em]">{formatDate(pick.date)}</span>
      </div>

      <div className="absolute right-4 top-4 z-20 flex gap-1.5 md:translate-y-2 md:opacity-0 md:transition-all md:duration-300 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
        <button
          type="button"
          onClick={async () => {
            setDownloading(true);
            await downloadPhoto(pick);
            setDownloading(false);
          }}
          disabled={downloading}
          className="flex h-9 w-9 items-center justify-center border border-white/40 bg-black/20 text-white backdrop-blur-sm transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          aria-label="Download this photograph in full resolution"
          title="Download full resolution"
        >
          <ArrowDown size={15} strokeWidth={1.5} />
        </button>
        <a
          href={pick.storyUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-9 w-9 items-center justify-center border border-white/40 bg-black/20 text-white backdrop-blur-sm transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"
          aria-label={`Read story on Exposure: ${pick.storyTitle}`}
          title="Read story on Exposure"
        >
          <ArrowUpRight size={15} strokeWidth={1.5} />
        </a>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="mb-1 font-proxima-condensed text-[11px] font-bold uppercase tracking-[0.16em] text-white/80 drop-shadow">
          {pick.office} · {pick.location}
        </p>
        <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100">
          <div className="overflow-hidden">
            <p className="font-card-title text-base font-bold leading-snug drop-shadow-md">{pick.storyTitle}</p>
            {pick.caption && <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-white/80">{pick.caption}</p>}
          </div>
        </div>
      </div>
    </article>
  );
}

// Curator-only bar: shows unpublished changes and how to publish them.
export function CuratorBar() {
  const { curator, hasDraft, picks, download, discardDraft, exitCurator } = usePicks();
  const [showHelp, setShowHelp] = useState(false);
  if (!curator) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-accent/60 bg-[#1c2532]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1560px] flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-12">
        <p className="font-proxima-condensed text-xs font-bold uppercase tracking-[0.14em] text-foreground">
          <span className="mr-2 bg-accent px-2 py-0.5 text-accent-foreground">Curator mode</span>
          {pad(picks.picks.length)} picks · {pad(picks.collections.length)} collections ·{" "}
          <span className={hasDraft ? "text-accent" : "text-muted-foreground"}>
            {hasDraft ? "unpublished changes" : "everything published"}
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {hasDraft && (
            <>
              <button
                type="button"
                onClick={() => {
                  download();
                  setShowHelp(true);
                }}
                className="border border-accent bg-accent px-3 py-1.5 font-proxima-condensed text-xs font-bold uppercase tracking-[0.14em] text-accent-foreground"
              >
                Download picks.json
              </button>
              <button
                type="button"
                onClick={() => confirm("Discard all unpublished changes to the picks?") && discardDraft()}
                className="border border-border px-3 py-1.5 font-proxima-condensed text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
              >
                Discard
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setShowHelp((value) => !value)}
            className="border border-border px-3 py-1.5 font-proxima-condensed text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          >
            How to publish
          </button>
          <button
            type="button"
            onClick={exitCurator}
            className="px-2 py-1.5 font-proxima-condensed text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          >
            Exit
          </button>
        </div>
        {showHelp && (
          <ol className="w-full list-decimal space-y-1 pl-5 pb-1 text-sm text-muted-foreground">
            <li>Pick photos from any story's gallery with the Pick button, and choose their collections.</li>
            <li>Click <strong className="text-foreground">Download picks.json</strong>.</li>
            <li>
              On GitHub, open the <code className="text-accent">public/data</code> folder, choose{" "}
              <strong className="text-foreground">Add file → Upload files</strong>, drop picks.json in (it replaces the old one) and
              commit. Or save it in the project folder and ask Claude to push it.
            </li>
            <li>The site updates in a few minutes; this bar then shows "everything published".</li>
          </ol>
        )}
      </div>
    </div>
  );
}
