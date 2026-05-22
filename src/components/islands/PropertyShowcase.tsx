import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import type { Listing } from "../../data/listings";
import { getListingAdvisoryCopy } from "../../lib/getListingAdvisoryCopy";
import { useShortlist } from "../../hooks/useShortlist";
import Lightbox from "./Lightbox";
import { openAdvisoryInquiry, type AdvisoryInquirySource } from "./AdvisoryInquiryPanel";

type Lang = "en" | "es";
const propertyChambers = [
  { id: "overview", en: "Overview", es: "Resumen", shortEn: "Overview", shortEs: "Resumen" },
  { id: "gallery", en: "Gallery", es: "Galería", shortEn: "Gallery", shortEs: "Galería" },
  { id: "district", en: "District fit", es: "Ajuste de distrito", shortEn: "District", shortEs: "Distrito" },
  { id: "acquisition", en: "Acquisition logic", es: "Lógica de adquisición", shortEn: "Logic", shortEs: "Lógica" },
  { id: "risk", en: "Risk & diligence", es: "Riesgo y diligencia", shortEn: "Risk", shortEs: "Riesgo" },
  { id: "viewing", en: "Viewing path", es: "Ruta de visita", shortEn: "Action", shortEs: "Acción" },
] as const;
type PropertyChamberId = (typeof propertyChambers)[number]["id"];
type ChamberDirection = "next" | "prev";

const WHEEL_COOLDOWN = 950;
const WHEEL_THRESHOLD = 36;
const SWIPE_DISTANCE = 48;
const SWIPE_DOMINANCE = 1.25;

function MachineReadout({ code, progress }: { code: string; progress: number }) {
  const p = Math.round((progress ?? 0) * 100);
  const pad = String(p).padStart(3, "0");
  return (
    <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] text-black/55">
      <span>{code}</span>
      <span className="opacity-40">·</span>
      <span>P {pad}</span>
    </div>
  );
}

function StickyStage({
  src,
  alt,
  onImageError,
}: {
  src: string;
  alt?: string;
  onImageError?: (src: string) => void;
}) {
  return (
    <div className="bcn-property-stage">
      <div className="bcn-property-stage__surface overflow-hidden bg-[rgb(var(--paper))] shadow-[0_34px_120px_rgba(46,43,35,0.12)] ring-1 ring-black/10">
        <div className="bcn-property-stage__frame relative aspect-[4/5] w-full">
          <AnimatePresence mode="wait">
            <motion.img
              key={src}
              src={src}
              alt={alt ?? ""}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, filter: "blur(10px)", scale: 1.02 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)", scale: 1.02 }}
              transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
              loading="lazy"
              decoding="async"
              onError={() => onImageError?.(src)}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const fmtEUR = (n: number) => Intl.NumberFormat("en-US").format(Math.round(n));

const tagLabelEn: Record<string, string> = {
  quiet: "Quiet",
  family: "Family",
  investor: "Investor",
  sea: "Sea view",
  walkable: "Walkable",
  design: "Design-led",
  modern: "Modern",
  classic: "Classic",
  green: "Green",
  creative: "Creative",
  heritage: "Heritage",
  privacy: "Privacy",
  compact: "Compact",
};

const tagLabelEs: Record<string, string> = {
  quiet: "Tranquilo",
  family: "Familia",
  investor: "Inversión",
  sea: "Mar",
  walkable: "Caminable",
  design: "Diseño",
  modern: "Moderno",
  classic: "Clásico",
  green: "Verde",
  creative: "Creativo",
  heritage: "Patrimonio",
  privacy: "Privacidad",
  compact: "Compacto",
};

const normalizeSlug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function districtToSlug(district: string) {
  const map: Record<string, string> = {
    "Diagonal Mar": "diagonal-mar",
    Barceloneta: "barceloneta",
    Eixample: "eixample",
    "El Born": "el-born",
    "Gràcia": "gracia",
    "Sarrià": "sarria",
    Poblenou: "poblenou",
    Pedralbes: "pedralbes",
    Barcelona: "eixample",
  };
  return map[district] ?? normalizeSlug(district);
}

function districtFacts(district: string, lang: Lang): string[] {
  const key = districtToSlug(district);

  const en: Record<string, string[]> = {
    eixample: ["Grid + walkability", "Renovation potential", "Strong liquidity", "Transit access"],
    gracia: ["Human scale streets", "Design-forward vibe", "Quiet pockets", "Local parks + cafés"],
    sarria: ["Family fit", "Green + calm", "Schools nearby", "Low noise profile"],
    poblenou: ["Modern + creative", "Near tech hubs", "Good liquidity", "Loft stock exists"],
    "diagonal-mar": ["Coastal modern", "Views + terraces", "Newer buildings", "Amenities/HOA common"],
    barceloneta: ["Sea proximity", "Compact units", "Walkable lifestyle", "Regulation-sensitive area"],
    "el-born": ["Heritage fabric", "Walkable core", "Selective quietness", "Renovation constraints possible"],
    pedralbes: ["Privacy + villas", "Quiet luxury", "Green streets", "High-end long-term demand"],
  };

  const es: Record<string, string[]> = {
    eixample: ["Cuadrícula + caminabilidad", "Potencial de reforma", "Liquidez alta", "Conexiones"],
    gracia: ["Escala humana", "Ambiente de diseño", "Bolsillos tranquilos", "Parques + cafés"],
    sarria: ["Perfil familiar", "Verde + calma", "Colegios", "Ruido bajo"],
    poblenou: ["Moderno + creativo", "Cerca de hubs tech", "Buena liquidez", "Stock tipo loft"],
    "diagonal-mar": ["Costero moderno", "Vistas + terrazas", "Edificios más nuevos", "Amenities/HOA habituales"],
    barceloneta: ["Cerca del mar", "Unidades compactas", "Vida caminable", "Zona sensible a normativa"],
    "el-born": ["Tejido histórico", "Centro caminable", "Calma selectiva", "Reformas con restricciones"],
    pedralbes: ["Privacidad + villas", "Lujo silencioso", "Calles verdes", "Demanda alta a largo plazo"],
  };

  const pack = lang === "es" ? es : en;
  return pack[key] ?? (lang === "es"
    ? ["Barcelona-first", "Encaje de estilo de vida", "Asesoría", "Trade-offs claros"]
    : ["Barcelona-first fit", "Lifestyle matching", "Advisory lens", "Clear trade-offs"]);
}

function computeAdvisory(listing: Listing, lang: Lang) {
  const ppsm = listing.price / Math.max(1, listing.sqm);
  const tags = new Set(listing.tags || []);
  const slug = districtToSlug(listing.district);

  const estLow = listing.price * 0.1;
  const estHigh = listing.price * 0.14;

  const liquidity =
    slug === "eixample" || slug === "gracia" || slug === "poblenou"
      ? (lang === "es" ? "Alta" : "High")
      : slug === "diagonal-mar" || slug === "pedralbes"
      ? (lang === "es" ? "Selectiva" : "Selective")
      : (lang === "es" ? "Media" : "Medium");

  const roi =
    tags.has("investor")
      ? (lang === "es" ? "Fuerte" : "Strong")
      : tags.has("sea")
      ? (lang === "es" ? "Selectivo" : "Selective")
      : (lang === "es" ? "Equilibrado" : "Balanced");

  const riskFlags: string[] = [];
  if (slug === "barceloneta")
    riskFlags.push(
      lang === "es"
        ? "Sensibilidad normativa (alquiler/turismo varía)"
        : "Regulation sensitivity (tourist/rental rules vary)"
    );
  if (slug === "diagonal-mar")
    riskFlags.push(lang === "es" ? "Posibles cuotas HOA/amenities" : "Amenity / HOA fees likely");
  if (slug === "el-born")
    riskFlags.push(
      lang === "es"
        ? "Restricciones patrimoniales / diligencia de reforma"
        : "Heritage constraints / renovation diligence"
    );
  if (tags.has("compact"))
    riskFlags.push(lang === "es" ? "Limitaciones por espacio compacto" : "Space efficiency constraints");
  if (!riskFlags.length)
    riskFlags.push(
      lang === "es"
        ? "Diligencia estándar recomendada"
        : "Standard due diligence recommended"
    );

  return {
    ppsm,
    estCosts: `€${fmtEUR(estLow)}–€${fmtEUR(estHigh)}`,
    liquidity,
    roi,
    riskFlags,
    facts: districtFacts(listing.district, lang),
    districtSlug: slug,
  };
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-black/10 px-3 py-1.5 text-[12px] text-black/70">
      {children}
    </span>
  );
}

