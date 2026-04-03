import { useState, useEffect, useRef } from 'preact/hooks';
import { PRCard } from '../components/PRCard';
import type { Contribution } from '../types';

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function CarouselLayout({ contributions, titleOverrides }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchMoveX = useRef(0);

  if (contributions.length === 0) return <div class="geu-empty">No contributions to display</div>;

  const len = contributions.length;

  function prev() {
    setCurrentIndex((i) => (i - 1 + len) % len);
  }

  function next() {
    setCurrentIndex((i) => (i + 1) % len);
  }

  function goTo(i: number) {
    setCurrentIndex(i);
  }

  function startAutoplay() {
    stopAutoplay();
    intervalRef.current = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % len);
    }, 5000);
  }

  function stopAutoplay() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [len]);

  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchMoveX.current = e.touches[0].clientX;
  }

  function onTouchMove(e: TouchEvent) {
    touchMoveX.current = e.touches[0].clientX;
  }

  function onTouchEnd() {
    const diff = touchStartX.current - touchMoveX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  }

  return (
    <div
      class="geu-carousel"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div class="geu-carousel-viewport">
        <div
          class="geu-carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {contributions.map((c) => (
            <div class="geu-carousel-slide" key={c.id}>
              <PRCard contribution={c} titleOverride={titleOverrides?.[c.id]} />
            </div>
          ))}
        </div>
      </div>
      <button class="geu-carousel-btn geu-carousel-prev" onClick={prev}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button class="geu-carousel-btn geu-carousel-next" onClick={next}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <div class="geu-carousel-dots">
        {contributions.map((_, i) => (
          <button
            class={`geu-carousel-dot ${i === currentIndex ? 'active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
