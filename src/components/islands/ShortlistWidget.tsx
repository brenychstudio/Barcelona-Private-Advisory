import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { Listing } from "../../data/listings";
import { useShortlist } from "../../hooks/useShortlist";

type Lang = "en" | "es";

const ui = (lang: Lang) => {
  const en = {
    button: "Shortlist",
    close: "Close",
    copied: "Copied",
    copy: "Copy link",
    clear: "Clear",
    none: "Nothing saved yet",
    saved: "saved",
    imported: "Shortlist imported from link.",
    open: "Open",
    remove: "Remove",
  };
  const es = {
    button: "Selección",
    close: "Cerrar",
    copied: "Copiado",
    copy: "Copiar enlace",
    clear: "Limpiar",
    none: "Aún no hay guardados",
    saved: "guardados",
    imported: "Selección importada desde el enlace.",
    open: "Abrir",
    remove: "Quitar",
  };
  return lang === "es" ? es : en;
};

export default function ShortlistWidget({
  listings,
  lang = "en",
  className = "",
}: {
  listings: Listing[];
  lang?: Lang;
  className?: string;
}) {
  const L = ui(lang);
  const prefix = lang === "es" ? "/es" : "";

  const { ids, count, remove, clear } = useShortlist();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imported, setImported] = useState(false);

  const items = useMemo(
    () => ids.map((id) => listings.find((x) => x.id === id)).filter(Boolean) as Listing[],
    [ids, listings]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener("astro:before-swap", close);
    return () => document.removeEventListener("astro:before-swap", close);
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("sc:shortlist_ui_open", onOpen as EventListener);
    return () => window.removeEventListener("sc:shortlist_ui_open", onOpen as EventListener);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);

    const hasShortlist = !!url.searchParams.get("shortlist");
    const openFromLink = url.searchParams.get("open_shortlist") === "1";

    if (hasShortlist) {
      setImported(true);
      window.setTimeout(() => setImported(false), 2200);
    }

    if (openFromLink) {
      setOpen(true);
      url.searchParams.delete("open_shortlist");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const copyShareLink = async () => {
    if (!ids.length) return;

    const base = lang === "es" ? "/es/search" : "/search";
    const url = new URL(base, window.location.origin);
    url.searchParams.set("shortlist", ids.join(","));
    url.searchParams.set("open_shortlist", "1");

    const text = url.toString();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy link:", text);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          "rounded-full border border-black/15 px-3 py-1.5 text-[12px] text-black/70 hover:border-black/25 hover:text-black",
          className,
        ].join(" ")}
        aria-label="Open shortlist"
      >
        {L.button}
        {count ? ` · ${count}` : ""}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-x-0 top-14 bottom-0 z-[80] bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.aside
              className="fixed right-0 top-14 z-[90] h-[calc(100vh-3.5rem)] w-[min(92vw,420px)] border-l border-black/10 bg-white"
              initial={{ x: 24, opacity: 0, filter: "blur(8px)" }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ x: 24, opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="flex h-14 items-center justify-between border-b border-black/10 px-4">
                <div className="text-[13px] font-medium tracking-tight">{L.button}</div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-black/10 px-3 py-1.5 text-[12px] text-black/70 hover:border-black/20 hover:text-black"
                >
                  {L.close}
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] text-black/60">
                    {count ? `${count} ${L.saved}` : L.none}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={copyShareLink}
                      disabled={!count}
                      className="rounded-full border border-black/10 px-3 py-1.5 text-[12px] text-black/70 disabled:opacity-40"
                    >
                      {copied ? L.copied : L.copy}
                    </button>
                    <button
                      type="button"
                      onClick={clear}
                      disabled={!count}
                      className="rounded-full border border-black/10 px-3 py-1.5 text-[12px] text-black/70 disabled:opacity-40"
                    >
                      {L.clear}
                    </button>
                  </div>
                </div>

                {imported && (
                  <div className="mt-3 rounded-2xl border border-black/10 bg-white px-3 py-2 text-[12px] text-black/60">
                    {L.imported}
                  </div>
                )}

                <div className="mt-4 grid gap-3">
                  {items.map((x) => (
                    <div key={x.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                      <div className="grid grid-cols-[96px_1fr]">
                        <div className="aspect-[4/5] bg-black/5">
                          <img src={x.images.hero} alt="" className="h-full w-full object-cover" loading="lazy" />
                        </div>
                        <div className="p-3">
                          <div className="text-[13px] font-medium">
                            {lang === "es" ? (x.title_es ?? x.title) : x.title}
                          </div>
                          <div className="mt-1 text-[12px] text-black/60">
                            {x.district} · {x.sqm} m² · €{Intl.NumberFormat("en-US").format(x.price)}
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <a
                              href={`${prefix}/p/${x.id}`}
                              className="rounded-full border border-black/15 px-3 py-1.5 text-[12px] hover:border-black/25"
                            >
                              {L.open}
                            </a>
                            <button
                              type="button"
                              onClick={() => remove(x.id)}
                              className="rounded-full border border-black/10 px-3 py-1.5 text-[12px] text-black/70 hover:border-black/20 hover:text-black"
                            >
                              {L.remove}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