const ui = (lang: Lang) => {
  const en = {
    request: "Request viewing path",
    backToSearch: "Back to search",
    save: "Save to dossier",
    saved: "Saved",
    lens: "Barcelona Lens",
    privateRecommendation: "Private recommendation",
    selectedObject: "Acquisition file",
    desc: "ADVISORY NOTES",
    gallery: "GALLERY",
    inspectGallery: "Inspect gallery",
    neighborhood: "NEIGHBORHOOD FIT",
    openDistrict: "Open district →",
    recommended: "Recommended for:",
    advisorMemo: "Advisor memo",
    signals: "Advisory signals",
    bestFor: "Best for",
    signal: "Signal",
    tradeOff: "Trade-off",
    riskNote: "Risk note",
    readiness: "Viewing readiness",
    priority: "Shortlist priority",
    price: "Price",
    guidePrice: "Guide price",
    surface: "Surface",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    district: "District",
    propertyFacts: "Property facts",
    advisorSummary: "Advisor summary",
    details: "Details",
    acquisitionNote: "Acquisition note",
    advisoryPath: "Advisory path",
    privateBrief: "Private brief",
    districtFit: "district fit",
    viewingPath: "viewing path",
    numbers: "ACQUISITION LOGIC",
    ppsm: "Price / m²",
    est: "Est. acquisition costs*",
    liquidity: "Liquidity",
    roi: "ROI potential",
    ref: "Reference metric.",
    estNote: "*Indicative range. Varies by taxes/fees and scenario.",
    lensNote: "Advisory lens.",
    roiNote: "High-level advisory estimate.",
    risk: "RISK FLAGS",
    ctaReq: "Request prepared. Copy the inquiry brief or continue with a private viewing path.",
    ctaSaved: "Saved to dossier.",
    ctaRemoved: "Removed from shortlist.",
    bd: "bd",
    ba: "ba",
    chamberLabel: "Acquisition chamber",
    chamberHint: "Guided private file",
    chamberGestureHint: "Scroll or swipe within the chamber to move between sections.",
    previous: "Previous",
    next: "Next",
    overviewSection: "01 Overview",
    gallerySection: "02 Gallery",
    districtSection: "03 District fit",
    acquisitionSection: "04 Acquisition logic",
    riskSection: "05 Risk & diligence",
    viewingSection: "06 Viewing path",
    viewingHeadline: "Ready to turn this property into a viewing path?",
    viewingCopy:
      "Keep this file in the dossier or request a prepared viewing path with the relevant advisory context attached.",
  };

  const es = {
    request: "Solicitar ruta de visita",
    backToSearch: "Volver a búsqueda",
    save: "Guardar en dossier",
    saved: "Guardado",
    lens: "Barcelona Lens",
    privateRecommendation: "Recomendación privada",
    selectedObject: "Ficha de adquisición",
    desc: "NOTAS ADVISORY",
    gallery: "GALERÍA",
    inspectGallery: "Inspeccionar galería",
    neighborhood: "ENCAJE DE BARRIO",
    openDistrict: "Abrir distrito →",
    recommended: "Recomendado para:",
    advisorMemo: "Memo del asesor",
    signals: "Señales de asesoría",
    bestFor: "Ideal para",
    signal: "Señal",
    tradeOff: "Trade-off",
    riskNote: "Nota de riesgo",
    readiness: "Preparación de visita",
    priority: "Prioridad shortlist",
    price: "Precio",
    guidePrice: "Precio guía",
    surface: "Superficie",
    bedrooms: "Habitaciones",
    bathrooms: "Baños",
    district: "Distrito",
    propertyFacts: "Datos del inmueble",
    advisorSummary: "Resumen del asesor",
    details: "Detalles",
    acquisitionNote: "Nota de adquisición",
    advisoryPath: "Ruta advisory",
    privateBrief: "Brief privado",
    districtFit: "encaje de distrito",
    viewingPath: "ruta de visita",
    numbers: "LÓGICA DE ADQUISICIÓN",
    ppsm: "Precio / m²",
    est: "Costes de compra*",
    liquidity: "Liquidez",
    roi: "Potencial ROI",
    ref: "Métrica de referencia.",
    estNote: "*Rango indicativo. Varía por impuestos, gastos y escenario.",
    lensNote: "Enfoque advisory.",
    roiNote: "Estimación advisory de alto nivel.",
    risk: "RIESGO Y DILIGENCIA",
    ctaReq: "Solicitud preparada. Copia el brief o continúa con una ruta de visita privada.",
    ctaSaved: "Guardado en dossier.",
    ctaRemoved: "Quitado del dossier.",
    bd: "hab",
    ba: "baños",
    chamberLabel: "Cámara de adquisición",
    chamberHint: "Ficha privada guiada",
    chamberGestureHint: "Desplázate o desliza dentro de la cámara para cambiar de sección.",
    previous: "Anterior",
    next: "Siguiente",
    overviewSection: "01 Resumen",
    gallerySection: "02 Galería",
    districtSection: "03 Ajuste de distrito",
    acquisitionSection: "04 Lógica de adquisición",
    riskSection: "05 Riesgo y diligencia",
    viewingSection: "06 Ruta de visita",
    viewingHeadline: "¿Listo para convertir esta propiedad en una ruta de visita?",
    viewingCopy:
      "Guarda esta ficha en el dossier o solicita una ruta de visita preparada con el contexto de asesoría relevante.",
  };

  return lang === "es" ? es : en;
};

