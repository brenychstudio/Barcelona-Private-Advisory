import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type WheelEvent } from "react";
import { createPortal } from "react-dom";

export type LightboxImage = { src: string; alt?: string };
type Lang = "en" | "es";
type InspectionOrientation = "landscape" | "portrait" | "square";
type InspectSize = {
  shellWidth: string;
  mediaWidth: string;
  photoMaxHeight: string;
  columns: string;
  gap: string;
};

export type LightboxChamberContext = {
  title: string;
  meta: string;
  advisorNote?: string;
  bestFor?: string;
  signal?: string;
  tradeOff?: string;
  readiness?: string;
  requestLabel: string;
  saveLabel: string;
  savedLabel: string;
  isSaved: boolean;
};

const ui = (lang: Lang) => {
  const en = {
    prev: "Prev",
    next: "Next",
    close: "Close",
    hint: "ESC to close / arrows to navigate",
    view: "Private inspection",
    frame: "Frame signal",
    advisorNote: "Advisor note",
    bestFor: "Best for",
    signal: "Signal",
    tradeOff: "Trade-off",
    readiness: "Readiness",
    request: "Request viewing path",
    save: "Add to dossier",
  };
  const es = {
    prev: "Ant.",
    next: "Sig.",
    close: "Cerrar",
    hint: "ESC para cerrar / flechas para navegar",
    view: "Inspección privada",
    frame: "Señal de cuadro",
    advisorNote: "Memo del asesor",
    bestFor: "Ideal para",
    signal: "Señal",
    tradeOff: "Trade-off",
    readiness: "Preparación",
    request: "Solicitar visita",
    save: "Añadir al dossier",
  };
  return lang === "es" ? es : en;
};

const getInspectSize = (ratio?: number): InspectSize => {
  if (!ratio) {
    return {
      shellWidth: "min(92rem, calc(100vw - 2rem))",
      mediaWidth: "min(62rem, 100%)",
      photoMaxHeight: "min(calc(100dvh - 8rem), 58rem)",
      columns: "minmax(0, min(64rem, 70vw)) minmax(18rem, 21rem)",
      gap: "clamp(0.65rem, 1.15vw, 1.2rem)",
    };
  }

  if (ratio > 1.6) {
    return {
      shellWidth: "min(96rem, calc(100vw - 2rem))",
      mediaWidth: "min(68rem, 100%)",
      photoMaxHeight: "min(calc(100dvh - 8.75rem), 52rem)",
      columns: "minmax(0, min(68rem, 72vw)) minmax(18rem, 22rem)",
      gap: "clamp(0.55rem, 1vw, 1.1rem)",
    };
  }

  if (ratio > 1.16) {
    return {
      shellWidth: "min(94rem, calc(100vw - 2rem))",
      mediaWidth: "min(66rem, 100%)",
      photoMaxHeight: "min(calc(100dvh - 8.75rem), 54rem)",
      columns: "minmax(0, min(66rem, 72vw)) minmax(18rem, 22rem)",
      gap: "clamp(0.55rem, 1vw, 1.1rem)",
    };
  }

  if (ratio < 0.86) {
    return {
      shellWidth: "min(78rem, calc(100vw - 2rem))",
      mediaWidth: "min(44rem, 100%)",
      photoMaxHeight: "min(calc(100dvh - 8rem), 62rem)",
      columns: "minmax(0, min(46rem, 58vw)) minmax(18rem, 21rem)",
      gap: "clamp(0.45rem, 0.85vw, 0.95rem)",
    };
  }

  return {
    shellWidth: "min(92rem, calc(100vw - 2rem))",
    mediaWidth: "min(62rem, 100%)",
    photoMaxHeight: "min(calc(100dvh - 8rem), 58rem)",
    columns: "minmax(0, min(64rem, 70vw)) minmax(18rem, 21rem)",
    gap: "clamp(0.65rem, 1.15vw, 1.2rem)",
  };
};

