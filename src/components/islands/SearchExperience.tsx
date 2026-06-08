import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { buyerIntents, districtLens, type BuyerIntentId } from "../../data/barcelonaLens";
import type { Listing } from "../../data/listings";
import { getListingAdvisoryCopy } from "../../lib/getListingAdvisoryCopy";
import ShortlistToggle from "./ShortlistToggle";

type Mode = "best" | "investment" | "sea" | "family";
type Lang = "en" | "es";
type ViewMode = "field" | "index";

const FIELD_INITIAL_VISIBLE_COUNT = 16;
const INDEX_INITIAL_VISIBLE_COUNT = 18;

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
    mobileRankedSuffix: "advisory-ranked options",
    rankedNote: "Ranked by intent fit, district logic and viewing readiness.",
    reset: "Reset brief",
    field: "Field",
    index: "Index",
    fieldCaption: "Advisory view",
    indexCaption: "Fast scan",
    openExtended: "Open extended search field",
    closeExtended: "Close extended field",
    moreRanked: "more ranked options",
    surfaceNote: "Field is image-led for judgment. Index is compact for many candidates.",
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
    privateBuyerBrief: "Private buyer brief",
    privateBuyerBriefCopy: "Define intent, lifestyle signals and constraints before comparing properties.",
    activeBrief: "Active brief",
    briefConstraints: "Brief constraints",
    briefComposerCopy: "Lifestyle signals and constraints",
    moreSignals: "Lifestyle signals",
    lensContext: "Lens context",
    editBrief: "Edit brief",
    closeBrief: "Close brief",
    bd: "bd",
    ba: "ba",
    guidePrice: "Guide price",
    buyerFit: "Buyer fit",
    decisionSignal: "Decision signal",
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
    mobileRankedSuffix: "opciones priorizadas",
    rankedSuffix: "opciones priorizadas por asesoría",
    rankedNote: "Ordenadas por ajuste de intención, lógica de distrito y preparación para visita.",
    reset: "Reiniciar brief",
    field: "Campo",
    index: "Índice",
    fieldCaption: "Vista asesorada",
    indexCaption: "Escaneo rápido",
    openExtended: "Abrir campo ampliado de búsqueda",
    closeExtended: "Cerrar campo ampliado",
    moreRanked: "opciones priorizadas más",
    surfaceNote: "Campo prioriza lectura visual. Índice permite escanear muchos candidatos.",
    allDistricts: "Todos los distritos",
    anyBeds: "Cualquier dormitorio",
    anyPrice: "Cualquier precio",
    best: "Mejor ajuste",
    investment: "Inversión",
    sea: "Luz mediterránea",
    family: "Calma familiar",
    briefLifestyle: "Señales de estilo de vida",
    briefDistrict: "Ajuste de distrito",
    briefBeds: "Dormitorios",
    briefMax: "Presupuesto",
    briefNote: "Nota",
    privateBuyerBrief: "Brief privado del comprador",
    privateBuyerBriefCopy: "Define intención, señales de estilo de vida y restricciones antes de comparar propiedades.",
    activeBrief: "Brief activo",
    briefConstraints: "Restricciones del brief",
    briefComposerCopy: "Señales de estilo de vida y restricciones",
    lensContext: "Contexto de lente",
    moreSignals: "Señales de estilo de vida",
    editBrief: "Editar brief",
    closeBrief: "Cerrar brief",
    bd: "hab",
    ba: "baños",
    guidePrice: "Precio gu\u00eda",
    buyerFit: "Encaje comprador",
    decisionSignal: "Se\u00f1al decisiva",
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
      lifestyle: "Señal de estilo de vida",
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

function bedLabelFor(lang: Lang) {
  return lang === "es" ? "hab" : "bd";
}

function bathLabelFor(lang: Lang) {
  return lang === "es" ? "ba\u00f1os" : "ba";
}

function commercialMetaFor(listing: Listing, lang: Lang) {
  return `${commercialPriceFor(listing)} / ${commercialFactsFor(listing, lang)}`;
}

function commercialFactsFor(listing: Listing, lang: Lang) {
  return `${listing.sqm} m\u00b2 / ${listing.beds} ${bedLabelFor(lang)} / ${listing.baths} ${bathLabelFor(lang)} / ${districtFor(listing)}`;
}