export default function PropertyShowcase({
  listing,
  lang = "en",
}: {
  listing: Listing;
  lang?: Lang;
}) {
  const L = ui(lang);
  const prefix = lang === "es" ? "/es" : "";
  const searchHref = lang === "es" ? "/es/search" : "/search";

  const [activeChamber, setActiveChamber] = useState<PropertyChamberId>("overview");
  const [transitionDirection, setTransitionDirection] = useState<ChamberDirection>("next");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [failedImageSrcs, setFailedImageSrcs] = useState<Set<string>>(() => new Set());
  const deckRef = useRef<HTMLElement | null>(null);
  const lastWheelAtRef = useRef(0);
  const pointerStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const activeChamberIndex = propertyChambers.findIndex((item) => item.id === activeChamber);
  const activeChamberConfig = propertyChambers[activeChamberIndex] ?? propertyChambers[0];
  const activeP = (Math.max(0, activeChamberIndex) + 1) / propertyChambers.length;

  const goToChamberIndex = (nextIndex: number, direction: ChamberDirection) => {
    if (nextIndex < 0 || nextIndex >= propertyChambers.length || nextIndex === activeChamberIndex) return false;
    setTransitionDirection(direction);
    setActiveChamber(propertyChambers[nextIndex].id);
    return true;
  };

  const goToChamber = (id: PropertyChamberId) => {
    const nextIndex = propertyChambers.findIndex((item) => item.id === id);
    if (nextIndex < 0 || nextIndex === activeChamberIndex) return;
    setTransitionDirection(nextIndex > activeChamberIndex ? "next" : "prev");
    setActiveChamber(id);
  };

  const goToPreviousChamber = () => {
    goToChamberIndex(activeChamberIndex - 1, "prev");
  };

  const goToNextChamber = () => {
    goToChamberIndex(activeChamberIndex + 1, "next");
  };

  const handleChamberKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      goToPreviousChamber();
    }
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      goToNextChamber();
    }
    if (event.key === "Home") {
      event.preventDefault();
      goToChamberIndex(0, "prev");
    }
    if (event.key === "End") {
      event.preventDefault();
      goToChamberIndex(propertyChambers.length - 1, "next");
    }
  };

  const handlePanelPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || event.pointerType === "mouse") return;
    pointerStartRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  };

  const handlePanelPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || start.pointerId !== event.pointerId || prefersReducedMotion) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (absX < SWIPE_DISTANCE || absX < absY * SWIPE_DOMINANCE) return;

    const nextIndex = activeChamberIndex + (dx < 0 ? 1 : -1);
    const changed = goToChamberIndex(nextIndex, dx < 0 ? "next" : "prev");
    if (changed) event.preventDefault();
  };

  const handlePanelPointerCancel = () => {
    pointerStartRef.current = null;
  };

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;

    const updateMotionPreference = () => setPrefersReducedMotion(media.matches);
    updateMotionPreference();
    media.addEventListener("change", updateMotionPreference);
    return () => media.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;

    const handleDeckWheel = (event: WheelEvent) => {
      if (prefersReducedMotion) return;
      if (Math.abs(event.deltaY) < WHEEL_THRESHOLD || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('input, textarea, select, [contenteditable="true"], [data-bcn-gesture-ignore]')) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = activeChamberIndex + direction;
      if (nextIndex < 0 || nextIndex >= propertyChambers.length) return;

      const now = Date.now();
      if (now - lastWheelAtRef.current < WHEEL_COOLDOWN) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      lastWheelAtRef.current = now;
      goToChamberIndex(nextIndex, direction > 0 ? "next" : "prev");
    };

    deck.addEventListener("wheel", handleDeckWheel, { passive: false });
    return () => deck.removeEventListener("wheel", handleDeckWheel);
  }, [activeChamberIndex, prefersReducedMotion]);

  const visibleGalleryImages = useMemo(
    () => listing.images.gallery.filter((src) => !failedImageSrcs.has(src)),
    [listing.images.gallery, failedImageSrcs]
  );
  const visibleImageCount = 1 + visibleGalleryImages.length;

  const markImageFailed = (src: string) => {
    if (!src || src === listing.images.hero) return;
    setFailedImageSrcs((current) => {
      if (current.has(src)) return current;
      const next = new Set(current);
      next.add(src);
      return next;
    });
  };

  const chamberStageSrc =
    activeChamber === "overview"
      ? listing.images.hero
      : activeChamber === "gallery"
      ? visibleGalleryImages[0] ?? listing.images.hero
      : activeChamber === "district"
      ? visibleGalleryImages[1] ?? listing.images.hero
      : activeChamber === "acquisition"
      ? visibleGalleryImages[1] ?? visibleGalleryImages[0] ?? listing.images.hero
      : activeChamber === "risk"
      ? visibleGalleryImages[1] ?? visibleGalleryImages[0] ?? listing.images.hero
      : listing.images.hero;

  const adv = useMemo(() => computeAdvisory(listing, lang), [listing, lang]);

  const { has, toggle } = useShortlist();
  const saved = has(listing.id);

  const [ctaMsg, setCtaMsg] = useState<string>("");

  const saveToShortlist = () => {
    toggle(listing.id);
    window.dispatchEvent(new CustomEvent("sc:shortlist_ui_open"));
    setCtaMsg(saved ? L.ctaRemoved : L.ctaSaved);
    window.setTimeout(() => setCtaMsg(""), 1800);
  };

  const fitTags = (listing.tags || []).slice(0, 6);
  const labels = lang === "es" ? tagLabelEs : tagLabelEn;

  const titleText = lang === "es" ? (listing.title_es ?? listing.title) : listing.title;
  const descText = lang === "es" ? (listing.description_es ?? listing.description) : listing.description;
  const highlights = lang === "es" && listing.highlights_es ? listing.highlights_es : listing.highlights;
  const advisoryCopy = getListingAdvisoryCopy(listing, lang);
  const districtLabel = listing.districtLabel ?? listing.district;
  const requestLabel = advisoryCopy.nextAction || L.request;
  const advisorMemo = advisoryCopy.advisorReason || advisoryCopy.acquisitionNote || advisoryCopy.bestFor || descText;
  const chamberMeta = `${districtLabel} / ${listing.sqm} m2 / ${listing.beds} ${L.bd} / EUR ${fmtEUR(listing.price)}`;
  const signalRows = [
    { label: L.bestFor, value: advisoryCopy.bestFor },
    { label: L.signal, value: advisoryCopy.signal },
    { label: L.tradeOff, value: advisoryCopy.tradeOff },
    { label: L.riskNote, value: advisoryCopy.riskNote },
    { label: L.readiness, value: advisoryCopy.viewingReadinessLabel },
  ].filter((row) => row.value);
  const riskFlags = [advisoryCopy.riskNote, ...adv.riskFlags.filter((r) => r !== advisoryCopy.riskNote)].filter(Boolean);
  const chamberReadout: Record<PropertyChamberId, { title: string; body: string; meta: string[] }> = {
    overview: {
      title: lang === "es" ? "Resumen del asesor" : "Advisor summary",
      body: advisorMemo,
      meta: [districtLabel, advisoryCopy.viewingReadinessLabel, `${L.priority} #${listing.shortlistPriority}`, requestLabel],
    },
    gallery: {
      title: lang === "es" ? "Vista de inspección" : "Inspection preview",
      body:
        lang === "es"
          ? "Revisa las imágenes clave o abre la galería completa como cámara de inspección."
          : "Review the key images or open the full gallery as an inspection chamber.",
      meta: [
        `${visibleImageCount} ${lang === "es" ? "vistas" : "views"}`,
        lang === "es" ? "Cámara de inspección" : "Inspection shell",
        lang === "es" ? "Visual primero" : "Image-led",
        advisoryCopy.viewingReadinessLabel,
      ],
    },
    district: {
      title: lang === "es" ? "Ajuste de distrito" : "District fit",
      body: advisoryCopy.bestFor || advisorMemo,
      meta: [districtLabel, L.lens, lang === "es" ? "Encaje comprador" : "Buyer fit"],
    },
    acquisition: {
      title: lang === "es" ? "Lógica de adquisición" : "Acquisition logic",
      body:
        lang === "es"
          ? "Precio, liquidez y supuestos de compra para esta recomendación."
          : "Price, liquidity and ownership assumptions for this recommendation.",
      meta: [`€${fmtEUR(adv.ppsm)}/m²`, adv.liquidity, adv.roi, adv.estCosts],
    },
    risk: {
      title: lang === "es" ? "Foco de diligencia" : "Diligence focus",
      body: advisoryCopy.riskNote || riskFlags[0] || (lang === "es" ? "Revisión estándar recomendada." : "Standard diligence recommended."),
      meta: [lang === "es" ? "Diligencia" : "Diligence", lang === "es" ? "Gastos" : "Fees", lang === "es" ? "Exposición" : "Exposure", lang === "es" ? "Mantenimiento" : "Maintenance"],
    },
    viewing: {
      title: lang === "es" ? "Ruta de visita" : "Viewing path",
      body:
        lang === "es"
          ? "Convierte esta propiedad en una solicitud preparada con contexto de asesoría."
          : "Turn this property into a prepared viewing request with advisory context attached.",
      meta: [requestLabel, L.save, lang === "es" ? "Brief asesor" : "Advisor brief"],
    },
  };
  const activeReadout = chamberReadout[activeChamber];
  const activeReadoutMeta = Array.from(
    new Set(activeReadout.meta.map((item) => item?.trim()).filter(Boolean))
  ).slice(0, 4);

  const requestViewing = (source: Extract<AdvisoryInquirySource, "property" | "gallery"> = "property") => {
    openAdvisoryInquiry({
      source,
      districtLabel,
      propertyTitle: titleText,
      propertyId: listing.id,
      nextAction: requestLabel,
      advisorNote: advisorMemo,
    });
    setCtaMsg(L.ctaReq);
    window.setTimeout(() => setCtaMsg(""), 2200);
  };

  const allImages = useMemo(
    () => [
      { src: listing.images.hero, alt: `${titleText} private recommendation hero image` },
      ...visibleGalleryImages.map((src, i) => ({
        src,
        alt: `${titleText} gallery image ${i + 1}`,
      })),
    ],
    [listing.images.hero, visibleGalleryImages, titleText]
  );

  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  useEffect(() => {
    if (!allImages.length || lbIndex < allImages.length) return;
    setLbIndex(Math.max(0, allImages.length - 1));
  }, [allImages.length, lbIndex]);

  const openLightboxBySrc = (src: string) => {
    const i = allImages.findIndex((x) => x.src === src);
    setLbIndex(i >= 0 ? i : 0);
    setLbOpen(true);
  };

  const requestViewingFromGallery = () => {
    setLbOpen(false);
    window.setTimeout(() => requestViewing("gallery"), prefersReducedMotion ? 0 : 180);
  };

  const renderChamberPanel = () => {
    switch (activeChamber) {
      case "overview":
        return (
          <div className="bcn-property-chamber-panel bcn-property-chamber-panel--overview">
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="bcn-property-memo bcn-memo-surface self-start bg-[var(--bcn-graphite)] p-5 pl-6 text-[var(--bcn-porcelain)] shadow-[0_30px_110px_rgba(28,28,24,0.16)]">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/48">{L.advisorMemo}</div>
                <p className="mt-4 text-[22px] leading-[1.28] tracking-tight text-white/86">{advisorMemo}</p>
              </div>

              <div className="bcn-property-signals bcn-property-signals--compact">
                <div className="px-1 py-3 text-[11px] uppercase tracking-[0.18em] text-black/42">{L.signals}</div>
                {signalRows.slice(0, 4).map((row, index) => (
                  <div
                    key={row.label}
                    className={[
                      "bcn-property-signal-readout grid gap-3 border-t border-black/10 px-1 py-3 sm:grid-cols-[124px_1fr]",
                      index > 1 ? "bcn-property-signal-readout--secondary" : "",
                    ].join(" ")}
                  >
                    <div className="bcn-property-signal-readout__label text-[11px] text-black/42">{row.label}</div>
                    <div className="text-[13px] leading-[1.65] text-black/66">{row.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {(signalRows.length > 2 || advisoryCopy.acquisitionNote) && (
              <details className="bcn-property-mobile-extra-signals">
                <summary>{L.details}</summary>
                <div>
                  {signalRows.slice(2, 4).map((row) => (
                    <div key={`mobile-${row.label}`}>
                      <span>{row.label}</span>
                      <p>{row.value}</p>
                    </div>
                  ))}
                  {advisoryCopy.acquisitionNote && (
                    <div>
                      <span>{L.acquisitionNote}</span>
                      <p>{advisoryCopy.acquisitionNote}</p>
                    </div>
                  )}
                </div>
              </details>
            )}

            {advisoryCopy.acquisitionNote && (
              <p className="mt-3 border-l border-black/10 bg-[rgb(var(--paper))] p-3 text-[12px] leading-[1.65] text-black/56">
                {advisoryCopy.acquisitionNote}
              </p>
            )}
          </div>
        );

      case "gallery": {
        const previewImages = [listing.images.hero, ...visibleGalleryImages].slice(0, 4);
        return (
          <div className="bcn-property-chamber-panel bcn-property-chamber-panel--gallery">
            <div className="bcn-property-chamber-panel__intro">
              <div className="text-[11px] uppercase tracking-[0.18em] text-black/42">{L.gallery}</div>
              <p className="mt-2 max-w-[680px] text-[14px] leading-[1.65] text-black/60">
                {lang === "es"
                  ? "Revisa las imágenes principales o abre la galería como cámara de inspección."
                  : "Review key images or open the gallery as an inspection chamber."}
              </p>
            </div>

            <div className="bcn-property-gallery-preview-grid mt-5 grid gap-3">
              {previewImages.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => openLightboxBySrc(src)}
                  className="overflow-hidden border border-black/10 bg-[rgb(var(--paper))] text-left"
                >
                  <div className="aspect-[4/5] bg-black/5">
                    <img
                      className="h-full w-full object-cover"
                      src={src}
                      alt={`${titleText} gallery view ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      onError={() => markImageFailed(src)}
                    />
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => openLightboxBySrc(listing.images.hero)}
              className="mt-5 rounded-full border border-black/15 px-4 py-2 text-[12px] text-black/70 hover:border-black/25 hover:text-black"
            >
              {L.inspectGallery}
            </button>
          </div>
        );
      }

      case "district":
        return (
          <div className="bcn-property-chamber-panel">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-[12px] tracking-[0.18em] text-black/50">{L.neighborhood}</div>
              <a href={`${prefix}/district/${adv.districtSlug}`} className="text-[12px] text-black/50 hover:text-black">
                {L.openDistrict}
              </a>
            </div>

            <div className="mt-4 border border-black/10 bg-[rgb(var(--paper))] p-5">
              <div className="text-[12px] text-black/60">{L.recommended}</div>

              <div className="mt-3 flex flex-wrap gap-2">
                {fitTags.length ? fitTags.map((t0) => <Chip key={t0}>{labels[t0] ?? t0}</Chip>) : <Chip>Barcelona-first</Chip>}
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {adv.facts.slice(0, 4).map((f) => (
                  <div key={f} className="border border-black/10 bg-white px-3 py-2 text-[12px] text-black/70">
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "acquisition":
        return (
          <div className="bcn-property-chamber-panel">
            <div className="text-[12px] tracking-[0.18em] text-black/50">{L.numbers}</div>

            <div className="mt-4 border-y border-black/10 bg-[rgb(var(--paper))]">
              {[
                [L.ppsm, `€${fmtEUR(adv.ppsm)}`, L.ref],
                [L.est, adv.estCosts, L.estNote],
                [L.liquidity, adv.liquidity, L.lensNote],
                [L.roi, adv.roi, L.roiNote],
              ].map(([label, value, note]) => (
                <div key={label} className="grid gap-2 border-b border-black/10 px-4 py-4 last:border-b-0 sm:grid-cols-[190px_1fr]">
                  <div className="text-[12px] text-black/46">{label}</div>
                  <div>
                    <div className="text-[18px] tracking-tight text-black/82">{value}</div>
                    <div className="mt-1 text-[12px] leading-[1.55] text-black/54">{note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "risk":
        return (
          <div className="bcn-property-chamber-panel">
            <div className="text-[12px] tracking-[0.18em] text-black/50">{L.risk}</div>

            <div className="mt-4 border-l border-black/10 bg-[rgb(var(--paper))] p-5">
              <div className="grid gap-2">
                {riskFlags.map((r) => (
                  <div key={r} className="border-t border-black/10 py-2 text-[12px] text-black/66 first:border-t-0">
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "viewing":
        return (
          <div className="bcn-property-chamber-panel bcn-property-chamber-panel--viewing">
            <div className="bcn-editorial-surface border border-black/10 bg-[rgb(var(--paper))] p-6">
              <div className="text-[11px] uppercase tracking-[0.18em] text-black/42">{L.viewingSection}</div>
              <h2 className="mt-4 max-w-[680px] text-[28px] leading-[1.15] tracking-tight text-black/86">
                {L.viewingHeadline}
              </h2>
              <p className="mt-3 max-w-[620px] text-[14px] leading-[1.7] text-black/60">{L.viewingCopy}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => requestViewing("property")}
                  className="bcn-property-cta-primary rounded-full border border-black/25 bg-white px-4 py-2 text-[12px] hover:border-black/35"
                >
                  {requestLabel}
                </button>
                <button
                  type="button"
                  onClick={saveToShortlist}
                  className={[
                    "rounded-full border px-4 py-2 text-[12px]",
                    saved
                      ? "border-black/25 bg-white text-black"
                      : "border-black/15 text-black/70 hover:border-black/25 hover:text-black",
                  ].join(" ")}
                >
                  {saved ? L.saved : L.save}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bcn-property-shell bcn-property-chamber-shell bcn-section">
      <section className="bcn-property-mobile-file">
        <a href={searchHref} className="bcn-property-mobile-back">
          <span aria-hidden="true">←</span>
          <span>{L.backToSearch}</span>
        </a>

        <button
          type="button"
          onClick={() => openLightboxBySrc(listing.images.hero)}
          className="bcn-property-mobile-media"
          aria-label={L.inspectGallery}
        >
          <img
            src={listing.images.hero}
            alt={`${titleText} private recommendation hero image`}
            loading="eager"
            decoding="async"
          />
          <span>{listing.code}</span>
        </button>

        <div className="bcn-property-mobile-header">
          <p>{L.privateRecommendation} / {L.selectedObject} {listing.code}</p>
          <h1>{titleText}</h1>
          <div>{districtLabel} / {listing.sqm} m² / {listing.beds} {L.bd} / {listing.baths} {L.ba}</div>
        </div>

        <div className="bcn-property-mobile-facts" aria-label={L.propertyFacts}>
          <div>
            <span>{L.guidePrice}</span>
            <strong>EUR {fmtEUR(listing.price)}</strong>
          </div>
          <div>
            <span>{L.readiness}</span>
            <strong>{advisoryCopy.viewingReadinessLabel}</strong>
          </div>
          <div>
            <span>{L.priority}</span>
            <strong>#{listing.shortlistPriority}</strong>
          </div>
        </div>

        <div className="bcn-property-mobile-actions">
          <button type="button" onClick={() => requestViewing("property")}>
            {requestLabel}
          </button>
          <button type="button" onClick={saveToShortlist}>
            {saved ? L.saved : L.save}
          </button>
          <button type="button" onClick={() => openLightboxBySrc(listing.images.hero)}>
            {L.inspectGallery}
          </button>
        </div>

        <a href={`${prefix}/district/${adv.districtSlug}`} className="bcn-property-mobile-district">
          {L.openDistrict}
        </a>

        {ctaMsg && (
          <div className="bcn-property-mobile-status">
            {ctaMsg}
          </div>
        )}

        <div className="bcn-property-mobile-summary">
          <span>{L.advisorSummary}</span>
          <p>{advisorMemo}</p>
        </div>
      </section>

      <div className="bcn-property-chamber-shell__left">
        <section className="bcn-property-file bcn-property-file-header" data-bcn-reveal="section">
          <div className="bcn-property-file-header__main">
            <div className="bcn-property-file-header__eyebrow flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-black/42">
              <span>{L.privateRecommendation}</span>
              <span className="bcn-property-file-header__rule h-px w-10 bg-black/14" />
              <span>{L.selectedObject} {listing.code}</span>
            </div>

            <h1 className="bcn-property-file-header__title bcn-advisory-line max-w-[880px] text-[36px] leading-[0.98] tracking-tight text-black/90 sm:text-[52px]">
              {titleText}
            </h1>

            <div className="bcn-property-file-header__facts" aria-label={L.propertyFacts}>
              <div className="bcn-property-file-header__fact bcn-property-file-header__fact--price">
                <span>{L.price}</span>
                <strong>EUR {fmtEUR(listing.price)}</strong>
              </div>
              <div className="bcn-property-file-header__fact">
                <span>{L.surface}</span>
                <strong>{listing.sqm} m2</strong>
              </div>
              <div className="bcn-property-file-header__fact">
                <span>{L.bedrooms}</span>
                <strong>{listing.beds} {L.bd}</strong>
              </div>
              <div className="bcn-property-file-header__fact">
                <span>{L.bathrooms}</span>
                <strong>{listing.baths} {L.ba}</strong>
              </div>
              <div className="bcn-property-file-header__fact">
                <span>{L.district}</span>
                <strong>{districtLabel}</strong>
              </div>
            </div>
          </div>

          <div className="bcn-property-file-header__metrics flex flex-wrap gap-2 text-[12px] text-black/62">
            <span className="border border-black/10 bg-white/70 px-3 py-1.5">{L.readiness}: {advisoryCopy.viewingReadinessLabel}</span>
            <span className="border border-black/10 bg-white/70 px-3 py-1.5">{L.priority}: #{listing.shortlistPriority}</span>
            <span className="border border-black/10 bg-white/70 px-3 py-1.5">{L.lens}: {listing.district}</span>
          </div>

          <div className="bcn-property-file-header__actions flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => requestViewing("property")}
              className="bcn-property-cta-primary rounded-full border border-black/25 bg-white px-4 py-2 text-[12px] hover:border-black/35"
            >
              {requestLabel}
            </button>

            <button
              type="button"
              onClick={saveToShortlist}
              className={[
                "rounded-full border px-4 py-2 text-[12px]",
                saved
                  ? "border-black/25 bg-white text-black"
                  : "border-black/15 text-black/70 hover:border-black/25 hover:text-black",
              ].join(" ")}
            >
              {saved ? L.saved : L.save}
            </button>

            <button
              type="button"
              onClick={() => openLightboxBySrc(chamberStageSrc)}
              className="rounded-full border border-black/10 px-4 py-2 text-[12px] text-black/70 hover:border-black/20 hover:text-black"
            >
              {L.inspectGallery}
            </button>

            <a
              href={`${prefix}/district/${adv.districtSlug}`}
              className="bcn-property-file-header__district-link rounded-full border border-black/10 px-4 py-2 text-[12px] text-black/70 hover:border-black/20 hover:text-black"
            >
              {L.openDistrict}
            </a>
          </div>

          {ctaMsg && (
            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-[12px] text-black/60">
              {ctaMsg}
            </div>
          )}

          <div className="bcn-property-file-header__tags flex flex-wrap gap-2 pt-2">
            {highlights.map((h) => (
              <span key={h} className="rounded-full border border-black/10 bg-[rgb(var(--paper))] px-3 py-1.5 text-[12px] text-black/64">
                {h}
              </span>
            ))}
          </div>
        </section>

        <section
          ref={deckRef}
          className="bcn-property-deck"
          data-bcn-reveal="section"
          data-bcn-reveal-delay="1"
          aria-labelledby="property-chamber-title"
          aria-describedby="property-chamber-gesture-hint"
          tabIndex={0}
          onKeyDown={handleChamberKeyDown}
        >
          <div className="bcn-property-deck__header">
            <div>
              <div className="bcn-property-deck__eyebrow">{L.chamberLabel}</div>
              <h2 id="property-chamber-title" className="bcn-property-deck__title">
                {L.chamberHint}
              </h2>
              <p id="property-chamber-gesture-hint" className="bcn-property-deck__hint">
                {L.chamberGestureHint}
              </p>
            </div>

            <div className="bcn-property-deck__controls">
              <button type="button" onClick={goToPreviousChamber} disabled={activeChamberIndex === 0}>
                {L.previous}
              </button>
              <button type="button" onClick={goToNextChamber} disabled={activeChamberIndex === propertyChambers.length - 1}>
                {L.next}
              </button>
            </div>
          </div>

          <div
            className="bcn-property-deck__nav"
            role="tablist"
            aria-label={lang === "es" ? "Secciones del inmueble" : "Property sections"}
          >
            {propertyChambers.map((item, index) => {
              const active = item.id === activeChamber;
              return (
                <button
                  id={`property-chamber-tab-${item.id}`}
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-current={active ? "step" : undefined}
                  aria-controls={`property-chamber-panel-${item.id}`}
                  onClick={() => goToChamber(item.id)}
                  className={active ? "is-active" : ""}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{lang === "es" ? item.shortEs : item.shortEn}</span>
                </button>
              );
            })}
          </div>

          <div
            key={activeChamber}
            id={`property-chamber-panel-${activeChamber}`}
            className="bcn-property-deck__panel"
            data-direction={transitionDirection}
            role="tabpanel"
            aria-labelledby={`property-chamber-tab-${activeChamber}`}
            onPointerDown={handlePanelPointerDown}
            onPointerUp={handlePanelPointerUp}
            onPointerCancel={handlePanelPointerCancel}
          >
            <div className="mb-5 text-[11px] uppercase tracking-[0.18em] text-black/38">
              {String(activeChamberIndex + 1).padStart(2, "0")} / {lang === "es" ? activeChamberConfig.es : activeChamberConfig.en}
            </div>
            {renderChamberPanel()}
          </div>
        </section>
      </div>

      <aside className="bcn-property-chamber-shell__right" data-bcn-reveal="card-soft" data-bcn-reveal-delay="1">
        <MachineReadout code={listing.code} progress={activeP} />
        <button
          type="button"
          onClick={() => openLightboxBySrc(chamberStageSrc)}
          className="w-full text-left"
          aria-label="Open gallery"
          data-bcn-reveal="media"
          data-bcn-reveal-delay="2"
        >
          <StickyStage src={chamberStageSrc} alt={titleText} onImageError={markImageFailed} />
        </button>

        <aside className="bcn-property-stage-readout" data-bcn-reveal="copy" data-bcn-reveal-delay="3">
          <div className="bcn-property-stage-readout__eyebrow">
            {lang === "es" ? "Cámara activa" : "Current chamber"}
          </div>
          <h2>{activeReadout.title}</h2>
          <p>{activeReadout.body}</p>
          <div className="bcn-property-stage-readout__meta">
            {activeReadoutMeta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="bcn-property-stage-readout__controls">
            <button type="button" onClick={goToPreviousChamber} disabled={activeChamberIndex === 0}>
              {L.previous}
            </button>
            <button type="button" onClick={goToNextChamber} disabled={activeChamberIndex === propertyChambers.length - 1}>
              {L.next}
            </button>
          </div>
        </aside>

        <div className="bcn-property-media-actions">
          <a href={searchHref} className="bcn-property-back-link bcn-property-back-link--stage">
            <span aria-hidden="true">←</span>
            <span>{L.backToSearch}</span>
          </a>
        </div>
      </aside>

      <Lightbox
        open={lbOpen}
        images={allImages}
        index={lbIndex}
        setIndex={setLbIndex}
        onClose={() => setLbOpen(false)}
        lang={lang}
        context={{
          title: titleText,
          meta: chamberMeta,
          advisorNote: advisorMemo,
          bestFor: advisoryCopy.bestFor,
          signal: advisoryCopy.signal,
          tradeOff: advisoryCopy.tradeOff,
          readiness: advisoryCopy.viewingReadinessLabel,
          requestLabel,
          saveLabel: L.save,
          savedLabel: L.saved,
          isSaved: saved,
        }}
        onRequestAction={requestViewingFromGallery}
        onSaveAction={saveToShortlist}
        onImageError={markImageFailed}
      />
    </div>
  );
}
