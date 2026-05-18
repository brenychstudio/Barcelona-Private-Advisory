import { useEffect, useMemo, useState } from "react";
import { buyerIntents, districtLens, type BuyerIntentId } from "../../data/barcelonaLens";
import type { Listing } from "../../data/listings";
import { getListingAdvisoryCopy } from "../../lib/getListingAdvisoryCopy";
import ShortlistToggle from "./ShortlistToggle";

type Mode = "best" | "investment" | "sea" | "family";
type Lang = "en" | "es";

const searchModeByIntentId: Record<BuyerIntentId, Mode> = {
  "family-calm": "family",
  "sea-light": "sea",
  "investment-logic": "investment",
  "design-renovation": "best",
  privacy: "best",
  "walkable-daily-life": "best",
};

function isBuyerIntentId(value: string | null): value is BuyerIntentId {
  return Boolean(value && buyerIntents.some((intent) => intent.id === value));
}

function districtNameForSearchParam(value: string) {
  const district = districtLens.find((item) => item.id === value);
  return district?.name ?? value;
}

const TAGS = [
  { key: "quiet", en: "quiet", es: "tranquilo" },
  { key: "family", en: "family", es: "familia" },
  { key: "investor", en: "investor", es: "inversión" },
  { key: "sea", en: "sea", es: "mar" },
  { key: "walkable", en: "walkable", es: "caminable" },
  { key: "design", en: "design", es: "diseño" },
  { key: "modern", en: "modern", es: "moderno" },
  { key: "classic", en: "classic", es: "clásico" },
  { key: "green", en: "green", es: "verde" },
  { key: "creative", en: "creative", es: "creativo" },
  { key: "heritage", en: "heritage", es: "patrimonio" },
  { key: "privacy", en: "privacy", es: "privacidad" },
  { key: "compact", en: "compact", es: "compacto" },
] as const;

const fmtEUR = (n: number) => Intl.NumberFormat("en-US").format(n);

const ui = (lang: Lang) => {
  const en = {
    eyebrow: "PRIVATE SEARCH SURFACE",
    headline: "A buyer brief, translated into advisory shortlist logic.",
    subcopy: "Select intent, district fit and lifestyle signals. The interface ranks by usefulness, not listing volume.",
    showroomNote: "Curated recommendations, not a property portal.",
    candidateLabel: "Curated recommendation",
    curationAxis: "Intent -> district lens -> property signal",
    buyerIntent: "Buyer intent",
    showingContext: "Showing ranked options for",
    rankedSuffix: "advisory-ranked candidates",
    rankedNote: "Ranked by intent fit, district logic and viewing readiness.",
    reset: "Reset brief",
    allDistricts: "All districts",
    anyBeds: "Any beds",
    anyPrice: "Any price",
    best: "Best fit",
    investment: "Investment",
    sea: "Sea light",
    family: "Family calm",
    briefLifestyle: "Lifestyle signals",
    briefDistrict: "District fit",
    briefBeds: "Bedrooms",
    briefMax: "Budget",
    briefNote: "Note",
    bd: "bd",
    ba: "ba",
    bestFor: "Best for",
    signal: "Signal",
    tradeOff: "Trade-off",
    riskNote: "Risk note",
    readiness: "Readiness",
    priority: "Priority",
    request: "Request viewing path",
    open: "Open property",
    filters: {
      intent: "Intent",
      lifestyle: "Lifestyle signal",
      district: "District fit",
      beds: "Bedrooms",
      budget: "Budget",
    },
  };

  const es = {
    eyebrow: "SUPERFICIE DE BÚSQUEDA PRIVADA",
    headline: "Un brief del comprador traducido en lógica de selección asesorada.",
    subcopy: "Selecciona intención, ajuste de distrito y señales de estilo de vida. La interfaz prioriza utilidad, no volumen.",
    showroomNote: "Recomendaciones curadas, no un portal inmobiliario.",
    candidateLabel: "Recomendación curada",
    curationAxis: "Intent -> lens de distrito -> señal del inmueble",
    buyerIntent: "Intención del comprador",
    showingContext: "Mostrando opciones priorizadas para",
    rankedSuffix: "opciones priorizadas por asesoría",
    rankedNote: "Ordenadas por ajuste de intención, lógica de distrito y preparación para visita.",
    reset: "Reiniciar brief",
    allDistricts: "Todos los distritos",
    anyBeds: "Cualquier",
    anyPrice: "Cualquier",
    best: "Mejor ajuste",
    investment: "Inversión",
    sea: "Luz mediterránea",
    family: "Calma familiar",
    briefLifestyle: "Señales de estilo de vida",
    briefDistrict: "Ajuste de distrito",
    briefBeds: "Dormitorios",
    briefMax: "Presupuesto",
    briefNote: "Nota",
    bd: "hab",
    ba: "baños",
    bestFor: "Ideal para",
    signal: "Señal",
    tradeOff: "Compensación",
    riskNote: "Nota de riesgo",
    readiness: "Preparación",
    priority: "Prioridad",
    request: "Solicitar ruta de visita",
    open: "Abrir propiedad",
    filters: {
      intent: "Intención",
      lifestyle: "Señal lifestyle",
      district: "Ajuste de distrito",
      beds: "Dormitorios",
      budget: "Presupuesto",
    },
  };

  return lang === "es" ? es : en;
};