function commercialPriceFor(listing: Listing) {
  return `EUR ${fmtEUR(listing.price)}`;
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
  const resultsHeaderRef = useRef<HTMLDivElement | null>(null);
  const expandedAnchorRef = useRef<HTMLElement | null>(null);
  const firstRevealedRef = useRef<HTMLElement | null>(null);
  const expandedOpenedAt = useRef(0);
  const previousViewModeRef = useRef<ViewMode>("field");

  const [mode, setMode] = useState<Mode>("best");
  const [viewMode, setViewMode] = useState<ViewMode>("field");
  const [expanded, setExpanded] = useState(false);
  const [expandedEntered, setExpandedEntered] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [district, setDistrict] = useState<string>("");
  const [minBeds, setMinBeds] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  const [queryContextActive, setQueryContextActive] = useState(false);
  const [briefComposerOpen, setBriefComposerOpen] = useState(false);
  const [indexRowsEntered, setIndexRowsEntered] = useState(false);

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

  const activeBriefSummary = useMemo(() => {
    const bedsLabel = minBeds ? `${minBeds}+ ${L.briefBeds}` : L.anyBeds;
    const priceLabel = maxPrice ? `EUR ${fmtEUR(maxPrice)}` : L.anyPrice;
    const intentLocation = queryContextActive && district ? `${modeLabel} -> ${district}` : modeLabel;
    const parts = queryContextActive && district
      ? [intentLocation, bedsLabel, priceLabel]
      : [intentLocation, district || L.allDistricts, bedsLabel, priceLabel];
    return parts.join(" · ");
  }, [
    L.allDistricts,
    L.anyBeds,
    L.anyPrice,
    L.briefBeds,
    district,
    maxPrice,
    minBeds,
    modeLabel,
    queryContextActive,
  ]);

  const activeBriefLabel = queryContextActive ? L.lensContext : L.activeBrief;
  const briefConstraintSummary = useMemo(() => {
    const bedsLabel = minBeds ? `${minBeds}+ ${L.briefBeds}` : L.anyBeds;
    const priceLabel = maxPrice ? `EUR ${fmtEUR(maxPrice)}` : L.anyPrice;
    return [district || L.allDistricts, bedsLabel, priceLabel];
  }, [L.allDistricts, L.anyBeds, L.anyPrice, L.briefBeds, district, maxPrice, minBeds]);

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

  const visibleLimit = viewMode === "field" ? FIELD_INITIAL_VISIBLE_COUNT : INDEX_INITIAL_VISIBLE_COUNT;
  const canExpand = results.length > visibleLimit;
  const visibleResults = expanded ? results : results.slice(0, visibleLimit);
  const collapsedHiddenCount = Math.max(0, results.length - visibleLimit);

  useEffect(() => {
    setExpanded(false);
    setExpandedEntered(false);
    expandedAnchorRef.current = null;
    firstRevealedRef.current = null;
  }, [mode, selectedTags, district, minBeds, maxPrice, viewMode]);

  useEffect(() => {
    if (previousViewModeRef.current === viewMode) return;
    previousViewModeRef.current = viewMode;

    const frame = window.requestAnimationFrame(() => {
      const target = resultsHeaderRef.current;
      if (!target) return;

      const headerOffset = window.innerWidth <= 900 ? 78 : 92;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "auto",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== "index") {
      setIndexRowsEntered(false);
      return;
    }

    setIndexRowsEntered(false);

    let enterFrame = 0;
    const prepareFrame = window.requestAnimationFrame(() => {
      enterFrame = window.requestAnimationFrame(() => setIndexRowsEntered(true));
    });

    return () => {
      window.cancelAnimationFrame(prepareFrame);
      if (enterFrame) window.cancelAnimationFrame(enterFrame);
    };
  }, [viewMode, visibleResults.length]);

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

    if (viewMode !== "field") {
      collect();
      setNeutral();
      return undefined;
    }

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
  }, [visibleResults, viewMode]);

  useEffect(() => {
    if (!expanded) return;
    expandedOpenedAt.current = window.performance.now();
    setExpandedEntered(false);

    const scrollToRevealed = window.setTimeout(() => {
      const target = firstRevealedRef.current || expandedAnchorRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);

    return () => window.clearTimeout(scrollToRevealed);
  }, [expanded]);

  useEffect(() => {
    if (!expanded || !canExpand) return;

    const onScroll = () => {
      if (window.performance.now() - expandedOpenedAt.current < 900) return;
      const anchor = expandedAnchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.64) setExpandedEntered(true);
      if (expandedEntered && rect.top > window.innerHeight * 0.72) {
        setExpanded(false);
        setExpandedEntered(false);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [canExpand, expanded, expandedEntered]);

  const toggleTag = (key: string) => {
    setSelectedTags((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  };

  const resetBrief = () => {
    setMode("best");
    setSelectedTags([]);
    setDistrict("");
    setMinBeds(0);
    setMaxPrice(0);
    setNote("");
    setQueryContextActive(false);
    setExpanded(false);
  };

  const requestViewing = (listing: Listing) => {
    const copy = getListingAdvisoryCopy(listing, lang);
    openInquiry({
      source: "search",
      intentLabel: modeLabel,
      districtLabel: districtFor(listing),
      propertyTitle: titleFor(listing, lang),
      propertyId: listing.id,
      nextAction: copy.nextAction || L.request,
      advisorNote: copy.advisorReason || copy.acquisitionNote || copy.bestFor,
    });
  };

  const intentOptions = [
    ["best", L.best],
    ["investment", L.investment],
    ["sea", L.sea],
    ["family", L.family],
  ] as const;

  const renderIntentButton = ([k, label]: (typeof intentOptions)[number]) => {
    const active = mode === k;
    return (
      <button
        key={k}
        type="button"
        onClick={() => setMode(k as Mode)}
        className={active ? "is-active" : ""}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  };

  const renderSignalButton = (t: (typeof TAGS)[number]) => {
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
          "bcn-buyer-brief-composer__signal rounded-full border px-3 py-1.5 text-[12px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black/50",
          on
            ? "border-black/25 bg-white text-black"
            : "border-black/10 text-black/60 hover:border-black/20 hover:text-black",
          locked ? "cursor-default opacity-80" : "",
        ].join(" ")}
      >
        {lang === "es" ? t.es : t.en}
      </button>
    );
  };

  return (
    <div className="bcn-section space-y-8">
      <section className="bcn-search-mobile-compact" data-bcn-reveal="section">
        <div>
          <div className="bcn-search-mobile-compact__eyebrow">{lang === "es" ? "Búsqueda privada" : "Private Search"}</div>
          <h1>{`${results.length} ${L.mobileRankedSuffix}`}</h1>
        </div>
        <div className="bcn-search-mobile-compact__brief" aria-label={brief}>
          <span>{activeBriefLabel}</span>
          <strong>{activeBriefSummary}</strong>
        </div>
        <button
          type="button"
          aria-expanded={briefComposerOpen}
          aria-controls="bcn-private-brief-composer"
          onClick={() => setBriefComposerOpen((value) => !value)}
        >
          {briefComposerOpen ? L.closeBrief : L.editBrief}
        </button>
      </section>

      <div className="bcn-search-hero bcn-section--threshold border-b border-black/10 pb-8" data-bcn-reveal="section">
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
      </div>

      <div className="bcn-active-brief-bar border-y border-black/10 py-3" data-bcn-reveal="row" data-bcn-reveal-delay="1">
        <div className="bcn-active-brief-bar__main">
          <div className="bcn-active-brief-bar__heading">{L.privateBuyerBrief}</div>
          <div className="bcn-active-brief-bar__intents" aria-label={L.filters.intent}>
            {intentOptions.map(renderIntentButton)}
          </div>
        </div>
        <div className="bcn-active-brief-bar__readout" aria-label={brief}>
          <span>{activeBriefLabel}</span>
          <strong>{activeBriefSummary}</strong>
          <div className="bcn-active-brief-bar__constraints" aria-label={L.briefConstraints}>
            {briefConstraintSummary.map((item) => (
              <button key={item} type="button" onClick={() => setBriefComposerOpen(true)}>
                {item}
              </button>
            ))}
          </div>
        </div>
        {!briefComposerOpen && (
          <div className="bcn-active-brief-bar__actions">
            <button
              type="button"
              aria-expanded={briefComposerOpen}
              aria-controls="bcn-private-brief-composer"
              onClick={() => setBriefComposerOpen(true)}
            >
              {L.editBrief}
            </button>
          </div>
        )}
      </div>

      <section
        id="bcn-private-brief-composer"
        className="bcn-buyer-brief-composer bcn-editorial-surface border border-black/10 bg-[rgb(var(--paper))] p-3"
        data-bcn-reveal="card-soft"
        data-bcn-reveal-delay="2"
        data-state={briefComposerOpen ? "open" : "closed"}
        aria-hidden={!briefComposerOpen}
        inert={briefComposerOpen ? undefined : true}
      >
        <div className="bcn-buyer-brief-composer__header">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-black/42">{L.editBrief}</div>
            <p className="mt-1 max-w-[560px] text-[12px] leading-[1.6] text-black/54">{L.briefComposerCopy}</p>
          </div>
          <div className="bcn-buyer-brief-composer__header-actions">
            <button type="button" onClick={() => setBriefComposerOpen(false)}>
              {L.closeBrief}
            </button>
            <button type="button" onClick={resetBrief} className="bcn-buyer-brief-composer__reset">
              {L.reset}
            </button>
          </div>
        </div>

        <div className="bcn-buyer-brief-composer__mobile-intents">
          <div className="bcn-buyer-brief-composer__label">{L.filters.intent}</div>
          <div className="bcn-buyer-brief-composer__intent-grid">
            {intentOptions.map(renderIntentButton)}
          </div>
        </div>

        <div className="bcn-buyer-brief-composer__zones">
          <div className="bcn-buyer-brief-composer__zone bcn-buyer-brief-composer__zone--signals">
            <div className="bcn-buyer-brief-composer__label">{L.filters.lifestyle}</div>
            <div className="bcn-buyer-brief-composer__signals flex flex-wrap gap-2">
              {TAGS.map(renderSignalButton)}
            </div>
          </div>

          <div className="bcn-buyer-brief-composer__zone bcn-buyer-brief-composer__zone--constraints">
            <div className="bcn-buyer-brief-composer__label">{L.briefConstraints}</div>
            <div className="bcn-buyer-brief-composer__constraints">
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
          </div>

          <details className="bcn-buyer-brief-composer__mobile-signals">
            <summary>{L.moreSignals}</summary>
            <div className="bcn-buyer-brief-composer__signals flex flex-wrap gap-2">
              {TAGS.map(renderSignalButton)}
            </div>
          </details>
        </div>

      </section>

      <div
        ref={resultsHeaderRef}
        className="bcn-search-results-header bcn-section--threshold flex flex-col gap-4 border-b border-black/10 pb-6 lg:flex-row lg:items-end lg:justify-between"
        data-bcn-reveal="section"
      >
        <div>
          <div className="text-[26px] leading-none tracking-tight text-black/86">
            {results.length} {L.rankedSuffix}
          </div>
          <p className="mt-2 text-[12px] text-black/52">{L.rankedNote}</p>
          <p className="mt-1 text-[12px] text-black/42">{L.surfaceNote}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <div className="inline-grid w-fit grid-cols-2 border border-black/10 bg-white/50 p-1">
            {([
              ["field", L.field, L.fieldCaption],
              ["index", L.index, L.indexCaption],
            ] as const).map(([key, label, caption]) => {
              const active = viewMode === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setViewMode(key)}
                  className={[
                    "px-3 py-2 text-left text-[12px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-black/50",
                    active ? "bg-[var(--bcn-graphite)] text-white" : "text-black/58 hover:text-black",
                  ].join(" ")}
                  aria-pressed={active}
                >
                  <span className="block leading-none">{label}</span>
                  <span className="mt-1 block text-[10px] opacity-62">{caption}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        data-bcn-search-results
        data-index-state={viewMode === "index" ? (indexRowsEntered ? "entered" : "entering") : undefined}
        className={
          viewMode === "field"
            ? "grid gap-4 lg:grid-cols-2 xl:grid-cols-3"
            : "bcn-search-index-list grid gap-3"
        }
      >
        {visibleResults.map((listing, index) => {
          const copy = getListingAdvisoryCopy(listing, lang);
          const title = titleFor(listing, lang);
          const detailHref = `${prefix}/p/${listing.id}`;
          const isFirstRevealed = expanded && index === visibleLimit;

          if (viewMode === "index") {
            return (
              <article
                key={listing.id}
                ref={(node) => {
                  if (isFirstRevealed) {
                    firstRevealedRef.current = node;
                    expandedAnchorRef.current = node;
                  }
                }}
                className="bcn-search-index-row grid gap-3 border border-black/10 bg-[rgb(var(--paper))] p-3 transition hover:border-black/20 sm:grid-cols-[132px_minmax(0,1fr)_auto] sm:items-center"
                style={{ "--bcn-index-row": Math.min(index, 8) } as CSSProperties}
              >
                <a href={detailHref} aria-label={title} className="block overflow-hidden bg-black/5">
                  <img
                    src={listing.images.hero}
                    alt={`${title} advisory candidate`}
                    className="h-36 w-full object-cover sm:h-24"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-black/38">
                    <span>{L.priority} #{listing.shortlistPriority}</span>
                    <span>{copy.viewingReadinessLabel}</span>
                  </div>
                  <h2 className="mt-2 truncate text-[15px] font-medium leading-snug text-black/86">
                    <a
                      href={detailHref}
                      className="hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black/50"
                    >
                      {title}
                    </a>
                  </h2>
                  <div className="bcn-search-index-commercial mt-2">
                    <span className="bcn-search-card__price">{commercialPriceFor(listing)}</span>
                    <span className="bcn-search-card__meta">{commercialFactsFor(listing, lang)}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[12px] leading-[1.45] text-black/62">{copy.signal}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <ShortlistToggle id={listing.id} lang={lang} />
                  <button
                    type="button"
                    onClick={() => requestViewing(listing)}
                    className="rounded-full border border-black/20 bg-white px-3 py-2 text-[12px] text-black/78 hover:border-black/38 hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black/50"
                  >
                    {L.request}
                  </button>
                  <a
                    href={detailHref}
                    className="rounded-full border border-black/10 px-3 py-2 text-center text-[12px] text-black/58 hover:border-black/22 hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black/50"
                  >
                    {L.open}
                  </a>
                </div>
              </article>
            );
          }

          return (
            <article
              key={listing.id}
              ref={(node) => {
                if (isFirstRevealed) {
                  firstRevealedRef.current = node;
                  expandedAnchorRef.current = node;
                }
              }}
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
                  <div className="bcn-search-card__mobile-meta">
                    {`${commercialPriceFor(listing)} · ${listing.sqm} m² · ${listing.beds} ${bedLabelFor(lang)} · ${districtFor(listing)}`}
                  </div>
                  <div className="bcn-search-card__commercial mt-3">
                    <div className="bcn-search-card__commercial-head">
                      <span className="bcn-search-card__commercial-label">{L.guidePrice}</span>
                      <span className="bcn-search-card__price">{commercialPriceFor(listing)}</span>
                    </div>
                    <div className="bcn-search-card__facts">
                      <span>{`${listing.sqm} m\u00b2`}</span>
                      <span>{listing.beds} {bedLabelFor(lang)}</span>
                      <span>{listing.baths} {bathLabelFor(lang)}</span>
                      <span>{districtFor(listing)}</span>
                    </div>
                    <div className="sr-only">{commercialMetaFor(listing, lang)}</div>
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

                <div className="bcn-search-card__advisory mt-4">
                  <div className="bcn-search-card__advisory-row">
                    <span>{L.buyerFit}</span>
                    <p>{copy.bestFor}</p>
                  </div>
                  <div className="bcn-search-card__advisory-row">
                    <span>{L.decisionSignal}</span>
                    <p>{copy.signal}</p>
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

      {expanded && canExpand && (
        <div className="bcn-search-extended-control flex flex-col gap-3 border-y border-black/10 bg-white/34 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[12px] leading-[1.5] text-black/52">
            <span className="block text-[11px] uppercase tracking-[0.16em] text-black/36">
              {viewMode === "field" ? L.field : L.index}
            </span>
            {`${results.length} ${L.rankedSuffix}`}
          </div>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="w-fit rounded-full border border-black/16 bg-white px-4 py-2 text-[12px] text-black/74 shadow-[0_12px_34px_rgba(25,25,22,0.06)] hover:border-black/28 hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black/50"
          >
            {L.closeExtended}
          </button>
        </div>
      )}

      {!expanded && canExpand && (
        <div className="bcn-search-extended-control flex flex-col gap-3 border-y border-black/10 bg-white/34 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[12px] leading-[1.5] text-black/52">
            <span className="block text-[11px] uppercase tracking-[0.16em] text-black/36">
              {viewMode === "field" ? L.field : L.index}
            </span>
            {`${visibleResults.length} / ${results.length} ${L.rankedSuffix}`}
          </div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="w-fit rounded-full border border-black/16 bg-white px-4 py-2 text-[12px] text-black/74 shadow-[0_12px_34px_rgba(25,25,22,0.06)] hover:border-black/28 hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black/50"
          >
            {L.openExtended}
            {collapsedHiddenCount > 0 ? ` · + ${collapsedHiddenCount} ${L.moreRanked}` : ""}
          </button>
        </div>
      )}
    </div>
  );
}