export default function Lightbox({
  open,
  images,
  index,
  setIndex,
  onClose,
  lang = "en",
  context,
  onRequestAction,
  onSaveAction,
  onImageError,
}: {
  open: boolean;
  images: LightboxImage[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
  lang?: Lang;
  context?: LightboxChamberContext;
  onRequestAction?: () => void;
  onSaveAction?: () => void;
  onImageError?: (src: string) => void;
}) {
  const L = ui(lang);
  const shouldReduceMotion = useReducedMotion();
  const lastFocused = useRef<HTMLElement | null>(null);
  const indexRef = useRef(index);
  const imagesLengthRef = useRef(images.length);
  const wheelCooldownRef = useRef(0);
  const onCloseRef = useRef(onClose);
  const [mounted, setMounted] = useState(false);
  const [present, setPresent] = useState(open);
  const [closing, setClosing] = useState(false);
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});
  const closingRef = useRef(false);
  const closeTimerRef = useRef<number | undefined>(undefined);

  const setActiveIndex = (nextIndex: number, currentIndex = index) => {
    const clamped = Math.max(0, Math.min(images.length - 1, nextIndex));
    if (clamped === currentIndex) return;
    setIndex(clamped);
  };

  const goTo = (nextIndex: number) => setActiveIndex(nextIndex, index);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current !== undefined) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = undefined;
      }
      closingRef.current = false;
      setPresent(true);
      setClosing(false);
      return;
    }

    if (!present) return;

    closingRef.current = true;
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setPresent(false);
      setClosing(false);
      closingRef.current = false;
      closeTimerRef.current = undefined;
    }, shouldReduceMotion ? 160 : 920);
  }, [open, present, shouldReduceMotion]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== undefined) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    indexRef.current = index;
    imagesLengthRef.current = images.length;
  }, [index, images.length]);

  useEffect(() => {
    if (!present) return;

    lastFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.setAttribute("data-bcn-inspection", "open");

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        requestClose();
        return;
      }
      if (closingRef.current) return;
      if (e.key === "ArrowLeft") {
        const nextIndex = Math.max(0, indexRef.current - 1);
        if (nextIndex !== indexRef.current) {
          setIndex(nextIndex);
        }
      }
      if (e.key === "ArrowRight") {
        const nextIndex = Math.min(imagesLengthRef.current - 1, indexRef.current + 1);
        if (nextIndex !== indexRef.current) {
          setIndex(nextIndex);
        }
      }
      if (e.key === "ArrowUp") {
        const nextIndex = Math.max(0, indexRef.current - 1);
        if (nextIndex !== indexRef.current) {
          setIndex(nextIndex);
        }
      }
      if (e.key === "ArrowDown") {
        const nextIndex = Math.min(imagesLengthRef.current - 1, indexRef.current + 1);
        if (nextIndex !== indexRef.current) {
          setIndex(nextIndex);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.removeAttribute("data-bcn-inspection");
      window.dispatchEvent(new CustomEvent("bcn:inspection", { detail: { active: false } }));
      window.removeEventListener("keydown", onKey);
      window.requestAnimationFrame(() => lastFocused.current?.focus());
    };
  }, [present, requestClose, setIndex]);

  useEffect(() => {
    if (!present || closing) return;

    window.dispatchEvent(new CustomEvent("bcn:inspection", {
      detail: {
        active: true,
        index,
        total: images.length,
        title: context?.title,
      },
    }));
  }, [closing, present, index, images.length, context?.title]);

  const recordImageRatio = useCallback((imageSrc: string, width: number, height: number) => {
    if (!imageSrc || !width || !height) return;
    const ratio = width / height;
    setImageRatios((current) => {
      if (current[imageSrc] === ratio) return current;
      return { ...current, [imageSrc]: ratio };
    });
  }, []);

  useEffect(() => {
    if (!present) return;

    images.forEach((image) => {
      if (!image?.src) return;
      const preload = new Image();
      preload.onload = () => recordImageRatio(image.src, preload.naturalWidth, preload.naturalHeight);
      preload.src = image.src;
    });
  }, [present, images, recordImageRatio]);
  const advisorRows = useMemo(
    () =>
      [
        { label: L.bestFor, value: context?.bestFor },
        { label: L.signal, value: context?.signal },
        { label: L.tradeOff, value: context?.tradeOff },
        { label: L.readiness, value: context?.readiness },
      ].filter((row) => row.value),
    [L.bestFor, L.readiness, L.signal, L.tradeOff, context?.bestFor, context?.readiness, context?.signal, context?.tradeOff]
  );

  if (!images.length || !mounted) return null;

  const src = images[index]?.src ?? images[0].src;
  const alt = images[index]?.alt ?? "";
  const activeRatio = imageRatios[src];
  const inspectSize = getInspectSize(activeRatio);
  const inspectStyle = {
    "--inspect-shell-width": inspectSize.shellWidth,
    "--inspect-media-width": inspectSize.mediaWidth,
    "--inspect-photo-max-height": inspectSize.photoMaxHeight,
    "--inspect-columns": inspectSize.columns,
    "--inspect-gap": inspectSize.gap,
  } as CSSProperties;
  const activeOrientation: InspectionOrientation = activeRatio
    ? activeRatio > 1.16
      ? "landscape"
      : activeRatio < 0.86
      ? "portrait"
      : "square"
    : "square";
  const hasMultiple = images.length > 1;

  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);
  const inspectionActive = present && !closing;
  const onWheelBrowse = (event: WheelEvent<HTMLDivElement>) => {
    if (!inspectionActive || !hasMultiple || shouldReduceMotion || Math.abs(event.deltaY) < 18) return;

    event.preventDefault();
    event.stopPropagation();

    const now = window.performance.now();
    if (now - wheelCooldownRef.current < 280) return;
    wheelCooldownRef.current = now;

    setActiveIndex(indexRef.current + (event.deltaY > 0 ? 1 : -1), indexRef.current);
  };

  return createPortal(
    <AnimatePresence>
      {present && (
        <>
          <motion.div
            className={[
              "bcn-inspection-backdrop fixed inset-0 z-[230] bg-[rgba(242,240,234,0.82)] backdrop-blur-sm",
              inspectionActive ? "pointer-events-auto" : "pointer-events-none",
            ].join(" ")}
            initial={{ opacity: 0 }}
            animate={{ opacity: inspectionActive ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.12 : 0.72, ease: [0.16, 1, 0.3, 1] }}
            onClick={requestClose}
          />

          <motion.div
            className={[
              "bcn-inspection-viewport fixed inset-0 z-[240] flex items-center justify-center p-2 sm:p-4",
              inspectionActive ? "pointer-events-auto" : "pointer-events-none",
            ].join(" ")}
            initial={{ opacity: 0 }}
            animate={shouldReduceMotion
              ? { opacity: inspectionActive ? 1 : 0 }
              : {
                  opacity: inspectionActive ? 1 : 0,
                  filter: inspectionActive ? "blur(0px)" : "blur(8px)",
                }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: shouldReduceMotion ? 0.12 : 0.76, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="property-inspection-title"
              data-orientation={activeOrientation}
              style={inspectStyle}
              className="bcn-inspection-shell bcn-inspection-shell--data-sized relative flex h-[calc(100dvh-16px)] w-full max-w-[1360px] flex-col overflow-hidden border border-black/10 bg-[rgb(var(--paper))] shadow-[0_30px_120px_rgba(46,43,35,0.16)] sm:h-[calc(100dvh-32px)]"
              initial={shouldReduceMotion ? { opacity: 0 } : { y: 10, opacity: 0 }}
              animate={shouldReduceMotion
                ? { opacity: inspectionActive ? 1 : 0 }
                : {
                    y: inspectionActive ? 0 : 18,
                    scale: inspectionActive ? 1 : 0.982,
                    opacity: inspectionActive ? 1 : 0,
                    filter: inspectionActive ? "blur(0px)" : "blur(10px)",
                  }}
              exit={shouldReduceMotion ? { opacity: 0 } : { y: 18, scale: 0.982, opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: shouldReduceMotion ? 0.12 : 0.78, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bcn-inspection-topbar z-10 flex flex-none flex-wrap items-center gap-2 border-b border-black/10 bg-[rgb(var(--paper))] px-3 py-3">
                <div className="min-w-[180px] text-[11px] tracking-[0.18em] text-black/50">
                  {L.view} / {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </div>
                <div className="bcn-inspection-sequence hidden flex-1 items-center gap-1 sm:flex">
                  {images.map((image, i) => (
                    <button
                      key={`sequence-${image.src}`}
                      type="button"
                      onClick={() => goTo(i)}
                      className={[
                        "bcn-inspection-segment",
                        i === index ? "bcn-inspection-segment--active" : "",
                      ].join(" ")}
                      aria-label={`Open image ${i + 1}`}
                    />
                  ))}
                </div>

                <div className="ml-auto flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={prev}
                    disabled={!hasMultiple || index === 0}
                    className="bcn-inspection-topbar__button border border-black/10 px-3 py-1.5 text-[12px] text-black/70 outline-none hover:border-black/20 focus-visible:ring-2 focus-visible:ring-black/20 disabled:opacity-40"
                  >
                    {L.prev}
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={!hasMultiple || index === images.length - 1}
                    className="bcn-inspection-topbar__button border border-black/10 px-3 py-1.5 text-[12px] text-black/70 outline-none hover:border-black/20 focus-visible:ring-2 focus-visible:ring-black/20 disabled:opacity-40"
                  >
                    {L.next}
                  </button>
                  <button
                    type="button"
                    onClick={requestClose}
                    className="bcn-inspection-close-control border border-black/15 bg-white px-3 py-1.5 text-[12px] outline-none hover:border-black/25 focus-visible:ring-2 focus-visible:ring-black/20"
                  >
                    <span>{L.close}</span>
                    <span aria-hidden="true">x</span>
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                <div
                  className="bcn-inspection-layout bcn-inspection-layout--data-sized grid h-full min-h-0 gap-0 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_420px]"
                  data-orientation={activeOrientation}
                >
                  <div
                    className="bcn-inspection-media bcn-inspection-media--data-sized relative grid min-h-0 place-items-center p-3 sm:p-5"
                    data-orientation={activeOrientation}
                    onWheel={onWheelBrowse}
                  >
                    <div className="bcn-inspection-image-field bcn-inspection-image-field--data-sized" data-orientation={activeOrientation}>
                      <AnimatePresence initial={false}>
                        <motion.img
                          key={src}
                          src={src}
                          alt={alt}
                          data-orientation={activeOrientation}
                          className="bcn-inspection-image bcn-inspection-image--data-sized h-auto max-h-[calc(100dvh-260px)] w-auto max-w-full select-none object-contain shadow-[0_18px_70px_rgba(46,43,35,0.12)] sm:max-h-[76vh]"
                          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.997 }}
                          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.997 }}
                          transition={{ duration: shouldReduceMotion ? 0.1 : 0.3, ease: [0.22, 0.8, 0.24, 1] }}
                          draggable={false}
                          loading="eager"
                          decoding="async"
                          fetchPriority="high"
                          onLoad={(event) => {
                            const image = event.currentTarget;
                            recordImageRatio(src, image.naturalWidth, image.naturalHeight);
                          }}
                          onError={() => onImageError?.(src)}
                        />
                      </AnimatePresence>
                    </div>
                    {hasMultiple && (
                      <>
                        <button
                          type="button"
                          onClick={prev}
                          disabled={index === 0}
                          className="bcn-inspection-nav-zone bcn-inspection-nav-zone--prev"
                          aria-label={L.prev}
                        >
                          <span>{L.prev}</span>
                        </button>
                        <button
                          type="button"
                          onClick={next}
                          disabled={index === images.length - 1}
                          className="bcn-inspection-nav-zone bcn-inspection-nav-zone--next"
                          aria-label={L.next}
                        >
                          <span>{L.next}</span>
                        </button>
                      </>
                    )}
                  </div>

                  <motion.aside
                    className="bcn-inspection-panel flex min-h-0 flex-col overflow-hidden border-t border-black/10 bg-white p-4 lg:border-l lg:border-t-0 xl:p-5"
                    initial={shouldReduceMotion ? { opacity: 0 } : { x: 12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { x: 8, opacity: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0.12 : 0.24, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <div className="bcn-inspection-panel__scroll bcn-inspection-rail min-h-0 flex-1 overflow-y-auto pr-1">
                      <div className="bcn-inspection-rail__eyebrow">{L.view}</div>
                      <h2 id="property-inspection-title" className="bcn-inspection-rail__title mt-3 text-[28px] leading-[1.02] tracking-tight text-black">
                        {context?.title ?? L.view}
                      </h2>
                      {context?.meta && <div className="bcn-inspection-rail__meta mt-3 text-[12px] leading-[1.6]">{context.meta}</div>}

                      <div className="bcn-inspection-frame-strip mt-5">
                        <span>{L.frame}</span>
                        <strong>{String(index + 1).padStart(2, "0")}</strong>
                        <em>{context?.signal ?? alt}</em>
                      </div>

                      {context?.advisorNote && (
                        <div className="bcn-inspection-advisor-note mt-6">
                          <div className="bcn-inspection-advisor-note__label">{L.advisorNote}</div>
                          <p>{context.advisorNote}</p>
                        </div>
                      )}

                      <div className="bcn-inspection-readout-group mt-5">
                        {advisorRows.map((row) => (
                          <div key={row.label} className="bcn-inspection-readout-row">
                            <div className="bcn-inspection-readout-row__label">{row.label}</div>
                            <div className="bcn-inspection-readout-row__value">{row.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bcn-inspection-actions mt-4 flex flex-none flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={onRequestAction}
                        className="rounded-full border border-black/25 bg-[var(--bcn-graphite)] px-4 py-2 text-[12px] text-[var(--bcn-porcelain)] outline-none hover:border-black/35 focus-visible:ring-2 focus-visible:ring-black/20"
                      >
                        {context?.requestLabel ?? L.request}
                      </button>
                      <button
                        type="button"
                        onClick={onSaveAction}
                        className="rounded-full border border-black/10 px-4 py-2 text-[12px] text-black/70 outline-none hover:border-black/20 hover:text-black focus-visible:ring-2 focus-visible:ring-black/20"
                      >
                        {context?.isSaved ? context.savedLabel : context?.saveLabel ?? L.save}
                      </button>
                    </div>
                  </motion.aside>
                </div>
              </div>

              <div className="bcn-inspection-thumbs flex-none border-t border-black/10 bg-[rgb(var(--paper))] p-2 sm:p-3">
                <div className="bcn-inspection-thumbs-track flex gap-2 overflow-x-auto">
                  {images.map((im, i) => (
                    <button
                      key={im.src}
                      type="button"
                      onClick={() => goTo(i)}
                      className={[
                        "bcn-inspection-thumb relative h-12 w-14 flex-none overflow-hidden border bg-white outline-none focus-visible:ring-2 focus-visible:ring-black/20 sm:h-14 sm:w-[72px]",
                        i === index ? "bcn-inspection-thumb--active border-black/25" : "border-black/10 hover:border-black/20",
                      ].join(" ")}
                      aria-label={`Open image ${i + 1}`}
                      aria-current={i === index ? "true" : undefined}
                    >
                      <img
                        src={im.src}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        onLoad={(event) => {
                          const image = event.currentTarget;
                          recordImageRatio(im.src, image.naturalWidth, image.naturalHeight);
                        }}
                        onError={() => onImageError?.(im.src)}
                      />
                    </button>
                  ))}
                </div>

                <div className="mt-2 hidden text-[11px] text-black/45 sm:block">{L.hint}</div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
