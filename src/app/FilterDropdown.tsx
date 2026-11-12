import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { pad } from "./shared";

export interface DropdownOption {
  value: string;
  label: string;
  count: number;
}

// The prototype's year filter, generalised: used for years on Stories and
// collections on Best photos. "All" is always the first option.
export function FilterDropdown({
  label,
  allLabel,
  options,
  selected,
  onSelect,
  allCount,
}: {
  label: string; // short label inside the button, e.g. "Year"
  allLabel: string; // e.g. "All years"
  options: DropdownOption[];
  selected: string; // "All" or an option value
  onSelect: (value: string) => void;
  allCount: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const current = options.find((option) => option.value === selected);

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

  const all: DropdownOption = { value: "All", label: allLabel, count: allCount };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Filter by ${label.toLowerCase()}. Currently selected: ${current ? current.label : allLabel}`}
        className={`flex items-center gap-2 border px-3 py-1.5 font-proxima-condensed text-xs font-bold uppercase tracking-[0.14em] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring sm:px-3.5 sm:py-2 ${
          isOpen
            ? "border-accent bg-card text-foreground shadow-lg"
            : current
            ? "border-accent bg-card text-accent hover:border-accent"
            : "border-border bg-card/60 text-muted-foreground hover:border-white/30 hover:bg-card hover:text-foreground"
        }`}
      >
        <span className="text-[10px] font-semibold tracking-[0.16em] text-white/50">{label.toUpperCase()}</span>
        <span className={`max-w-[11rem] truncate ${current ? "font-extrabold text-accent" : "text-foreground"}`}>
          {current ? current.label : allLabel}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`shrink-0 transition-transform duration-200 ${
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
            aria-label={`Select ${label.toLowerCase()}`}
            className="absolute right-0 top-full z-40 mt-1.5 max-h-[70vh] min-w-[170px] overflow-y-auto border border-border bg-[#1c2532] py-1 shadow-2xl backdrop-blur-md"
          >
            <div className="border-b border-white/10 px-3 py-1.5 font-proxima-condensed text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              Filter by {label.toLowerCase()}
            </div>
            {[all, ...options].map((option) => {
              const isSelected = selected === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-4 whitespace-nowrap px-3 py-2 font-proxima-condensed text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
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
                    {option.label}
                  </span>
                  <span className="font-mono text-[10px] font-semibold opacity-60">
                    {pad(option.count)}
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
