import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

type Mode = "best" | "investment" | "sea" | "family";
type Lang = "en" | "es";

const TAGS = [
  "quiet",
  "family",
  "investor",
  "sea",
  "walkable",
  "design",
  "modern",
  "classic",
  "green",
  "creative",
  "heritage",
  "privacy",
  "compact",
] as const;

const t = (lang: Lang) => {
  const en = {
    start: "Start a search",
    close: "Close",
    helper: "A quiet brief → then curated ranking.",
    lens: "LENS",
    lifestyle: "LIFESTYLE",
    constraints: "CONSTRAINTS",
    allDistricts: "All districts",
    anyBeds: "Any beds",
    anyPrice: "Any price",
    notes: "Optional notes (e.g., ‘quiet street, south light, renovation ok’)",
    reset: "Reset",
    view: "View matches",
    best: "Best fit",
    investment: "Investment",
    sea: "Sea",
    family: "Family",
    overlayTitle: "SHORTLIST · 72H",
    overlayHeadline: "We’ll curate your best-fit shortlist.",
    overlaySub: "Running Barcelona Lens and ranking by fit.",
    overlayMicro: "Curating shortlist…",
    all: "ALL DISTRICTS",
  };

  const es = {
    start: "Iniciar búsqueda",
    close: "Cerrar",
    helper: "Brief discreto → ranking curado.",
    lens: "ENFOQUE",
    lifestyle: "ESTILO DE VIDA",
    constraints: "CRITERIOS",
    allDistricts: "Todos los distritos",
    anyBeds: "Cualquier",
    anyPrice: "Cualquier",
    notes: "Notas opcionales (p. ej., ‘calle tranquila, luz sur, reforma ok’)",
    reset: "Reiniciar",
    view: "Ver resultados",
    best: "Mejor encaje",
    investment: "Inversión",
    sea: "Mar",
    family: "Familia",
    overlayTitle: "SELECCIÓN · 72H",
    overlayHeadline: "Curaremos tu selección con mejor encaje.",
    overlaySub: "Aplicando Barcelona Lens y ranking por encaje.",
    overlayMicro: "Curando selección…",
    all: "TODOS LOS DISTRITOS",
  };

  return lang === "es" ? es : en;
};

