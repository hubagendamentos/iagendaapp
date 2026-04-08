import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ChipItem {
  id: string;
  label: string;
}

interface ScrollableChipsProps {
  items: ChipItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function ScrollableChips({ items, selectedId, onSelect, className }: ScrollableChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, items]);

  return (
    <div className={cn("relative", className)}>
      {/* Fade left */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none transition-opacity duration-200",
          "bg-gradient-to-r from-background to-transparent",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Scrollable container */}
      <div
        ref={containerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-all duration-150",
              selectedId === item.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-foreground border-border hover:bg-accent hover:border-accent"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Fade right */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none transition-opacity duration-200",
          "bg-gradient-to-r from-transparent to-background",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
