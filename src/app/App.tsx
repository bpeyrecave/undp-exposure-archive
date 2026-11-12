import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Lightbox } from "./Lightbox";
import { CuratorBar, PicksView } from "./PicksView";
import { PicksProvider, usePicks } from "./picks";
import { formatDate, pad, sized, storyItems, type GalleryItem, type Region, type Story } from "./shared";

interface ArchiveData {
  updated: string;
  stories: Story[];
}

interface OpenGallery {
  items: GalleryItem[];
  index: number;
  heading?: string;
  numberInStory: boolean;
}

const REGIONS: Region[] = ["All", "RBA", "RBAS", "RBEC", "RBLAC", "RBAP", "GLOBAL"];
const PAGE_SIZE = 30;
const MAX_DOTS = 16;

// The address decides the view: "#picks" or "#picks/<collection>" show the
// best photos (editors' picks); anything else shows the stories.
function readRoute() {
  const match = location.hash.match(/^#picks(?:\/([\w-]+))?/);
  return match ? { view: "picks" as const, collection: match[1] ?? null } : { view: "stories" as const, collection: null };
}

export default function App() {
  return (
    <PicksProvider>
      <Archive />
    </PicksProvider>
  );
}

function Archive() {
  const [data, setData] = useState<ArchiveData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [activeRegion, setActiveRegion] = useState<Region>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [gallery, setGallery] = useState<OpenGallery | null>(null);
  const [route, setRoute] = useState(readRoute);
  const { picks, curator } = usePicks();

  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (hash: string) => {
    history.pushState(null, "", hash || `${location.pathname}${location.search}`);
    setRoute(readRoute());
  };
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/stories.json`)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then(setData)
      .catch(() => setLoadError(true));
  }, []);

  const stories = data?.stories ?? [];

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    stories.forEach((story) => story.year && years.add(story.year));
    return ["All", ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
  }, [stories]);

  const filteredStories = useMemo(
    () =>
      stories.filter((story) => {
        const matchesRegion = activeRegion === "All" || story.region === activeRegion;
        const matchesYear = selectedYear === "All" || story.year === selectedYear;
        return matchesRegion && matchesYear;
      }),
    [stories, activeRegion, selectedYear],
  );

  const getRegionCount = useCallback(
    (region: Region) =>
      stories.filter((story) => {
        const matchesRegion = region === "All" || story.region === region;
        const matchesYear = selectedYear === "All" || story.year === selectedYear;
        return matchesRegion && matchesYear;
      }).length,
    [stories, selectedYear],
  );

  const getYearCount = useCallback(
    (year: string) =>
      stories.filter((story) => {
        const matchesRegion = activeRegion === "All" || story.region === activeRegion;
        const matchesYear = year === "All" || story.year === year;
        return matchesRegion && matchesYear;
      }).length,
    [stories, activeRegion],
  );

  // Show the first page again whenever the filters change.
  useEffect(() => setVisibleCount(PAGE_SIZE), [activeRegion, selectedYear]);

  // Render more cards as the visitor scrolls towards the end of the grid.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((count) => count + PAGE_SIZE);
      },
      { rootMargin: "1200px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredStories.length, visibleCount]);

  const totalPhotos = useMemo(() => stories.reduce((count, story) => count + story.images.length, 0), [stories]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-[1560px] px-5 pb-9 pt-5 sm:px-8 sm:pb-12 sm:pt-7 lg:px-12">
          <div className="mb-16 flex items-center justify-between sm:mb-24">
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                go("");
              }}
              className="font-proxima-condensed text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:text-accent"
            >
              UNDP / Exposure
            </a>
            <div className="flex items-center gap-3 font-proxima-condensed text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <span className="h-2 w-2 bg-accent" aria-hidden="true" />
              Global photo archive
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.75fr)] lg:items-end">
            <h1 className="max-w-4xl font-display text-[clamp(1.85rem,4.8vw,4.65rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.92] text-foreground">
              UNDP Exposure
              <span className="block text-accent font-extrabold tracking-[-0.025em]">PHOTO ARCHIVE</span>
            </h1>
            <div className="lg:pb-2">
              <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                Collection of all photos posted in different UNDP exposure sites.
              </p>
              <p className="mt-7 font-proxima-condensed text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {data ? `${pad(stories.length)} stories / ${totalPhotos.toLocaleString("en-US")} photographs` : "Loading archive…"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main id="archive" className={`mx-auto max-w-[1560px] px-5 sm:px-8 lg:px-12 ${curator ? "pb-40" : "pb-20"}`}>
        <div className="flex items-end gap-8 border-b border-border pt-6" role="tablist" aria-label="Archive views">
          <ViewTab label="Stories" count={stories.length} active={route.view === "stories"} onClick={() => go("")} />
          <ViewTab label="Best photos" count={picks.picks.length} active={route.view === "picks"} onClick={() => go("#picks")} />
        </div>

        {route.view === "picks" ? (
          <PicksView
            collection={route.collection}
            onSelectCollection={(id) => go(id ? `#picks/${id}` : "#picks")}
            onOpen={(items, index, heading) => setGallery({ items, index, heading, numberInStory: false })}
          />
        ) : (
        <>
        <div className="flex items-center justify-between border-b border-border py-3 sm:py-3.5">
          <nav
            aria-label="Filter archive by region"
            className="flex min-w-0 items-center gap-1 overflow-x-auto pr-3"
          >
            {REGIONS.map((region) => {
              const count = getRegionCount(region);

              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => setActiveRegion(region)}
                  className={`group flex shrink-0 items-baseline gap-1.5 px-3 py-1.5 font-proxima-condensed text-sm font-bold uppercase tracking-[0.12em] transition-colors first:pl-0 sm:px-3.5 sm:py-2 ${
                    activeRegion === region
                      ? "text-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-pressed={activeRegion === region}
                >
                  {region === "GLOBAL" ? "Global" : region}
                  <span className="text-[10px] font-semibold opacity-65">{pad(count)}</span>
                </button>
              );
            })}
          </nav>

          <div className="shrink-0 pl-2">
            <YearDropdown
              years={availableYears}
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
              getYearCount={getYearCount}
            />
          </div>
        </div>

        {loadError ? (
          <div className="my-16 border border-dashed border-border py-20 text-center">
            <p className="font-card-title text-lg font-semibold text-foreground">The archive could not be loaded</p>
            <p className="mt-2 text-sm text-muted-foreground">Please refresh the page in a moment.</p>
          </div>
        ) : !data ? (
          <div className="grid auto-rows-[19rem] grid-cols-1 gap-2 pt-2 sm:auto-rows-[23rem] sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={`animate-pulse bg-card ${index === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`} />
            ))}
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="my-16 flex flex-col items-center justify-center border border-dashed border-border py-20 text-center">
            <p className="font-card-title text-lg font-semibold text-foreground">
              No photo stories found
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              There are no stories in {activeRegion === "All" ? "the archive" : activeRegion} for {selectedYear === "All" ? "the selected period" : selectedYear}.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveRegion("All");
                setSelectedYear("All");
              }}
              className="mt-6 border border-accent bg-accent px-4 py-2 font-proxima-condensed text-xs font-bold uppercase tracking-[0.14em] text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeRegion}-${selectedYear}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid auto-rows-[19rem] grid-cols-1 gap-2 pt-2 sm:auto-rows-[23rem] sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredStories.slice(0, visibleCount).map((story, index) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  featured={activeRegion === "All" && selectedYear === "All" && index === 0}
                  onOpen={() => setGallery({ items: storyItems(story), index: 0, numberInStory: true })}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
        {data && visibleCount < filteredStories.length && <div ref={sentinelRef} className="h-px" aria-hidden="true" />}
        </>
        )}

        <footer className="mt-16 flex flex-col gap-4 border-t border-border pt-5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Stories of development, told in photographs.</p>
          {data && <p>Updated {formatDate(data.updated.slice(0, 10))}</p>}
          <p>United Nations Development Programme</p>
        </footer>
      </main>

      <AnimatePresence>
        {gallery && (
          <Lightbox
            key={`${gallery.items[0]?.src}-${gallery.index}`}
            items={gallery.items}
            startIndex={gallery.index}
            heading={gallery.heading}
            numberInStory={gallery.numberInStory}
            onClose={() => setGallery(null)}
          />
        )}
      </AnimatePresence>

      <CuratorBar />
    </div>
  );
}

function YearDropdown({
  years,
  selectedYear,
  onSelectYear,
  getYearCount,
}: {
  years: string[];
  selectedYear: string;
  onSelectYear: (year: string) => void;
  getYearCount: (year: string) => number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Filter archive by year. Currently selected: ${selectedYear === "All" ? "All years" : selectedYear}`}
        className={`flex items-center gap-2 border px-3 py-1.5 font-proxima-condensed text-xs font-bold uppercase tracking-[0.14em] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring sm:px-3.5 sm:py-2 ${
          isOpen
            ? "border-accent bg-card text-foreground shadow-lg"
            : selectedYear !== "All"
            ? "border-accent bg-card text-accent hover:border-accent"
            : "border-border bg-card/60 text-muted-foreground hover:border-white/30 hover:bg-card hover:text-foreground"
        }`}
      >
        <span className="text-[10px] font-semibold tracking-[0.16em] text-white/50">YEAR</span>
        <span className={selectedYear !== "All" ? "font-extrabold text-accent" : "text-foreground"}>
          {selectedYear === "All" ? "All Years" : selectedYear}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180 text-accent" : "text-muted-foreground"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="listbox"
            aria-label="Select year"
            className="absolute right-0 top-full z-40 mt-1.5 max-h-[70vh] min-w-[170px] overflow-y-auto border border-border bg-[#1c2532] py-1 shadow-2xl backdrop-blur-md"
          >
            <div className="border-b border-white/10 px-3 py-1.5 font-proxima-condensed text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              Filter by year
            </div>
            {years.map((year) => {
              const isSelected = selectedYear === year;
              const count = getYearCount(year);

              return (
                <button
                  key={year}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelectYear(year);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 font-proxima-condensed text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
                    isSelected
                      ? "bg-accent/15 text-accent font-extrabold"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 transition-opacity ${
                        isSelected ? "bg-accent opacity-100" : "opacity-0"
                      }`}
                      aria-hidden="true"
                    />
                    {year === "All" ? "All Years" : year}
                  </span>
                  <span className="font-mono text-[10px] font-semibold opacity-60">
                    {pad(count)}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StoryCard({
  story,
  featured,
  onOpen,
}: {
  story: Story;
  featured: boolean;
  onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const width = featured ? 1400 : 800;

  useEffect(() => {
    if (!hovered || story.images.length < 2) {
      setImageIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setImageIndex((current) => (current + 1) % story.images.length);
    }, 1050);

    return () => window.clearInterval(interval);
  }, [hovered, story.images.length]);

  // Fetch the next photo ahead of time so the hover preview does not flash.
  useEffect(() => {
    if (!hovered || story.images.length < 2) return;
    const next = new Image();
    next.src = sized(story.images[(imageIndex + 1) % story.images.length].src, width);
  }, [hovered, imageIndex, story.images, width]);

  // Progress dashes: at most MAX_DOTS, sliding along with the current photo.
  const dotStart = Math.min(
    Math.max(0, imageIndex - Math.floor(MAX_DOTS / 2)),
    Math.max(0, story.images.length - MAX_DOTS),
  );
  const dots = story.images.slice(dotStart, dotStart + MAX_DOTS);
  const photo = story.images[imageIndex];

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={`group relative isolate overflow-hidden bg-card text-left ${
        featured ? "sm:col-span-2 sm:row-span-2" : ""
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
        aria-label={`View photographs from: ${story.title}`}
      />

      <AnimatePresence initial={false}>
        <motion.div
          key={`${story.id}-${imageIndex}`}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-20%" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <ImageWithFallback
            src={sized(photo.src, width)}
            alt={photo.alt || story.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10 opacity-30 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100" />

      <div className="absolute left-4 top-4 flex items-center gap-2 font-proxima-condensed text-[11px] font-bold uppercase tracking-[0.14em] text-white sm:left-5 sm:top-5">
        <span className="bg-accent px-2 py-0.5 text-accent-foreground font-extrabold">{story.region}</span>
        <span className="drop-shadow-md font-semibold tracking-[0.12em]">{formatDate(story.date)}</span>
      </div>

      <a
        href={story.url}
        target="_blank"
        rel="noreferrer"
        className="absolute right-4 top-4 z-20 flex h-9 items-center gap-1.5 border border-white/40 bg-black/20 px-3 font-proxima-condensed text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring sm:right-5 sm:top-5 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
        aria-label={`Read story on Exposure: ${story.title}`}
      >
        Read story
        <ArrowUpRight size={14} strokeWidth={1.5} />
      </a>

      <div className="absolute inset-x-0 bottom-0 p-4 text-white transition-all duration-300 sm:p-5">
        <p className="mb-1.5 font-proxima-condensed text-[11px] font-bold uppercase tracking-[0.16em] text-white/80 drop-shadow">
          {story.office} · {story.location}
        </p>
        <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100">
          <div className="overflow-hidden">
            <h2 className={`max-w-3xl font-card-title font-bold leading-[1.14] tracking-[-0.015em] drop-shadow-md py-1 transition-transform duration-300 ease-out translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0 ${
              featured ? "text-2xl sm:text-4xl lg:text-5xl" : "text-xl sm:text-2xl"
            }`}>
              {story.title}
            </h2>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          {dots.map((_, offset) => (
            <span
              key={dotStart + offset}
              className={`h-[2px] transition-all duration-300 ${
                dotStart + offset === imageIndex ? "w-7 bg-accent" : "w-3 bg-white/45"
              }`}
            />
          ))}
          <span className="ml-2 font-proxima-condensed text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
            {story.images.length} {story.images.length === 1 ? "photo" : "photos"}
          </span>
        </div>
      </div>
    </article>
  );
}

function ViewTab({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`-mb-px flex items-baseline gap-2 border-b-2 pb-3 font-proxima-condensed text-base font-bold uppercase tracking-[0.12em] transition-colors ${
        active ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      <span className="text-[11px] font-semibold opacity-65">{pad(count)}</span>
    </button>
  );
}