export default function SearchIntake({
  districts,
  lang = "en",
}: {
  districts: string[];
  lang?: Lang;
}) {
  const L = t(lang);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [mode, setMode] = useState<Mode>("best");
  const [tags, setTags] = useState<string[]>([]);
  const [district, setDistrict] = useState("");
  const [beds, setBeds] = useState(0);
  const [max, setMax] = useState(0);
  const [note, setNote] = useState("");

  // close drawer on Astro client navigation
  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener("astro:before-swap", close);
    return () => document.removeEventListener("astro:before-swap", close);
  }, []);

  const impliedTag = useMemo(() => {
    if (mode === "sea") return "sea";
    if (mode === "family") return "family";
    if (mode === "investment") return "investor";
    return "";
  }, [mode]);

  const effectiveTags = useMemo(() => {
    const s = new Set(tags);
    if (impliedTag) s.add(impliedTag);
    return Array.from(s);
  }, [tags, impliedTag]);

  const toggleTag = (t0: string) => {
    if (t0 === impliedTag) return; // lens tag locked
    setTags((prev) => (prev.includes(t0) ? prev.filter((x) => x !== t0) : [...prev, t0]));
  };

  const submit = () => {
    const sp = new URLSearchParams();
    if (mode) sp.set("mode", mode);
    if (effectiveTags.length) sp.set("tags", effectiveTags.join(","));
    if (district) sp.set("district", district);
    if (beds) sp.set("beds", String(beds));
    if (max) sp.set("max", String(max));
    if (note.trim()) sp.set("note", note.trim());

    const qs = sp.toString();
    const base = lang === "es" ? "/es/search" : "/search";
    const nextUrl = qs ? `${base}?${qs}` : base;

    setOpen(false);
    setSubmitting(true);

    window.setTimeout(() => {
      window.location.href = nextUrl;
    }, 1400);
  };

  const modeLabels =
    lang === "es"
      ? { best: L.best, investment: L.investment, sea: L.sea, family: L.family }
      : { best: L.best, investment: L.investment, sea: L.sea, family: L.family };

  return (
    <>
      <a
        href={lang === "es" ? "/es/search" : "/search"}
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className="rounded-full border border-black/15 px-3 py-1.5 text-[12px] text-black/70 hover:border-black/25 hover:text-black"
      >
        {L.start}
      </a>

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
              className="fixed right-0 top-14 z-[90] h-[calc(100vh-3.5rem)] w-[min(92vw,460px)] border-l border-black/10 bg-white"
              initial={{ x: 24, opacity: 0, filter: "blur(8px)" }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ x: 24, opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="flex h-14 items-center justify-between border-b border-black/10 px-4">
                <div className="text-[13px] font-medium tracking-tight">{L.start}</div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-black/10 px-3 py-1.5 text-[12px] text-black/70 hover:border-black/20 hover:text-black"
                >
                  {L.close}
                </button>
              </div>

              <div className="p-4">
                <div className="text-[12px] text-black/60">{L.helper}</div>

                <div className="mt-4 space-y-2">
                  <div className="text-[12px] tracking-[0.18em] text-black/50">{L.lens}</div>
                  <div className="flex flex-wrap gap-2">
                    {([
                      ["best", modeLabels.best],
                      ["investment", modeLabels.investment],
                      ["sea", modeLabels.sea],
                      ["family", modeLabels.family],
                    ] as const).map(([k, label]) => {
                      const active = mode === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setMode(k)}
                          className={[
                            "rounded-full border px-4 py-2 text-[12px]",
                            active
                              ? "border-black/25 bg-white text-black"
                              : "border-black/15 text-black/70 hover:border-black/25 hover:text-black",
                          ].join(" ")}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="text-[12px] tracking-[0.18em] text-black/50">{L.lifestyle}</div>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map((t0) => {
                      const on = effectiveTags.includes(t0);
                      const locked = t0 === impliedTag;
                      return (
                        <button
                          key={t0}
                          type="button"
                          disabled={locked}
                          onClick={() => toggleTag(t0)}
                          className={[
                            "rounded-full border px-3 py-1.5 text-[12px]",
                            on
                              ? "border-black/25 bg-white text-black"
                              : "border-black/10 text-black/60 hover:border-black/20 hover:text-black",
                            locked ? "cursor-default opacity-80" : "",
                          ].join(" ")}
                          aria-label={locked ? `${t0} (lens)` : t0}
                        >
                          {t0}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 rounded-2xl border border-black/10 bg-white p-4">
                  <div className="text-[12px] tracking-[0.18em] text-black/50">{L.constraints}</div>

                  <div className="grid gap-2">
                    <select
                      className="h-9 rounded-full border border-black/10 bg-white px-3 text-[12px] text-black/70"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    >
                      <option value="">{L.allDistricts}</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="h-9 rounded-full border border-black/10 bg-white px-3 text-[12px] text-black/70"
                        value={beds}
                        onChange={(e) => setBeds(Number(e.target.value))}
                      >
                        <option value={0}>{L.anyBeds}</option>
                        <option value={1}>1+</option>
                        <option value={2}>2+</option>
                        <option value={3}>3+</option>
                        <option value={4}>4+</option>
                      </select>

                      <select
                        className="h-9 rounded-full border border-black/10 bg-white px-3 text-[12px] text-black/70"
                        value={max}
                        onChange={(e) => setMax(Number(e.target.value))}
                      >
                        <option value={0}>{L.anyPrice}</option>
                        <option value={450000}>≤ €450k</option>
                        <option value={650000}>≤ €650k</option>
                        <option value={900000}>≤ €900k</option>
                        <option value={1300000}>≤ €1.3M</option>
                        <option value={2500000}>≤ €2.5M</option>
                      </select>
                    </div>

                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={L.notes}
                      className="min-h-[88px] rounded-2xl border border-black/10 bg-white px-3 py-2 text-[12px] text-black/70 outline-none placeholder:text-black/30"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("best");
                      setTags([]);
                      setDistrict("");
                      setBeds(0);
                      setMax(0);
                      setNote("");
                    }}
                    className="rounded-full border border-black/10 px-3 py-1.5 text-[12px] text-black/70 hover:border-black/20 hover:text-black"
                  >
                    {L.reset}
                  </button>

                  <button
                    type="button"
                    onClick={submit}
                    className="rounded-full border border-black/25 bg-white px-4 py-2 text-[12px] hover:border-black/35"
                  >
                    {L.view}
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {submitting && (
          <motion.div
            className="fixed inset-0 z-[120] bg-white/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute left-1/2 top-[20vh] -translate-x-1/2">
              <motion.div
                className="w-[min(92vw,520px)] rounded-2xl border border-black/10 bg-white p-5 shadow-[0_20px_80px_rgba(0,0,0,0.08)]"
                initial={{ y: 8, opacity: 0, filter: "blur(8px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: 8, opacity: 0, filter: "blur(8px)" }}
                transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[12px] tracking-[0.18em] text-black/50">{L.overlayTitle}</div>
                  <div className="text-[12px] text-black/50">SC-SEARCH · P 072</div>
                </div>

                <div className="mt-3 text-[18px] tracking-tight">{L.overlayHeadline}</div>
                <div className="mt-1 text-[12px] text-black/60">{L.overlaySub}</div>
                <div className="mt-2 text-[11px] tracking-[0.12em] text-black/45">{L.overlayMicro}</div>

                <div className="mt-4 rounded-full border border-black/10 bg-white p-1">
                  <div className="h-2 overflow-hidden rounded-full bg-black/5">
                    <motion.div
                      className="h-full bg-black/20"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                  </div>
                </div>

                <div className="mt-3 text-[12px] text-black/50">
                  {mode.toUpperCase()} · {district || L.all} ·{" "}
                  {effectiveTags.length ? effectiveTags.join(" · ") : "—"}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
