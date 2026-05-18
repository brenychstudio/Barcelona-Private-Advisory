import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type WheelEvent } from "react";
import { createPortal } from "react-dom";

export type LightboxImage = { src: string; alt?: string };
type Lang = "en" | "es";

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
    readiness: "Preparacion",
    request: "Solicitar visita",
    save: "Anadir al dossier",
  };
  return lang === "es" ? es : en;
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
}) {
  const L = ui(lang);
  const shouldReduceMotion = useReducedMotion();
  const lastFocused = useRef<HTMLElement | null>(null);
  const indexRef = useRef(index);
  const imagesLengthRef = useRef(images.length);
  const wheelCooldownRef = useRef(0);
  const onCloseRef = useRef(onClose);
  const [direction, setDirection] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [present, setPresent] = useState(open);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const closeTimerRef = useRef<number | undefined>(undefined);

  const setActiveIndex = (nextIndex: number, currentIndex = index) => {
    const clamped = Math.max(0, Math.min(images.length - 1, nextIndex));
    if (clamped === currentIndex) return;
    setDirection(clamped > currentIndex ? 1 : -1);
    setPulseKey((current) => current + 1);
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
          setDirection(-1);
          setPulseKey((current) => current + 1);
          setIndex(nextIndex);
        }
      }
      if (e.key === "ArrowRight") {
        const nextIndex = Math.min(imagesLengthRef.current - 1, indexRef.current + 1);
        if (nextIndex !== indexRef.current) {
          setDirection(1);
          setPulseKey((current) => current + 1);
          setIndex(nextIndex);
        }
      }
      if (e.key === "ArrowUp") {
        const nextIndex = Math.max(0, indexRef.current - 1);
        if (nextIndex !== indexRef.current) {
          setDirection(-1);
          setPulseKey((current) => current + 1);
          setIndex(nextIndex);
        }
      }
      if (e.key === "ArrowDown") {
        const nextIndex = Math.min(imagesLengthRef.current - 1, indexRef.current + 1);
        if (nextIndex !== indexRef.current) {
          setDirection(1);
          setPulseKey((current) => current + 1);
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

  useEffect(() => {
    if (!present) return;

    [images[index - 1], images[index + 1]].forEach((image) => {
      if (!image?.src) return;
      const preload = new Image();
      preload.src = image.src;
    });
  }, [present, images, index]);

  if (!images.length || !mounted) return null;

  const src = images[index]?.src ?? images[0].src;
  const alt = images[index]?.alt ?? "";
  const previousImage = images[index - 1];
  const nextImage = images[index + 1];
  const hasMultiple = images.length > 1;
  const advisorRows = [
    { label: L.bestFor, value: context?.bestFor },
    { label: L.signal, value: context?.signal },
    { label: L.tradeOff, value: context?.tradeOff },
    { label: L.readiness, value: context?.readiness },
  ].filter((row) => row.value);

  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);
  const inspectionActive = present && !closing;
  const onWheelBrowse = (event: WheelEvent<HTMLDivElement>) => {
    if (!inspectionActive || !hasMultiple || shouldReduceMotion || Math.abs(event.deltaY) < 18) return;

    event.preventDefault();
    event.stopPropagation();

    const now = window.performance.now();
    if (now - wheelCooldownRef.current < 1050) return;
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
            transition={{ duration: shouldReduceMotion ? 0.12 : 0.82, ease: [0.16, 1, 0.3, 1] }}
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
            transition={{ duration: shouldReduceMotion ? 0.12 : 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="property-inspection-title"
              className="bcn-inspection-shell relative flex h-[calc(100dvh-16px)] w-full max-w-[1360px] flex-col overflow-hidden border border-black/10 bg-[rgb(var(--paper))] shadow-[0_30px_120px_rgba(46,43,35,0.16)] sm:h-[calc(100dvh-32px)]"
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
              transition={{ duration: shouldReduceMotion ? 0.12 : 0.82, ease: [0.16, 1, 0.3, 1] }}
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
                <div className="grid h-full min-h-0 gap-0 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_420px]">
                  <div className="bcn-inspection-media relative grid min-h-0 place-items-center p-3 sm:p-5" onWheel={onWheelBrowse}>
                    <motion.div
                      key={`pulse-${pulseKey}`}
                      className="bcn-inspection-pulse"
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: "-42%" }}
                      animate={shouldReduceMotion ? { opacity: 0 } : { opacity: [0, 0.56, 0], x: "54%" }}
                      transition={{ duration: 0.94, ease: [0.16, 1, 0.3, 1] }}
                      aria-hidden="true"
                    />
                    <div className="bcn-inspection-image-field">
                      {previousImage && (
                        <img
                          src={previousImage.src}
                          alt=""
                          className="bcn-inspection-ghost bcn-inspection-ghost--prev"
                          loading="lazy"
                          decoding="async"
                          aria-hidden="true"
                        />
                      )}
                      {nextImage && (
                        <img
                          src={nextImage.src}
                          alt=""
                          className="bcn-inspection-ghost bcn-inspection-ghost--next"
                          loading="lazy"
                          decoding="async"
                          aria-hidden="true"
                        />
                      )}
                      <AnimatePresence mode="popLayout" custom={direction}>
                        <motion.img
                          key={src}
                          src={src}
                          alt={alt}
                          className="bcn-inspection-image h-auto max-h-[calc(100dvh-260px)] w-auto max-w-full select-none object-contain shadow-[0_18px_70px_rgba(46,43,35,0.12)] sm:max-h-[76vh]"
                          custom={direction}
                          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * 26, scale: 1.018, filter: "blur(8px)" }}
                          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * -22, scale: 1.006, filter: "blur(6px)" }}
                          transition={{ duration: shouldReduceMotion ? 0.12 : 0.42, ease: [0.16, 1, 0.3, 1] }}
                          draggable={false}
                          decoding="async"
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
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`panel-${src}`}
                        className="bcn-inspection-panel__scroll min-h-0 flex-1 overflow-y-auto pr-1"
                        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(6px)" }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -5, filter: "blur(4px)" }}
                        transition={{ duration: shouldReduceMotion ? 0.12 : 0.54, delay: shouldReduceMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="text-[11px] uppercase tracking-[0.18em] text-black/42">{L.view}</div>
                        <h2 id="property-inspection-title" className="mt-3 text-[28px] leading-[1.02] tracking-tight text-black">
                          {context?.title ?? L.view}
                        </h2>
                        {context?.meta && <div className="mt-3 text-[12px] leading-[1.6] text-black/55">{context.meta}</div>}

                        <div className="bcn-inspection-current mt-5 border-y border-black/10 py-3 text-[11px] uppercase tracking-[0.16em] text-black/42">
                          {L.frame} / {String(index + 1).padStart(2, "0")} / {context?.signal ?? alt}
                        </div>

                        {context?.advisorNote && (
                          <div className="bcn-inspection-memo mt-6 border-y border-black/10 py-4">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-black/38">{L.advisorNote}</div>
                            <p className="mt-3 text-[14px] leading-[1.65] text-black/70">{context.advisorNote}</p>
                          </div>
                        )}

                        <div className="mt-5 grid gap-3">
                          {advisorRows.map((row) => (
                            <div key={row.label} className="bcn-inspection-readout border border-black/10 bg-[rgb(var(--paper))] p-3">
                              <div className="text-[10px] uppercase tracking-[0.16em] text-black/38">{row.label}</div>
                              <div className="mt-2 text-[12px] leading-[1.55] text-black/65">{row.value}</div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="mt-4 flex flex-none flex-wrap gap-2">
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
