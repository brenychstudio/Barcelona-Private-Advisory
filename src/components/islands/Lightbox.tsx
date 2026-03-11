import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

export type LightboxImage = { src: string; alt?: string };

export default function Lightbox({
  open,
  images,
  index,
  setIndex,
  onClose,
}: {
  open: boolean;
  images: LightboxImage[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex(Math.max(0, index - 1));
      if (e.key === "ArrowRight") setIndex(Math.min(images.length - 1, index + 1));
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, index, images.length, onClose, setIndex]);

  if (!images.length) return null;

  const src = images[index]?.src ?? images[0].src;
  const alt = images[index]?.alt ?? "";

  const prev = () => setIndex(Math.max(0, index - 1));
  const next = () => setIndex(Math.min(images.length - 1, index + 1));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[140] bg-black/35 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-[150] grid place-items-center px-4 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-[min(92vw,980px)] rounded-2xl border border-black/10 bg-white shadow-[0_30px_120px_rgba(0,0,0,0.18)]"
              initial={{ y: 10, opacity: 0, filter: "blur(10px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: 10, opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* top bar */}
              <div className="flex h-12 items-center justify-between border-b border-black/10 px-3">
                <div className="text-[11px] tracking-[0.18em] text-black/50">
                  VIEW · {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prev}
                    disabled={index === 0}
                    className="rounded-full border border-black/10 px-3 py-1.5 text-[12px] text-black/70 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={index === images.length - 1}
                    className="rounded-full border border-black/10 px-3 py-1.5 text-[12px] text-black/70 disabled:opacity-40"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-black/15 px-3 py-1.5 text-[12px] hover:border-black/25"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* image */}
              <div className="bg-black/5">
                <div className="grid place-items-center p-3">
                  <motion.img
                    key={src}
                    src={src}
                    alt={alt}
                    className="max-h-[70vh] w-auto max-w-full select-none rounded-xl object-contain"
                    initial={{ opacity: 0, filter: "blur(10px)", scale: 1.01 }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                    exit={{ opacity: 0, filter: "blur(10px)", scale: 1.01 }}
                    transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                    draggable={false}
                  />
                </div>
              </div>

              {/* thumbs */}
              <div className="border-t border-black/10 p-3">
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((im, i) => (
                    <button
                      key={im.src}
                      type="button"
                      onClick={() => setIndex(i)}
                      className={[
                        "relative overflow-hidden rounded-xl border bg-white",
                        i === index ? "border-black/25" : "border-black/10 hover:border-black/20",
                      ].join(" ")}
                      style={{ width: 72, height: 56 }}
                      aria-label={`Open image ${i + 1}`}
                    >
                      <img
                        src={im.src}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>

                <div className="mt-2 text-[11px] text-black/45">
                  ESC to close · ← → to navigate
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
