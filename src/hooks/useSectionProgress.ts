import { useEffect, useRef, useState } from "react";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function useSectionProgress(ids: string[], smooth = 0.14) {
  const targetsRef = useRef<Record<string, number>>({});
  const [current, setCurrent] = useState<Partial<Record<string, number>>>({});

  useEffect(() => {
    ids.forEach((id) => {
      if (targetsRef.current[id] == null) targetsRef.current[id] = 0;
    });

    let raf = 0;

    const computeTargets = () => {
      const next: Record<string, number> = { ...targetsRef.current };
      const vh = window.innerHeight || 1;

      for (const id of ids) {
        const el = document.querySelector(`[data-section="${id}"]`) as HTMLElement | null;
        if (!el) continue;

        const r = el.getBoundingClientRect();
        const start = vh * 0.85;
        const end = vh * 0.15;
        next[id] = clamp01((start - r.top) / (start - end));
      }

      targetsRef.current = next;
    };

    const step = () => {
      setCurrent((prev) => {
        const out: Partial<Record<string, number>> = { ...prev };
        let changed = false;

        for (const id of ids) {
          const a = prev[id] ?? 0;
          const b = targetsRef.current[id] ?? 0;
          const n = Math.abs(b - a) < 0.001 ? b : lerp(a, b, smooth);
          if (n !== a) changed = true;
          out[id] = n;
        }

        return changed ? out : prev;
      });

      raf = requestAnimationFrame(step);
    };

    const onScroll = () => computeTargets();
    const onResize = () => computeTargets();

    computeTargets();
    raf = requestAnimationFrame(step);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [ids, smooth]);

  return current;
}