function scoreListing(
  x: Listing,
  mode: Mode,
  selectedTags: string[],
  district: string,
  minBeds: number,
  maxPrice: number,
) {
  let s = 0;

  if (district && x.district.toLowerCase() !== district.toLowerCase()) s -= 2;
  if (minBeds && x.beds < minBeds) s -= 2;
  if (maxPrice && x.price > maxPrice) s -= 2;

  const set = new Set(x.tags || []);
  for (const t of selectedTags) if (set.has(t)) s += 2;

  if (mode === "sea") s += set.has("sea") ? 6 : -2;

  if (mode === "family") {
    s += set.has("family") ? 6 : -2;
    s += set.has("quiet") ? 1 : 0;
  }

  if (mode === "investment") {
    const ppsm = x.price / Math.max(1, x.sqm);
    s += ppsm < 8000 ? 3 : ppsm < 11000 ? 1 : -1;
    s += set.has("investor") ? 3 : 0;
  }

  s += x.sqm >= 90 ? 1 : 0;
  return s;
}

function titleFor(listing: Listing, lang: Lang) {
  return lang === "es" ? listing.title_es ?? listing.title : listing.title;
}

function districtFor(listing: Listing) {
  return listing.districtLabel || listing.district || "Barcelona";
}

function openInquiry(detail: Record<string, unknown>) {
  window.dispatchEvent(new CustomEvent("bcn:inquiry_open", { detail }));
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothPresence(value: number) {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
}

export default function SearchExperience({
  listings,
  lang = "en",
}: {
  listings: Listing[];
  lang?: Lang;
}) {
  const L = ui(lang);
  const prefix = lang === "es" ? "/es" : "";

  const [mode, setMode] = useState<Mode>("best");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [district, setDistrict] = useState<string>("");
  const [minBeds, setMinBeds] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  const [queryContextActive, setQueryContextActive] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);

    const intent = sp.get("intent");
    if (isBuyerIntentId(intent)) setMode(searchModeByIntentId[intent]);

    const m = sp.get("mode");
    if (m === "best" || m === "investment" || m === "sea" || m === "family") setMode(m);

    const t = sp.get("tags");
    if (t) {
      const next = t
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      setSelectedTags(next);
    }

    const d = sp.get("district");
    if (d) setDistrict(districtNameForSearchParam(d));
    setQueryContextActive(Boolean(intent || d));

    const b = Number(sp.get("beds") || "0");
    if (!Number.isNaN(b)) setMinBeds(b);

    const mx = Number(sp.get("max") || "0");
    if (!Number.isNaN(mx)) setMaxPrice(mx);

    const n = sp.get("note");
    if (n) setNote(n);
  }, []);

  const districts = useMemo(() => {
    const s = new Set(listings.map((x) => x.district).filter(Boolean));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [listings]);

  const effectiveTags = useMemo(() => {
    if (mode === "sea") return Array.from(new Set([...selectedTags, "sea"]));
    if (mode === "family") return Array.from(new Set([...selectedTags, "family"]));
    if (mode === "investment") return Array.from(new Set([...selectedTags, "investor"]));
    return selectedTags;
  }, [mode, selectedTags]);

  const modeLabel = useMemo(() => {
    if (mode === "best") return L.best;
    if (mode === "investment") return L.investment;
    if (mode === "sea") return L.sea;
    return L.family;
  }, [mode, L.best, L.family, L.investment, L.sea]);

  const tagLabel = (key: string) => {
    const meta = TAGS.find((x) => x.key === key);
    if (!meta) return key;
    return lang === "es" ? meta.es : meta.en;
  };

  const brief = useMemo(() => {
    const parts: string[] = [`${L.buyerIntent}: ${modeLabel}`];
    if (effectiveTags.length) parts.push(`${L.briefLifestyle}: ${effectiveTags.map(tagLabel).join(" / ")}`);
    if (district) parts.push(`${L.briefDistrict}: ${district}`);
    if (minBeds) parts.push(`${L.briefBeds}: ${minBeds}+`);
    if (maxPrice) parts.push(`${L.briefMax}: EUR ${fmtEUR(maxPrice)}`);
    if (note.trim()) parts.push(`${L.briefNote}: ${note.trim()}`);
    return parts.join(" / ");
  }, [
    L.briefBeds,
    L.briefDistrict,
    L.briefLifestyle,
    L.briefMax,
    L.briefNote,
    L.buyerIntent,
    district,
    effectiveTags,
    maxPrice,
    minBeds,
    modeLabel,
    note,
    lang,
  ]);

  const searchContextLabel = district ? `${modeLabel} / ${district}` : modeLabel;

  const results = useMemo(() => {
    const scored = listings.map((x) => ({
      x,
      s: scoreListing(x, mode, effectiveTags, district, minBeds, maxPrice),
    }));

    scored.sort((a, b) => b.s - a.s || (a.x.shortlistPriority ?? 99) - (b.x.shortlistPriority ?? 99));

    return scored
      .filter(({ x }) => {
        if (district && x.district.toLowerCase() !== district.toLowerCase()) return false;
        if (minBeds && x.beds < minBeds) return false;
        if (maxPrice && x.price > maxPrice) return false;
        return true;
      })
      .map((r) => r.x);
  }, [listings, mode, effectiveTags, district, minBeds, maxPrice]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cards: HTMLElement[] = [];
    let frame = 0;
    let disposed = false;

    const states = new Map<HTMLElement, { current: number; target: number }>();

    const collect = () => {
      cards = Array.from(document.querySelectorAll<HTMLElement>("[data-bcn-search-card]"));
      for (const card of cards) {
        if (!states.has(card)) states.set(card, { current: 0, target: 0 });
      }
    };

    const setNeutral = () => {
      for (const card of cards) {
        card.style.setProperty("--candidate-presence", "1");
        card.style.setProperty("--candidate-media-y", "0px");
        card.style.setProperty("--candidate-media-scale", "1");
        card.style.setProperty("--candidate-copy-y", "0px");
        card.style.setProperty("--candidate-shadow-alpha", "0.045");
        card.style.setProperty("--candidate-surface-alpha", "0.72");
      }
    };

    const render = () => {
      frame = 0;
      if (disposed || reduceMotion.matches) return;

      const intensity = window.innerWidth <= 720 ? 0.45 : 1;
      let needsNext = false;

      for (const card of cards) {
        const state = states.get(card);
        if (!state) continue;

        state.current += (state.target - state.current) * 0.12;
        if (Math.abs(state.target - state.current) > 0.003) needsNext = true;

        const presence = clamp01(state.current);
        const mediaY = (1 - presence) * 10 * intensity;
        const mediaScale = 1 + presence * 0.025 * intensity;
        const copyY = (1 - presence) * 4 * intensity;
        const shadowAlpha = 0.04 + presence * 0.075 * intensity;
        const surfaceAlpha = 0.68 + presence * 0.1 * intensity;

        card.style.setProperty("--candidate-presence", presence.toFixed(3));
        card.style.setProperty("--candidate-media-y", `${mediaY.toFixed(2)}px`);
        card.style.setProperty("--candidate-media-scale", mediaScale.toFixed(4));
        card.style.setProperty("--candidate-copy-y", `${copyY.toFixed(2)}px`);
        card.style.setProperty("--candidate-shadow-alpha", shadowAlpha.toFixed(3));
        card.style.setProperty("--candidate-surface-alpha", surfaceAlpha.toFixed(3));
      }

      if (needsNext) frame = window.requestAnimationFrame(render);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const updateTargets = () => {
      if (reduceMotion.matches) {
        setNeutral();
        return;
      }

      const viewport = window.innerHeight || 1;
      const focusY = viewport * 0.52;
      const range = viewport * 0.62;

      for (const card of cards) {
        const state = states.get(card);
        if (!state) continue;

        const rect = card.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - focusY);
        state.target = smoothPresence(1 - distance / range);
      }

      schedule();
    };

    const refresh = () => {
      collect();
      updateTargets();
    };

    const handleMotionChange = () => {
      if (reduceMotion.matches) {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        setNeutral();
        return;
      }

      refresh();
    };

    refresh();
    window.addEventListener("scroll", updateTargets, { passive: true });
    window.addEventListener("resize", refresh);
    reduceMotion.addEventListener("change", handleMotionChange);

    return () => {
      disposed = true;
      window.removeEventListener("scroll", updateTargets);
      window.removeEventListener("resize", refresh);
      reduceMotion.removeEventListener("change", handleMotionChange);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [results]);

  const toggleTag = (key: string) => {
    setSelectedTags((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  };

  const requestViewing = (listing: Listing) => {
    const copy = getListingAdvisoryCopy(listing, lang);
    openInquiry({
      source: "search",
      districtLabel: districtFor(listing),
      propertyTitle: titleFor(listing, lang),
      propertyId: listing.id,
      nextAction: copy.nextAction || L.request,
      advisorNote: copy.advisorReason || copy.acquisitionNote || copy.bestFor,
    });
  };

  return (
    <div className="bcn-section space-y-10">
      <div className="bcn-section--threshold grid gap-5 border-b border-black/10 pb-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.45fr)] lg:items-end">
        <div className="space-y-3">
          <div className="bcn-signal-kicker text-[12px] uppercase tracking-[0.2em] text-black/48">{L.eyebrow}</div>
          <h1 className="bcn-advisory-line max-w-[820px] text-[34px] leading-[1.02] tracking-tight text-black/88 md:text-[54px]">
            {L.headline}
          </h1>
          <p className="max-w-[720px] text-[14px] leading-[1.75] text-black/58">{L.subcopy}</p>
          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] uppercase tracking-[0.14em] text-black/44">
            <span className="border border-black/10 bg-white/42 px-3 py-1.5">{L.showroomNote}</span>
            <span className="hidden h-px w-10 bg-black/12 sm:block" />
            <span>{L.curationAxis}</span>
          </div>
        </div>
        <div className="bcn-memo-surface border border-black/10 bg-[rgb(var(--paper))] p-4 pl-5 text-[12px] leading-[1.65] text-black/58">
          <span className="block text-[10px] uppercase tracking-[0.16em] text-black/38">{L.buyerIntent}</span>
          <span className="mt-2 block text-[18px] leading-tight text-black/84">{modeLabel}</span>
          <span className="mt-3 block">{brief}</span>
        </div>
      </div>

      {queryContextActive && (
        <div className="bcn-search-context-strip border-y border-black/10 py-3 text-[12px] uppercase tracking-[0.13em] text-black/42">
          {L.showingContext} <span className="text-black/78">{searchContextLabel}</span>
        </div>
      )}

      <section className="bcn-editorial-surface space-y-4 border border-black/10 bg-[rgb(var(--paper))] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-black/42">{L.filters.intent}</div>
        <div className="flex flex-wrap items-center gap-2">
          {([
            ["best", L.best],
            ["investment", L.investment],
            ["sea", L.sea],
            ["family", L.family],
          ] as const).map(([k, label]) => {
            const active = mode === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setMode(k as Mode)}
                className={[
                  "rounded-full border px-4 py-2 text-[12px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black/50",
                  active
                    ? "border-black/25 bg-white text-black shadow-[0_12px_34px_rgba(25,25,22,0.08)]"
                    : "border-black/15 text-black/70 hover:border-black/25 hover:text-black",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_150px_170px]">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-black/40">{L.filters.lifestyle}</div>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => {
                const on = effectiveTags.includes(t.key);
                const locked =
                  (mode === "sea" && t.key === "sea") ||
                  (mode === "family" && t.key === "family") ||
                  (mode === "investment" && t.key === "investor");

                return (
                  <button
                    key={t.key}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (locked) return;
                      toggleTag(t.key);
                    }}
                    className={[
                      "rounded-full border px-3 py-1.5 text-[12px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black/50",
                      on
                        ? "border-black/25 bg-white text-black"
                        : "border-black/10 text-black/60 hover:border-black/20 hover:text-black",
                      locked ? "cursor-default opacity-80" : "",
                    ].join(" ")}
                  >
                    {lang === "es" ? t.es : t.en}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="grid content-start gap-2 text-[11px] uppercase tracking-[0.16em] text-black/40">
            {L.filters.district}
            <select
              className="h-10 rounded-full border border-black/10 bg-white px-3 text-[12px] normal-case tracking-normal text-black/70 outline-none focus:border-black/25 focus:ring-2 focus:ring-black/10"
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
          </label>

          <label className="grid content-start gap-2 text-[11px] uppercase tracking-[0.16em] text-black/40">
            {L.filters.beds}
            <select
              className="h-10 rounded-full border border-black/10 bg-white px-3 text-[12px] normal-case tracking-normal text-black/70 outline-none focus:border-black/25 focus:ring-2 focus:ring-black/10"
              value={minBeds}
              onChange={(e) => setMinBeds(Number(e.target.value))}
            >
              <option value={0}>{L.anyBeds}</option>
              <option value={1}>1+</option>
              <option value={2}>2+</option>
              <option value={3}>3+</option>
              <option value={4}>4+</option>
            </select>
          </label>

          <label className="grid content-start gap-2 text-[11px] uppercase tracking-[0.16em] text-black/40">
            {L.filters.budget}
            <select
              className="h-10 rounded-full border border-black/10 bg-white px-3 text-[12px] normal-case tracking-normal text-black/70 outline-none focus:border-black/25 focus:ring-2 focus:ring-black/10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            >
              <option value={0}>{L.anyPrice}</option>
              <option value={450000}>EUR 450k</option>
              <option value={650000}>EUR 650k</option>
              <option value={900000}>EUR 900k</option>
              <option value={1300000}>EUR 1.3M</option>
              <option value={2500000}>EUR 2.5M</option>
            </select>
          </label>
        </div>
      </section>

      <div className="bcn-section--threshold flex flex-col gap-3 border-b border-black/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[26px] leading-none tracking-tight text-black/86">
            {results.length} {L.rankedSuffix}
          </div>
          <p className="mt-2 text-[12px] text-black/52">{L.rankedNote}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setMode("best");
            setSelectedTags([]);
            setDistrict("");
            setMinBeds(0);
            setMaxPrice(0);
            setNote("");
            setQueryContextActive(false);
          }}
          className="w-fit rounded-full border border-black/10 px-4 py-2 text-[12px] text-black/70 hover:border-black/20 hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black/50"
        >
          {L.reset}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {results.map((listing) => {
          const copy = getListingAdvisoryCopy(listing, lang);
          const title = titleFor(listing, lang);
          const detailHref = `${prefix}/p/${listing.id}`;
          return (
            <article
              key={listing.id}
              data-bcn-search-card
              className="bcn-search-card group flex min-h-full flex-col overflow-hidden border border-black/10 bg-[rgb(var(--paper))] transition hover:border-black/20"
            >
              <div className="bcn-search-card__media relative aspect-[5/4] bg-black/5">
                <ShortlistToggle id={listing.id} className="absolute right-3 top-3 z-10" lang={lang} />
                <a href={detailHref} aria-label={title}>
                  <img
                    src={listing.images.hero}
                    alt={`${title} advisory candidate`}
                    className="bcn-search-card__image h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              </div>

              <div className="bcn-search-card__copy flex flex-1 flex-col p-4">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.16em] text-black/38">
                    <span>{L.candidateLabel}</span>
                    <span>{copy.viewingReadinessLabel}</span>
                  </div>
                  <h2 className="line-clamp-2 text-[15px] font-medium leading-snug text-black/86">
                    <a
                      href={detailHref}
                      className="hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black/50"
                    >
                      {title}
                    </a>
                  </h2>
                  <div className="mt-1 truncate text-[12px] leading-[1.5] text-black/58">
                    {districtFor(listing)} / {listing.beds} {L.bd} / {listing.sqm} m2 / EUR {fmtEUR(listing.price)}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-black/58">
                    <span className="border border-black/10 bg-white/70 px-2.5 py-1">
                      {L.priority} #{listing.shortlistPriority}
                    </span>
                    <span className="border border-black/10 bg-white/70 px-2.5 py-1">
                      {L.readiness}: {copy.viewingReadinessLabel}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 border-t border-black/10 pt-4 text-[12px] leading-[1.45] text-black/62">
                  <div>
                    <span className="block text-[10px] text-black/38">{L.bestFor}</span>
                    <span className="mt-0.5 line-clamp-2 block">{copy.bestFor}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-black/38">{L.signal}</span>
                    <span className="mt-0.5 line-clamp-2 block">{copy.signal}</span>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => requestViewing(listing)}
                    className="rounded-full border border-black/20 bg-white px-4 py-2 text-[12px] text-black/78 shadow-[0_12px_34px_rgba(25,25,22,0.08)] hover:border-black/38 hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black/50"
                  >
                    {L.request}
                  </button>
                  <a
                    href={detailHref}
                    className="rounded-full border border-black/10 px-4 py-2 text-center text-[12px] text-black/58 hover:border-black/22 hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black/50"
                  >
                    {L.open}
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
