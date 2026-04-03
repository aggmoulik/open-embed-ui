'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PRCard } from './pr-card';
import type { Contribution } from '@/types';

interface CarouselLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function CarouselLayout({ contributions, titleOverrides }: CarouselLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (contributions.length === 0) return <EmptyState />;

  const len = contributions.length;

  function prev() {
    setCurrentIndex((i) => (i - 1 + len) % len);
  }

  function next() {
    setCurrentIndex((i) => (i + 1) % len);
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {contributions.map((c) => (
            <div key={c.id} className="w-full shrink-0 px-1">
              <PRCard contribution={c} titleOverride={titleOverrides?.[c.id]} />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={prev}
        className="absolute left-[-12px] top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-[-12px] top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronRight className="size-4" />
      </button>
      <div className="mt-3 flex justify-center gap-1.5">
        {contributions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`size-2 rounded-full transition-colors ${
              i === currentIndex ? 'bg-purple-500' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
      No contributions match these filters.
    </div>
  );
}
