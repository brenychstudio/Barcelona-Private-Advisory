import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  buyerIntents,
  districtLens,
  getBuyerIntent,
  getDistrictLens,
  type BuyerIntentId,
  type DistrictId,
} from "../../data/barcelonaLens";
import { bcnMedia, type BcnMediaAsset } from "../../data/bcnMedia";
import { bcnLensMedia, type BcnLensMediaAsset } from "../../data/bcnLensMedia";
import { listings, type Listing } from "../../data/listings";
import { getBuyerIntentCopy, getDistrictLensCopy } from "../../lib/getBarcelonaLensCopy";
import { getListingAdvisoryCopy } from "../../lib/getListingAdvisoryCopy";
import { resolvePropertyRecommendations } from "../../lib/resolvePropertyRecommendations";
import { openAdvisoryInquiry, type AdvisoryInquirySource } from "./AdvisoryInquiryPanel";
import ShortlistToggle from "./ShortlistToggle";

type Lang = "en" | "es";

type LensState = {
  activeIntentId: BuyerIntentId;
  activeDistrictId: DistrictId;
  activePropertyId?: string;
  matchedPropertyIds: string[];
};

const fmtEUR = (n: number) => Intl.NumberFormat("en-US").format(n);

function districtName(id: DistrictId, lang: Lang) {
  return getDistrictLensCopy(getDistrictLens(id), lang).name;
}

function propertyMeta(property: Listing) {
  return `${property.district} / ${property.beds} bd / ${property.sqm} m²`;
}

function propertyTitle(property: Listing, lang: Lang) {
  return lang === "es" ? property.title_es ?? property.title : property.title;
}

function nodeCoord(id: DistrictId) {
  const node = getDistrictLens(id).node;
  return {
    x: parseFloat(node.x) * 9,
    y: parseFloat(node.y) * 6.2,
  };
}

type LensVisualAsset = BcnMediaAsset | BcnLensMediaAsset;

const intentVisuals: Record<BuyerIntentId, LensVisualAsset> = {
  "family-calm": bcnLensMedia.properties.familyCalm,
  "sea-light": bcnLensMedia.properties.seaLight,
  "investment-logic": bcnLensMedia.properties.investmentLogic,
  "design-renovation": bcnLensMedia.properties.designRenovation,
  privacy: bcnLensMedia.properties.privacy,
  "walkable-daily-life": bcnLensMedia.properties.walkableDailyLife,
};

const districtVisuals: Record<DistrictId, LensVisualAsset> = {
  eixample: bcnLensMedia.districts.eixample,
  gracia: bcnLensMedia.districts.gracia,
  sarria: bcnLensMedia.districts.sarria,
  poblenou: bcnLensMedia.districts.poblenou,
  "diagonal-mar": bcnLensMedia.districts.diagonalMar,
  pedralbes: bcnLensMedia.districts.pedralbes,
};

const propertyVisuals: Record<string, BcnMediaAsset> = bcnMedia.properties.byListingId;

const lensPropertyVisuals: Record<string, BcnLensMediaAsset> = {
  "l-01": bcnLensMedia.properties.walkableDailyLife,
  "l-02": bcnLensMedia.properties.investmentLogic,
  "l-03": bcnLensMedia.properties.designRenovation,
  "l-04": bcnLensMedia.properties.seaLight,
  "l-05": bcnLensMedia.properties.familyCalm,
  "l-06": bcnLensMedia.signals.seaLightPlane,
  "l-07": bcnLensMedia.properties.designRenovation,
  "l-08": bcnLensMedia.properties.privacy,
  "l-09": bcnLensMedia.properties.investmentLogic,
};

const propertyAnchors = [
  { x: 742, y: 182 },
  { x: 782, y: 318 },
  { x: 712, y: 462 },
];

const readinessRank: Record<Listing["viewingReadiness"], number> = {
  High: 0,
  Medium: 1,
  Selective: 2,
};

function propertyVisual(property: Listing): LensVisualAsset {
  return lensPropertyVisuals[property.id] ?? propertyVisuals[property.id] ?? bcnMedia.properties.investmentCleanModernUnit;
}

function titleStartsWithDistrict(title: string, district: string) {
  const normalizedTitle = title.trim().toLocaleLowerCase();
  const normalizedDistrict = district.trim().toLocaleLowerCase();
  return (
    normalizedTitle === normalizedDistrict ||
    normalizedTitle.startsWith(`${normalizedDistrict} `) ||
    normalizedTitle.startsWith(`${normalizedDistrict} /`) ||
    normalizedTitle.startsWith(`${normalizedDistrict} -`) ||
    normalizedTitle.startsWith(`${normalizedDistrict} —`)
  );
}

function formatLensPropertyTitle(property: Listing, lang: Lang) {
  const title = propertyTitle(property, lang);
  const districts = [property.districtLabel, property.district].filter(Boolean);
  const district = property.districtLabel || property.district;
  if (!district || districts.some((value) => titleStartsWithDistrict(title, value))) return title;
  return `${district} — ${title}`;
}

function ui(lang: Lang) {
  const en = {
    privateBuyerBrief: "Private buyer brief",
    activeBrief: "Active brief",
    activeIntent: "Active intent",
    buyerIntentField: "BUYER INTENT FIELD",
    intentHeadline: "Intent changes the market surface.",
    intentBridge: "Intent defines the lens. The district field responds before properties are compared.",
    lensField: "BARCELONA LENS FIELD",
    lensHeadline: "District intelligence, visibly formed.",
    intent: "Intent",
    lens: "Lens",
    matches: "matches",
    openMap: "Open district lens",
    closeMap: "Close district lens",
    atlasLabel: "Fullscreen Barcelona district lens",
    districtIntelligence: "PRIVATE DISTRICT INTELLIGENCE",
    activeDistrictReport: "Active district report",
    matchedRecommendations: "Matched recommendations",
    topRecommendation: "Top recommendation",
    matchedOptions: "Matched options",
    matchedOptionsInline: "matched options",
    viewMatchedOptions: "View matched options",
    viewAllMatchedOptions: "View all matched options",
    searchApartments: "Search apartments",
    openPrivateSearch: "Open private search",
    topMatches: "Top matches",
    moreInPrivateSearch: "more in Private Search",
    optionsInThisLens: "matched options in this lens",
    openProperty: "Open property",
    districtSignals: "District signals",
    intentSignals: "Intent signals",
    valueLogic: "Value logic",
    readout: "Advisory readout",
    active: "ACTIVE",
    match: "MATCH",
    activeDistrict: "Active district",
    fit: "Fit",
    buyerFit: "Buyer fit",
    signal: "Signal",
    risk: "Risk",
    value: "Value",
    currentMatch: "Current match",
    buildShortlist: "Build shortlist",
    requestViewingPath: "Request viewing path",
    dossierDistrict: "ADVISOR-READY DOSSIER",
    readyToSend: "ready to send",
    selected: "selected",
    curatedPropertyField: "CURATED PROPERTY FIELD",
    propertyHeadline: "Media-led acquisition signal.",
    propertyBridge: "Selected properties appear as signals, not inventory.",
    viewProperty: "View",
    advisorSelected: "advisor selected",
    productObject: "PRODUCT OBJECT",
    bestFor: "Best for",
    tradeOff: "Trade-off",
    advisorMemo: "Advisor memo",
    readiness: "Readiness",
    priority: "Priority",
    next: "Next",
    alternative: "ALT",
    shortlistDossier: "PRIVATE SHORTLIST DOSSIER",
    dossierHeadline: "Visual proof, ready to send.",
    dossierBridge: "The shortlist becomes an advisor-ready dossier.",
    intentSelected: "Intent selected",
    lensFormed: "Lens formed",
    shortlistReady: "Shortlist ready",
    sendShortlist: "Send shortlist",
    bookAdvisoryCall: "Book advisory call",
    rankLabels: {
      "primary match": "primary match",
      "intent fit": "intent fit",
      "district fit": "district fit",
      "control option": "control option",
    },
  };
  const es = {
    privateBuyerBrief: "Brief privado del comprador",
    activeBrief: "Brief activo",
    activeIntent: "Intent activo",
    buyerIntentField: "CAMPO DE INTENCIÓN DEL COMPRADOR",
    intentHeadline: "La intención cambia la superficie del mercado.",
    intentBridge: "La intención define la lente. El campo de distrito responde antes de comparar propiedades.",
    lensField: "CAMPO BARCELONA LENS",
    lensHeadline: "Inteligencia de distrito, formada de manera visible.",
    intent: "Intención",
    lens: "Lente",
    matches: "encajes",
    openMap: "Abrir lente de distrito",
    closeMap: "Cerrar lente de distrito",
    atlasLabel: "Lente de distritos de Barcelona en pantalla completa",
    districtIntelligence: "INTELIGENCIA PRIVADA DE DISTRITO",
    activeDistrictReport: "Informe activo de distrito",
    matchedRecommendations: "Recomendaciones con encaje",
    topRecommendation: "Recomendación principal",
    matchedOptions: "Opciones coincidentes",
    matchedOptionsInline: "opciones coincidentes",
    viewMatchedOptions: "Ver opciones coincidentes",
    viewAllMatchedOptions: "Ver opciones coincidentes",
    searchApartments: "Buscar apartamentos",
    openPrivateSearch: "Abrir búsqueda privada",
    topMatches: "Principales coincidencias",
    moreInPrivateSearch: "más en Búsqueda privada",
    optionsInThisLens: "opciones coinciden con esta lente",
    openProperty: "Abrir propiedad",
    districtSignals: "Señales de distrito",
    intentSignals: "Señales de intención",
    valueLogic: "Lógica de valor",
    readout: "Lectura advisory",
    active: "ACTIVO",
    match: "ENCAJE",
    activeDistrict: "Distrito activo",
    fit: "Encaje",
    buyerFit: "Ajuste comprador",
    signal: "Señal",
    risk: "Riesgo",
    value: "Valor",
    currentMatch: "Encaje actual",
    buildShortlist: "Crear shortlist",
    requestViewingPath: "Solicitar ruta de visita",
    dossierDistrict: "DOSSIER PREPARADO PARA ASESORÍA",
    readyToSend: "listo para enviar",
    selected: "seleccionados",
    curatedPropertyField: "CAMPO DE PROPIEDADES CURADAS",
    propertyHeadline: "Señal de adquisición guiada por media.",
    propertyBridge: "Las propiedades seleccionadas aparecen como señales, no como inventario.",
    viewProperty: "Ver",
    advisorSelected: "selección asesorada",
    productObject: "OBJETO DE ADQUISICIÓN",
    bestFor: "Ideal para",
    tradeOff: "Compensación",
    advisorMemo: "Memo del asesor",
    readiness: "Preparación",
    priority: "Prioridad",
    next: "Siguiente",
    alternative: "ALT",
    shortlistDossier: "DOSSIER PRIVADO DE SELECCIÓN",
    dossierHeadline: "Prueba visual, lista para enviar.",
    dossierBridge: "La shortlist se convierte en un dossier preparado para asesoría.",
    intentSelected: "Intención seleccionada",
    lensFormed: "Lens formado",
    shortlistReady: "Shortlist lista",
    sendShortlist: "Enviar shortlist",
    bookAdvisoryCall: "Reservar llamada de asesoría",
    rankLabels: {
      "primary match": "encaje principal",
      "intent fit": "encaje de intención",
      "district fit": "encaje de distrito",
      "control option": "opción de control",
    },
  };
  return lang === "es" ? es : en;
}

export default function BarcelonaLensSystem({ lang = "en" }: { lang?: Lang }) {
  const L = ui(lang);
  const prefix = lang === "es" ? "/es" : "";
  const [activeIntentId, setActiveIntentId] = useState<BuyerIntentId>("family-calm");
  const [activeDistrictId, setActiveDistrictId] = useState<DistrictId>(getBuyerIntent("family-calm").primaryDistrictId);
  const [activePropertyId, setActivePropertyId] = useState<string | undefined>();
  const [mapOpen, setMapOpen] = useState(false);
  const [mapClosing, setMapClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeTimerRef = useRef<number | undefined>(undefined);

  const activeIntent = getBuyerIntent(activeIntentId);
  const activeDistrict = getDistrictLens(activeDistrictId);
  const activeIntentCopy = getBuyerIntentCopy(activeIntent, lang);
  const activeDistrictCopy = getDistrictLensCopy(activeDistrict, lang);
  const rankLabelText = (label: string) => L.rankLabels[label as keyof typeof L.rankLabels] ?? label;
  const activeIntentVisual = intentVisuals[activeIntentId];
  const activeDistrictVisual = districtVisuals[activeDistrictId];

  const recommendationResult = useMemo(
    () => resolvePropertyRecommendations(listings, activeIntentId, activeDistrictId),
    [activeIntentId, activeDistrictId]
  );

  const featuredRecommendation = recommendationResult.featuredProperty;
  const featured = featuredRecommendation.property;
  const featuredCopy = getListingAdvisoryCopy(featured, lang);
  const featuredVisual = propertyVisual(featured);
  const supporting = recommendationResult.supportingProperties;
  // Lens surfaces the decision set; Search remains the full ranked inventory surface.
  const matchedRecommendations = recommendationResult.recommendations.filter((item) => item.isIntentMatch || item.isDistrictMatch);
  const totalMatches = matchedRecommendations.length;
  const visibleMatches = matchedRecommendations.slice(0, 3);
  const topMatch = matchedRecommendations[0] ?? featuredRecommendation;
  const topMatchProperty = topMatch.property;
  const topMatchCopy = getListingAdvisoryCopy(topMatchProperty, lang);
  const topMatchVisual = propertyVisual(topMatchProperty);
  const topMatchTitle = formatLensPropertyTitle(topMatchProperty, lang);
  const hiddenMatches = Math.max(0, totalMatches - visibleMatches.length);
  const highestReadinessMatch = visibleMatches.reduce(
    (best, item) => (readinessRank[item.property.viewingReadiness] < readinessRank[best.property.viewingReadiness] ? item : best),
    topMatch,
  );
  const highestReadiness = getListingAdvisoryCopy(highestReadinessMatch.property, lang).viewingReadinessLabel;
  const matchedSearchHref = `${prefix}/search?intent=${encodeURIComponent(activeIntentId)}&district=${encodeURIComponent(activeDistrictId)}`;
  const lensState: LensState = {
    activeIntentId,
    activeDistrictId,
    activePropertyId,
    matchedPropertyIds: matchedRecommendations.map((item) => item.property.id),
  };

  const activeNode = nodeCoord(activeDistrictId);
  const matchedDistrictIds = [activeIntent.primaryDistrictId, ...activeIntent.secondaryDistrictIds];

  useEffect(() => {
    setMounted(true);
  }, []);

  const openMap = useCallback(() => {
    if (closeTimerRef.current !== undefined) {
      window.clearTimeout(closeTimerRef.current);
    }
    setMapClosing(false);
    setMapOpen(true);
  }, []);

  const closeMap = useCallback(() => {
    if (closeTimerRef.current !== undefined) {
      window.clearTimeout(closeTimerRef.current);
    }
    setMapClosing(true);
    setMapOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      setMapClosing(false);
      closeTimerRef.current = undefined;
    }, 1050);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== undefined) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const selectIntent = (id: BuyerIntentId) => {
    const next = getBuyerIntent(id);
    setActiveIntentId(next.id);
    setActiveDistrictId(next.primaryDistrictId);
    setActivePropertyId(undefined);
  };

  const selectDistrict = (id: DistrictId) => {
    setActiveDistrictId(id);
    setActivePropertyId(undefined);
  };

  const openPropertyInquiry = (property: Listing, source: AdvisoryInquirySource = "lens") => {
    const copy = getListingAdvisoryCopy(property, lang);

    openAdvisoryInquiry({
      source,
      intentLabel: activeIntentCopy.label,
      districtLabel: property.districtLabel || property.district || activeDistrictCopy.name,
      propertyTitle: propertyTitle(property, lang),
      propertyId: property.id,
      nextAction: copy.nextAction || L.requestViewingPath,
      advisorNote: copy.advisorReason || copy.acquisitionNote,
    });
  };

  const openLensInquiry = (source: AdvisoryInquirySource = "lens") => {
    openPropertyInquiry(featured, source);
  };

  useEffect(() => {
    if (!mapOpen && !mapClosing) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMap();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeMap, mapClosing, mapOpen]);

  return (
    <>
      <section id="brief" data-bcn-section="intent" className="bcn-home-flow-section bcn-home-flow-section--intent relative mt-28 grid scroll-mt-24 gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
        <div className="bcn-intent-visual-card relative overflow-hidden bg-[rgba(255,255,252,0.72)] shadow-[0_34px_120px_rgba(28,28,24,0.07)] ring-1 ring-[var(--bcn-line)]">
          <div className="bcn-intent-visual-field relative min-h-[620px]">
            <img
              key={activeIntentVisual.src}
              src={activeIntentVisual.src}
              alt={activeIntentVisual.alt}
              className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 motion-reduce:transition-none"
              loading="lazy"
              decoding="async"
              width={activeIntentVisual.width}
              height={activeIntentVisual.height}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,23,22,0.04),rgba(23,23,22,0.34)),linear-gradient(90deg,rgba(248,248,245,0.76),rgba(248,248,245,0.08)_56%,rgba(23,23,22,0.08))]" />

            <div className="absolute left-6 right-6 top-6 flex items-center justify-between gap-4 border-b border-white/45 pb-4 text-[11px] uppercase tracking-[0.18em] text-white/82">
              <span>{L.privateBuyerBrief}</span>
              <span>{activeIntentCopy.atmosphere}</span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 max-w-[560px] bg-[rgba(255,255,252,0.88)] p-6 shadow-[0_26px_90px_rgba(23,23,22,0.13)] backdrop-blur-sm">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--bcn-muted)]">{L.activeIntent}</div>
              <h2 className="mt-4 text-[44px] leading-[0.95] tracking-tight text-[var(--bcn-graphite)] sm:text-[62px]">
                {activeIntentCopy.label}
              </h2>
              <div className="mt-5 grid gap-2 text-[12px] text-[var(--bcn-graphite-soft)] sm:grid-cols-3">
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-[var(--bcn-muted)]">{L.signal}</span>
                  {activeIntentCopy.signal}
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-[var(--bcn-muted)]">{L.risk}</span>
                  {activeIntentCopy.risk}
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-[var(--bcn-muted)]">{L.value}</span>
                  {activeIntentCopy.value}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid content-between gap-6">
          <div>
            <div className="text-[12px] tracking-[0.18em] text-[var(--bcn-muted)]">{L.buyerIntentField}</div>
            <h2 className="mt-5 max-w-[640px] text-[42px] leading-[0.98] tracking-tight text-[var(--bcn-graphite)] sm:text-[64px]">
              {L.intentHeadline}
            </h2>
            <p className="mt-6 max-w-[560px] text-[14px] leading-[1.7] text-[var(--bcn-graphite-soft)]">
              {L.intentBridge}
            </p>
          </div>

          <div className="grid gap-3">
            {buyerIntents.map((intent, i) => {
              const isActive = intent.id === activeIntentId;
              const intentCopy = getBuyerIntentCopy(intent, lang);
              const chips = [intent.primaryDistrictId, ...intent.secondaryDistrictIds].slice(0, 3).map((id) => districtName(id, lang));

              return (
                <button
                  key={intent.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => selectIntent(intent.id)}
                  className={[
                    "group grid gap-4 border text-left transition focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)] motion-reduce:transition-none sm:grid-cols-[64px_1fr_auto] sm:items-center",
                    isActive
                      ? "border-[var(--bcn-line-strong)] bg-white/72 p-5 shadow-[0_28px_90px_rgba(28,28,24,0.08)]"
                      : "border-[var(--bcn-line)] bg-white/34 p-4 hover:bg-white/58",
                  ].join(" ")}
                >
                  <div className="text-[11px] tracking-[0.18em] text-[var(--bcn-muted)]">{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <div
                      className={[
                        "tracking-tight text-[var(--bcn-graphite)]",
                        isActive ? "text-[30px] leading-[1]" : "text-[19px] leading-[1.1]",
                      ].join(" ")}
                    >
                      {intentCopy.label}
                    </div>
                    {isActive && (
                      <div className="mt-3 text-[14px] leading-[1.45] text-[var(--bcn-graphite-soft)]">{intentCopy.advisoryLine}</div>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-start gap-2 sm:max-w-[230px] sm:justify-end">
                    {chips.map((chip) => (
                      <span
                        key={chip}
                        className="border border-[var(--bcn-line)] bg-[var(--bcn-porcelain)] px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-[var(--bcn-muted)]"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="lens" data-bcn-section="lens" className="bcn-home-flow-section bcn-home-flow-section--lens mt-24 scroll-mt-20 space-y-5">
        <div className="grid gap-5 lg:grid-cols-[0.56fr_1.44fr] lg:items-end">
          <div>
            <div className="text-[12px] tracking-[0.18em] text-[var(--bcn-muted)]">{L.lensField}</div>
            <h2 className="mt-3 max-w-[500px] text-[34px] leading-[0.98] tracking-tight text-[var(--bcn-graphite)] sm:text-[48px]">
              {L.lensHeadline}
            </h2>
          </div>
          <div className="bcn-lens-readout grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] lg:ml-auto lg:w-full lg:max-w-[900px]">
            <div className="bcn-lens-readout__item bcn-lens-readout__item--intent">
              <span>{L.intent}</span>
              <strong>{activeIntentCopy.shortLabel}</strong>
            </div>
            <div className="bcn-lens-readout__item bcn-lens-readout__item--district">
              <span>{L.lens}</span>
              <strong>{activeDistrictCopy.name}</strong>
            </div>
            <div className="bcn-lens-readout__item bcn-lens-readout__item--match">
              <span>{L.match}</span>
              <strong>{lensState.matchedPropertyIds.length} {L.matches}</strong>
            </div>
            <button
              type="button"
              onClick={openMap}
              className="bcn-lens-open-button border border-[var(--bcn-line-strong)] bg-[var(--bcn-surface)] px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-[var(--bcn-graphite)] shadow-[var(--bcn-shadow-soft)] hover:border-[var(--bcn-graphite)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)]"
            >
              {L.openMap}
            </button>
          </div>
        </div>

        <div className="bcn-lens-mobile-summary" aria-live="polite">
          <div className="bcn-lens-mobile-summary__brief">
            <div>
              <span>{L.activeBrief}</span>
              <strong>{activeIntentCopy.shortLabel} <em aria-hidden="true">→</em> {activeDistrictCopy.name}</strong>
            </div>
            <p>{totalMatches} {L.matchedOptionsInline}</p>
          </div>

          <div className="bcn-lens-mobile-summary__recommendation">
            <div className="bcn-lens-mobile-summary__eyebrow">{L.topRecommendation}</div>
            <a href={`${prefix}/p/${topMatchProperty.id}`} className="bcn-lens-mobile-summary__title">
              {topMatchTitle}
            </a>
            <div className="bcn-lens-mobile-summary__meta">
              {L.priority} #{topMatchProperty.shortlistPriority} / {L.readiness} {highestReadiness}
            </div>
          </div>

          <div className="bcn-lens-mobile-summary__rows">
            <div>
              <span>{L.signal}</span>
              <strong>{activeDistrictCopy.signal}</strong>
            </div>
            <div>
              <span>{L.buyerFit}</span>
              <strong>{activeDistrictCopy.bestFor}</strong>
            </div>
          </div>

          <div className="bcn-lens-mobile-summary__actions">
            <a href={matchedSearchHref}>{L.viewMatchedOptions}</a>
            <a href={`${prefix}/search`}>{L.searchApartments}</a>
          </div>
        </div>

        <div className="bcn-lens-shell grid overflow-hidden ring-1 ring-[var(--bcn-line)] xl:grid-cols-[minmax(0,1.52fr)_minmax(330px,0.48fr)]">
          <div className="bcn-lens-field relative min-h-[720px] overflow-hidden">
            <img
              src={bcnLensMedia.base.spatial.src}
              alt={bcnLensMedia.base.spatial.alt}
              className="bcn-lens-field__media absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              width={bcnLensMedia.base.spatial.width}
              height={bcnLensMedia.base.spatial.height}
            />
            <div className="bcn-lens-field__wash absolute inset-0" />
            <div className="bcn-lens-field__geometry absolute inset-0 mix-blend-multiply">
              <svg viewBox="0 0 900 620" className="h-full w-full" aria-hidden="true" focusable="false">
                <defs>
                  <radialGradient id="lensGlowB" cx="50%" cy="50%" r="55%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.72" />
                    <stop offset="46%" stopColor="#a8bab5" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#f8f8f5" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx={activeNode.x} cy={activeNode.y} r="250" fill="url(#lensGlowB)" />
                <circle cx={activeNode.x} cy={activeNode.y} r="178" fill="none" stroke="#647c78" strokeOpacity="0.24" strokeWidth="1.2" />
                <circle cx={activeNode.x} cy={activeNode.y} r="96" fill="none" stroke="#171716" strokeOpacity="0.14" />
                <path d="M742 10 C706 124 736 206 702 312 C665 428 707 512 644 620" fill="none" stroke="#647c78" strokeOpacity="0.48" strokeWidth="2.2" />
                <path d="M120 110 C266 80 338 170 454 154 C568 140 621 190 744 168" fill="none" stroke="#171716" strokeOpacity="0.11" strokeWidth="1" />
                <path d="M96 360 C228 312 350 342 448 294 C560 238 632 296 764 260" fill="none" stroke="#171716" strokeOpacity="0.1" strokeWidth="1" />
                <path d="M160 520 C268 462 388 492 492 430 C590 372 680 408 812 370" fill="none" stroke="#171716" strokeOpacity="0.08" strokeWidth="1" />
                {propertyAnchors.map((anchor, i) => (
                  <g key={`${anchor.x}-${anchor.y}`}>
                    <line
                      x1={activeNode.x}
                      y1={activeNode.y}
                      x2={anchor.x}
                      y2={anchor.y}
                      stroke="#647c78"
                      strokeOpacity={i === 0 ? "0.34" : "0.16"}
                      strokeWidth={i === 0 ? "1.4" : "0.8"}
                    />
                    <circle cx={anchor.x} cy={anchor.y} r={i === 0 ? "6" : "4"} fill="#647c78" fillOpacity={i === 0 ? "0.66" : "0.34"} />
                  </g>
                ))}
              </svg>
            </div>

            <div className="bcn-lens-field__header absolute left-5 right-5 top-5 grid gap-4 sm:left-8 sm:right-8 sm:top-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="bcn-lens-field__intro max-w-[390px]">
                <div className="bcn-lens-field__eyebrow">{L.districtIntelligence}</div>
                <div className="bcn-lens-field__active-signal">{activeDistrictCopy.signal}</div>
                <div className="bcn-lens-intent-tags mt-4 flex flex-wrap gap-2" aria-label={L.intentSignals}>
                  {activeIntentCopy.signalTags.slice(0, 3).map((tag) => (
                    <span key={tag} className="bcn-lens-intent-tag border border-[rgba(100,124,120,0.22)] bg-[rgba(251,250,247,0.62)] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[var(--bcn-graphite-soft)] backdrop-blur-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bcn-lens-district-card hidden w-[210px] overflow-hidden bg-[rgba(251,250,247,0.72)] shadow-[var(--bcn-shadow-soft)] ring-1 ring-[rgba(23,23,22,0.12)] backdrop-blur-md md:block">
                <img
                  src={activeDistrictVisual.src}
                  alt={activeDistrictVisual.alt}
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  width={activeDistrictVisual.width}
                  height={activeDistrictVisual.height}
                />
                <div className="bcn-lens-district-card__caption border-t border-[var(--bcn-line)] px-3 py-2 text-[11px] leading-[1.35] text-[var(--bcn-graphite-soft)]">
                  {activeDistrictCopy.rhythm}
                </div>
              </div>
            </div>

            {districtLens.map((district) => {
              const isActive = district.id === activeDistrictId;
              const isIntentMatch = matchedDistrictIds.includes(district.id);
              const districtCopy = getDistrictLensCopy(district, lang);

              return (
                <button
                  key={district.id}
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`${districtCopy.name}: ${districtCopy.signal}`}
                  onClick={() => selectDistrict(district.id)}
                  onFocus={() => selectDistrict(district.id)}
                  style={{ left: district.node.x, top: district.node.y }}
                  className={[
                    "bcn-lens-node group absolute -translate-x-1/2 -translate-y-1/2 text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)]",
                    isActive ? "bcn-lens-node--active" : isIntentMatch ? "bcn-lens-node--match" : "bcn-lens-node--quiet",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "bcn-lens-node__halo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition duration-500 motion-reduce:transition-none",
                      isActive
                        ? "h-36 w-36 border-[rgba(100,124,120,0.64)] bg-[rgba(255,255,252,0.18)] opacity-100 shadow-[0_24px_86px_rgba(100,124,120,0.2)]"
                        : isIntentMatch
                          ? "h-[5.75rem] w-[5.75rem] border-[rgba(100,124,120,0.34)] opacity-80 group-hover:scale-105"
                          : "h-14 w-14 border-[rgba(168,186,181,0.28)] opacity-50 group-hover:scale-105",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "bcn-lens-node__dot relative flex rounded-full border transition duration-500 motion-reduce:transition-none",
                      isActive
                        ? "h-9 w-9 border-[rgba(255,255,252,0.76)] bg-[var(--bcn-sea-deep)] shadow-[0_0_0_15px_rgba(168,186,181,0.22),0_16px_46px_rgba(23,23,22,0.16)]"
                        : isIntentMatch
                          ? "h-5 w-5 border-[rgba(23,23,22,0.44)] bg-[var(--bcn-sea-glass)] shadow-[0_0_0_8px_rgba(168,186,181,0.16)]"
                          : "h-4 w-4 border-[rgba(23,23,22,0.28)] bg-[rgba(168,186,181,0.78)] shadow-[0_0_0_6px_rgba(168,186,181,0.1)]",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "bcn-lens-node__label absolute left-7 top-1/2 min-w-[118px] -translate-y-1/2 border px-3 py-2 shadow-[var(--bcn-shadow-soft)] backdrop-blur-md transition duration-500 motion-reduce:transition-none",
                      isActive
                        ? "min-w-[152px] border-[rgba(168,186,181,0.48)] bg-[rgba(23,23,22,0.86)] text-[var(--bcn-porcelain)]"
                        : isIntentMatch
                          ? "border-[rgba(100,124,120,0.24)] bg-[rgba(251,250,247,0.76)] text-[var(--bcn-graphite)]"
                          : "border-transparent bg-[rgba(251,250,247,0.36)] text-[rgba(23,23,22,0.58)] opacity-80",
                    ].join(" ")}
                  >
                    <span className={isActive ? "text-[18px] leading-none tracking-tight" : "text-[13px] leading-none tracking-tight"}>{districtCopy.name}</span>
                    <span className={isActive ? "mt-1 block text-[10px] uppercase tracking-[0.14em] text-white/58" : "mt-1 block text-[10px] uppercase tracking-[0.13em] text-[var(--bcn-muted)]"}>
                      {districtCopy.signal}
                    </span>
                  </span>
                </button>
              );
            })}

            <div className="bcn-lens-signal-strip absolute bottom-5 left-5 right-5 grid gap-2 sm:left-8 sm:right-8 sm:grid-cols-4">
              {[...activeDistrictCopy.reportSignals, `${totalMatches} ${L.matches}`].map((x, index) => (
                <div key={x} className={["bcn-lens-signal-strip__item", index >= activeDistrictCopy.reportSignals.length ? "bcn-lens-signal-strip__item--match" : ""].join(" ")}>
                  <span>{index < activeDistrictCopy.reportSignals.length ? L.signal : L.match}</span>
                  <strong>{x}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="bcn-lens-report border-t border-[var(--bcn-line)] xl:border-l xl:border-t-0">
            <div className="bcn-lens-report__plate text-[var(--bcn-porcelain)]" aria-live="polite">
              <div className="bcn-lens-report__hero relative overflow-hidden">
                <img
                  src={activeDistrictVisual.src}
                  alt={activeDistrictVisual.alt}
                  className="bcn-lens-report__image h-[230px] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  width={activeDistrictVisual.width}
                  height={activeDistrictVisual.height}
                />
                <div className="bcn-lens-report__image-wash absolute inset-0 bg-[linear-gradient(180deg,rgba(23,23,22,0.02),rgba(23,23,22,0.62))]" />
                <div className="bcn-lens-report__title absolute bottom-5 left-5 right-5">
                  <div className="bcn-lens-report__eyebrow text-[10px] uppercase tracking-[0.2em] text-white/58">{L.activeDistrictReport}</div>
                  <h3 className="mt-3 text-[42px] leading-[0.95] tracking-tight text-white">{activeDistrictCopy.name}</h3>
                </div>
              </div>
              <div className="bcn-lens-report__body p-6 sm:p-7">
                <div className="bcn-lens-report__rows grid gap-4 text-[13px] leading-[1.45] text-white/76">
                  <div className="bcn-lens-report__row"><span>{L.signal}</span> {activeDistrictCopy.signal}</div>
                  <div className="bcn-lens-report__row"><span>{L.buyerFit}</span> {activeDistrictCopy.bestFor}</div>
                  <div className="bcn-lens-report__row"><span>{L.risk}</span> {activeDistrictCopy.risk}</div>
                  <div className="bcn-lens-report__row"><span>{L.valueLogic}</span> {activeDistrictCopy.valueLogic}</div>
                  <div className="bcn-lens-report__row bcn-lens-report__row--match"><span>{L.match}</span> {totalMatches} {L.matches}</div>
                </div>
                <button
                  type="button"
                  onClick={openMap}
                  className="bcn-lens-report__cta mt-7 border border-white/26 bg-white/[0.04] px-4 py-2.5 text-[11px] uppercase tracking-[0.16em] text-white/82 hover:border-white/52 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/70"
                >
                  {L.openMap}
                </button>
              </div>
            </div>

            <div className="bcn-lens-report__summary" aria-live="polite">
              <div className="bcn-lens-report__matches-heading px-5 pb-2 pt-5 text-[10px] uppercase tracking-[0.2em] text-[var(--bcn-muted)]">{L.topRecommendation}</div>
              <div className="bcn-lens-report__top-match mx-5 mb-5">
                <a
                  href={`${prefix}/p/${topMatchProperty.id}`}
                  className="bcn-lens-report__top-link group grid gap-4 p-4 text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)] sm:grid-cols-[104px_1fr]"
                  aria-label={`${L.openProperty} ${propertyTitle(topMatchProperty, lang)}`}
                >
                  <img
                    src={topMatchVisual.src}
                    alt={topMatchVisual.alt}
                    className="bcn-lens-report__top-image aspect-[1.22/1] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={topMatchVisual.width}
                    height={topMatchVisual.height}
                  />
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--bcn-sea-deep)]">
                      {rankLabelText(topMatch.rankLabel)}
                    </div>
                    <div className="bcn-lens-report__match-title mt-2 text-[20px] leading-[1.05] text-[var(--bcn-graphite)]">
                      {topMatchTitle}
                    </div>
                    <div className="bcn-lens-report__top-signal mt-3 text-[12px] leading-[1.45] text-[var(--bcn-graphite-soft)]">{topMatchCopy.signal}</div>
                  </div>
                </a>
                <div className="bcn-lens-report__summary-grid grid grid-cols-3 border-t border-[var(--bcn-line)] text-[11px] text-[var(--bcn-muted)]">
                  <div><span>{L.matchedOptions}</span><strong>{totalMatches}</strong></div>
                  <div><span>{L.readiness}</span><strong>{highestReadiness}</strong></div>
                  <div><span>{L.priority}</span><strong>#{topMatchProperty.shortlistPriority}</strong></div>
                </div>
                <div className="mt-4 grid gap-2">
                  <a
                    href={matchedSearchHref}
                    className="bcn-lens-report__search-link text-center text-[11px] uppercase tracking-[0.15em] text-[var(--bcn-graphite)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)]"
                  >
                    {L.viewAllMatchedOptions}
                  </a>
                  <button
                    type="button"
                    onClick={() => openPropertyInquiry(topMatchProperty, "lens")}
                    className="bcn-lens-report__request-button text-[12px] text-[var(--bcn-graphite-soft)] hover:text-[var(--bcn-graphite)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)]"
                  >
                    {topMatchCopy.nextAction || L.requestViewingPath}
                  </button>
                </div>
              </div>
            </div>

            <div className="bcn-lens-district-selector border-t border-[var(--bcn-line)] px-5 py-4">
              <div className="bcn-lens-district-selector__heading mb-3 text-[10px] uppercase tracking-[0.2em] text-[var(--bcn-muted)]">{L.districtSignals}</div>
              <div className="bcn-lens-district-selector__grid grid grid-cols-2 gap-2">
                {districtLens.map((district) => {
                  const isActive = district.id === activeDistrictId;
                  const districtCopy = getDistrictLensCopy(district, lang);

                  return (
                    <button
                      key={`district-signal-${district.id}`}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => selectDistrict(district.id)}
                      className={[
                        "bcn-lens-district-selector__button min-h-11 border px-3 py-2 text-left text-[12px] leading-[1.2] transition focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--bcn-sea-deep)]",
                        isActive
                          ? "bcn-lens-district-selector__button--active border-[var(--bcn-line-strong)] bg-[var(--bcn-porcelain)] text-[var(--bcn-graphite)] shadow-[inset_2px_0_0_var(--bcn-sea-deep)]"
                          : "border-[var(--bcn-line)] bg-[rgba(255,255,252,0.34)] text-[var(--bcn-graphite-soft)] hover:border-[var(--bcn-line-strong)]",
                      ].join(" ")}
                    >
                      <span className="block tracking-tight">{districtCopy.name}</span>
                      <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-[var(--bcn-muted)]">{districtCopy.signal}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="bcn-lens-match-rail" aria-live="polite">
          <div className="bcn-lens-match-rail__header">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--bcn-muted)]">{L.matchedRecommendations}</div>
              <div className="mt-2 text-[24px] leading-[1.05] text-[var(--bcn-graphite)]">
                {visibleMatches.length} {L.topMatches}
              </div>
            </div>
            <a
              href={matchedSearchHref}
              className="bcn-lens-match-rail__search text-[11px] uppercase tracking-[0.15em] text-[var(--bcn-graphite-soft)] hover:text-[var(--bcn-graphite)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)]"
            >
              {hiddenMatches > 0 ? `+ ${hiddenMatches} ${L.moreInPrivateSearch}` : L.openPrivateSearch}
            </a>
          </div>

          <div className="bcn-lens-match-rail__grid">
            {visibleMatches.map(({ property, rankLabel }, i) => {
              const visual = propertyVisual(property);
              const copy = getListingAdvisoryCopy(property, lang);

              return (
                <article key={`lens-rail-${property.id}`} className="bcn-lens-match-rail__card">
                  <a href={`${prefix}/p/${property.id}`} className="bcn-lens-match-rail__media" aria-label={`${L.openProperty} ${propertyTitle(property, lang)}`}>
                    <img
                      src={visual.src}
                      alt={visual.alt}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      width={visual.width}
                      height={visual.height}
                    />
                  </a>
                  <div className="bcn-lens-match-rail__copy">
                    <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--bcn-muted)]">
                      {L.match} {String(i + 1).padStart(2, "0")} / {rankLabelText(rankLabel)}
                    </div>
                    <a href={`${prefix}/p/${property.id}`} className="bcn-lens-match-rail__title mt-3 block text-[20px] leading-[1.08] text-[var(--bcn-graphite)] hover:text-[var(--bcn-sea-deep)]">
                      {propertyTitle(property, lang)}
                    </a>
                    <div className="mt-2 text-[12px] text-[var(--bcn-muted)]">
                      {property.districtLabel || property.district} / {copy.viewingReadinessLabel} / {L.priority} #{property.shortlistPriority}
                    </div>
                    <p className="bcn-lens-match-rail__signal mt-4 text-[12px] leading-[1.5] text-[var(--bcn-graphite-soft)]">{copy.signal}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <a
                        href={`${prefix}/p/${property.id}`}
                        className="rounded-full border border-[var(--bcn-line-strong)] bg-white/60 px-4 py-2 text-[12px] text-[var(--bcn-graphite)] hover:border-[var(--bcn-graphite)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)]"
                      >
                        {L.openProperty}
                      </a>
                      <button
                        type="button"
                        onClick={() => openPropertyInquiry(property, "lens")}
                        className="rounded-full border border-[var(--bcn-line)] px-4 py-2 text-[12px] text-[var(--bcn-graphite-soft)] hover:border-[var(--bcn-line-strong)] hover:text-[var(--bcn-graphite)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)]"
                      >
                        {copy.nextAction || L.requestViewingPath}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {mounted ? createPortal(<div
        aria-hidden={!mapOpen}
        role="dialog"
        aria-modal="true"
        aria-label={L.atlasLabel}
        className={[
          "fixed inset-0 z-[220] h-[100dvh] overflow-hidden bg-[rgba(248,248,245,0.98)] transition-[opacity,filter] duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
          mapOpen ? "pointer-events-auto opacity-100 blur-0" : "pointer-events-none opacity-0 blur-[1.5px]",
        ].join(" ")}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_44%,rgba(168,186,181,0.26),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(222,219,210,0.34),transparent_28%),linear-gradient(180deg,rgba(255,255,252,0.76),rgba(246,246,242,0.98))]" />
        <img
          src={bcnLensMedia.base.spatial.src}
          alt={bcnLensMedia.base.spatial.alt}
          className={[
            "absolute inset-0 h-full w-full object-cover opacity-[0.28] transition duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
            mapOpen ? "scale-100 blur-0" : "scale-[1.06] blur-sm",
          ].join(" ")}
          loading="lazy"
          decoding="async"
          width={bcnLensMedia.base.spatial.width}
          height={bcnLensMedia.base.spatial.height}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,248,245,0.78),rgba(248,248,245,0.28)_38%,rgba(246,245,240,0.68)_100%)]" />
        <div
          className={[
            "absolute inset-3 border border-[rgba(23,23,22,0.16)] transition duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none sm:inset-5",
            mapOpen ? "scale-100 opacity-100" : "scale-[0.94] opacity-0",
          ].join(" ")}
        />

        <div
          className={[
            "absolute left-4 right-24 top-4 z-40 transition delay-150 duration-700 motion-reduce:transition-none sm:left-8 sm:right-72 sm:top-7",
            mapOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
          ].join(" ")}
        >
          <div className="max-w-[min(64vw,520px)]">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--bcn-muted)]">{L.districtIntelligence}</div>
            <div className="mt-2 text-[24px] leading-[0.98] tracking-tight text-[var(--bcn-graphite)] sm:text-[38px]">
              {activeDistrictCopy.name}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={closeMap}
          className={[
            "bcn-lens-atlas-close absolute right-4 top-4 z-50 transition delay-150 duration-700 motion-reduce:transition-none sm:right-8 sm:top-7",
            mapOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
          ].join(" ")}
          aria-label={L.closeMap}
        >
          <span className="bcn-lens-atlas-close__label">{L.closeMap}</span>
          <span aria-hidden="true" className="bcn-lens-atlas-close__icon">x</span>
        </button>

        <div
          className={[
            "bcn-lens-atlas-intent-rail absolute left-7 top-[118px] z-10 hidden w-[248px] transition delay-200 duration-700 motion-reduce:transition-none xl:block",
            mapOpen ? "translate-x-0 opacity-100" : "-translate-x-5 opacity-0",
          ].join(" ")}
        >
          <div className="bcn-lens-atlas-intent-rail__heading">
            <span>{L.intentSignals}</span>
            <strong>{activeIntentCopy.shortLabel}</strong>
          </div>
          {buyerIntents.map((intent, index) => {
            const isActive = intent.id === activeIntentId;
            const intentCopy = getBuyerIntentCopy(intent, lang);

            return (
              <button
                key={`atlas-intent-${intent.id}`}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectIntent(intent.id)}
                className={[
                  "bcn-lens-atlas-intent block w-full px-4 py-3 text-left transition motion-reduce:transition-none",
                  isActive
                    ? "bcn-lens-atlas-intent--active"
                    : "",
                ].join(" ")}
              >
                <div className="bcn-lens-atlas-intent__meta">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{intentCopy.shortLabel}</span>
                </div>
                <div className="bcn-lens-atlas-intent__signal">{intentCopy.signal}</div>
              </button>
            );
          })}
        </div>

        <div
          className={[
            "bcn-lens-field absolute inset-x-4 top-[112px] bottom-[92px] z-0 overflow-hidden shadow-[0_50px_180px_rgba(28,28,24,0.12)] ring-1 ring-[var(--bcn-line)] transition delay-100 duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none xl:left-[316px] xl:right-[382px]",
            mapOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-[0.96] opacity-0",
          ].join(" ")}
        >
          <img
            src={bcnLensMedia.base.spatial.src}
            alt=""
            aria-hidden="true"
            className="bcn-lens-field__media absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            width={bcnLensMedia.base.spatial.width}
            height={bcnLensMedia.base.spatial.height}
          />
          <div className="bcn-lens-field__wash absolute inset-0" />
          <svg viewBox="0 0 1100 760" className="bcn-lens-field__geometry absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
            <defs>
              <radialGradient id="mapGlowFull" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.72" />
                <stop offset="46%" stopColor="#a8bab5" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#f8f8f5" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={activeNode.x * 1.18 + 38} cy={activeNode.y * 1.16 + 38} r="315" fill="url(#mapGlowFull)" />
            <circle cx={activeNode.x * 1.18 + 38} cy={activeNode.y * 1.16 + 38} r="235" fill="none" stroke="#647c78" strokeOpacity="0.22" />
            <circle cx={activeNode.x * 1.18 + 38} cy={activeNode.y * 1.16 + 38} r="132" fill="none" stroke="#171716" strokeOpacity="0.13" />
            <path d="M874 0 C826 148 862 254 820 388 C775 532 820 642 744 760" fill="none" stroke="#647c78" strokeOpacity="0.48" strokeWidth="3" />
            <path d="M110 146 C312 92 408 216 550 190 C692 166 746 236 918 206" fill="none" stroke="#171716" strokeOpacity="0.1" />
            <path d="M80 438 C254 366 410 412 540 340 C686 260 766 348 944 300" fill="none" stroke="#171716" strokeOpacity="0.1" />
            <path d="M168 646 C314 566 456 610 604 520 C716 452 836 494 1014 438" fill="none" stroke="#171716" strokeOpacity="0.08" />
            {propertyAnchors.map((anchor, i) => (
              <g key={`full-${anchor.x}-${anchor.y}`}>
                <line
                  x1={activeNode.x * 1.18 + 38}
                  y1={activeNode.y * 1.16 + 38}
                  x2={anchor.x * 1.22}
                  y2={anchor.y * 1.12 + 18}
                  stroke="#647c78"
                  strokeOpacity={i === 0 ? "0.34" : "0.16"}
                  strokeWidth={i === 0 ? "1.6" : "0.8"}
                />
                <circle cx={anchor.x * 1.22} cy={anchor.y * 1.12 + 18} r={i === 0 ? "7" : "4"} fill="#647c78" fillOpacity={i === 0 ? "0.68" : "0.34"} />
              </g>
            ))}
          </svg>

          <div className="absolute left-5 top-5 max-w-[280px] sm:left-8 sm:top-8">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--bcn-muted)]">{L.lens}</div>
            <div className="mt-3 text-[30px] leading-[0.95] tracking-tight text-[var(--bcn-graphite)] sm:text-[48px]">{activeDistrictCopy.name}</div>
            <div className="mt-4 inline-flex border border-[var(--bcn-line)] bg-white/58 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[var(--bcn-sea-deep)] backdrop-blur-sm">
              {activeDistrictCopy.signal}
            </div>
          </div>

          {districtLens.map((district, i) => {
            const isActive = district.id === activeDistrictId;
            const isIntentMatch = matchedDistrictIds.includes(district.id);
            const fullNode = nodeCoord(district.id);
            const districtCopy = getDistrictLensCopy(district, lang);

            return (
              <button
                key={`map-${district.id}`}
                type="button"
                aria-pressed={isActive}
                aria-label={`${districtCopy.name}: ${districtCopy.signal}`}
                onClick={() => selectDistrict(district.id)}
                style={{ left: fullNode.x * 0.107 + 4 + "%", top: fullNode.y * 0.132 + 5 + "%" }}
                className={[
                  "bcn-lens-node group absolute -translate-x-1/2 -translate-y-1/2 text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)]",
                  isActive ? "bcn-lens-node--active" : isIntentMatch ? "bcn-lens-node--match" : "bcn-lens-node--quiet",
                ].join(" ")}
              >
                <span
                  className={[
                    "bcn-lens-node__halo absolute left-1/2 top-1/2 rounded-full border transition duration-500 motion-reduce:transition-none",
                    "-translate-x-1/2 -translate-y-1/2",
                    isActive
                      ? "h-36 w-36 border-[rgba(100,124,120,0.64)] bg-[rgba(255,255,252,0.18)] shadow-[0_24px_90px_rgba(100,124,120,0.2)] sm:h-44 sm:w-44"
                      : isIntentMatch
                        ? "h-24 w-24 border-[rgba(100,124,120,0.34)] opacity-85 group-hover:scale-105 sm:h-28 sm:w-28"
                        : "h-14 w-14 border-[rgba(168,186,181,0.3)] opacity-60 group-hover:scale-105 sm:h-18 sm:w-18",
                  ].join(" ")}
                />
                <span
                  className={[
                    "bcn-lens-node__dot relative flex rounded-full border transition duration-500 motion-reduce:transition-none",
                    isActive
                      ? "h-8 w-8 border-[rgba(255,255,252,0.76)] bg-[var(--bcn-sea-deep)] shadow-[0_0_0_14px_rgba(168,186,181,0.22),0_16px_46px_rgba(23,23,22,0.16)] sm:h-10 sm:w-10"
                      : isIntentMatch
                        ? "h-5 w-5 border-[rgba(23,23,22,0.44)] bg-[var(--bcn-sea-glass)] shadow-[0_0_0_8px_rgba(168,186,181,0.16)] sm:h-6 sm:w-6"
                        : "h-4 w-4 border-[rgba(23,23,22,0.28)] bg-[rgba(168,186,181,0.78)] shadow-[0_0_0_7px_rgba(168,186,181,0.1)]",
                  ].join(" ")}
                />
                <span
                  className={[
                    "bcn-lens-node__label absolute left-7 top-1/2 min-w-[118px] -translate-y-1/2 border px-3 py-2 shadow-[var(--bcn-shadow-soft)] backdrop-blur-md sm:left-8 sm:px-4 sm:py-3",
                    isActive
                      ? "min-w-[168px] border-[rgba(168,186,181,0.48)] bg-[rgba(23,23,22,0.86)] text-[var(--bcn-porcelain)]"
                      : isIntentMatch
                        ? "border-[rgba(100,124,120,0.24)] bg-[rgba(251,250,247,0.76)] text-[var(--bcn-graphite)]"
                        : "border-transparent bg-[rgba(251,250,247,0.36)] text-[rgba(23,23,22,0.58)] opacity-80",
                  ].join(" ")}
                >
                  <span className={isActive ? "text-[18px] leading-none tracking-tight sm:text-[22px]" : "text-[13px] leading-none tracking-tight sm:text-[14px]"}>{districtCopy.name}</span>
                  <span className={isActive ? "mt-1 block text-[10px] uppercase tracking-[0.14em] text-white/58" : "mt-1 block text-[10px] uppercase tracking-[0.13em] text-[var(--bcn-muted)]"}>
                    {districtCopy.signal}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          className={[
            "bcn-lens-atlas-report absolute right-7 top-[112px] bottom-[92px] z-10 hidden w-[340px] transition delay-200 duration-700 motion-reduce:transition-none xl:block",
            mapOpen ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0",
          ].join(" ")}
        >
          <div className="bcn-lens-atlas-report__plate flex h-full flex-col overflow-hidden bg-[var(--bcn-graphite)] text-[var(--bcn-porcelain)] shadow-[0_34px_110px_rgba(23,23,22,0.18)]">
            <img
              src={activeDistrictVisual.src}
              alt={activeDistrictVisual.alt}
              className="h-[22%] w-full shrink-0 object-cover opacity-88"
              loading="lazy"
              decoding="async"
              width={activeDistrictVisual.width}
              height={activeDistrictVisual.height}
            />
            <div className="shrink-0 p-5 pb-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/46">{L.activeDistrict}</div>
              <div className="mt-3 text-[34px] leading-[0.95] tracking-tight">{activeDistrictCopy.name}</div>
              <div className="mt-5 grid gap-2 text-[13px] leading-[1.35] text-white/70">
                <div><span className="text-white/40">{L.fit}:</span> {activeDistrictCopy.bestFor}</div>
                <div><span className="text-white/40">{L.risk}:</span> {activeDistrictCopy.risk}</div>
                <div><span className="text-white/40">{L.value}:</span> {activeDistrictCopy.valueShort}</div>
              </div>
            </div>
            <div className="bcn-lens-atlas-report__matches min-h-0 flex-1 overflow-y-auto px-4 pb-4">
              <div className="mb-2 flex items-end justify-between gap-3 border-t border-white/12 pt-4">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.18em] text-white/42">{L.topMatches}</div>
                  <div className="mt-1 text-[12px] text-white/68">
                    {visibleMatches.length} {L.topMatches.toLowerCase()}
                  </div>
                </div>
                <a href={matchedSearchHref} className="text-right text-[9px] uppercase tracking-[0.14em] text-white/58 hover:text-white">
                  {L.openPrivateSearch}
                </a>
              </div>
              <div className="grid gap-2">
              {visibleMatches.map(({ property }, i) => {
                const visual = propertyVisual(property);
                const copy = getListingAdvisoryCopy(property, lang);

                return (
                <a
                  key={`map-property-${property.id}`}
                  href={`${prefix}/p/${property.id}`}
                  className="grid grid-cols-[64px_1fr] gap-3 border border-white/12 bg-white/[0.06] p-2 text-left hover:border-white/28 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                >
                  <img
                    src={visual.src}
                    alt={visual.alt}
                    className="aspect-[1.12/1] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={visual.width}
                    height={visual.height}
                  />
                  <div className="py-1">
                    <div className="text-[9px] uppercase tracking-[0.16em] text-white/44">{L.match} {String(i + 1).padStart(2, "0")}</div>
                    <div className="mt-2 text-[14px] leading-[1.1] text-white">{propertyTitle(property, lang)}</div>
                    <div className="mt-2 text-[11px] leading-[1.25] text-white/52">{L.priority} #{property.shortlistPriority} / {copy.viewingReadinessLabel}</div>
                  </div>
                </a>
              )})}
              </div>
              {hiddenMatches > 0 && (
                <a
                  href={matchedSearchHref}
                  className="mt-3 block border border-white/12 bg-white/[0.04] px-3 py-2 text-[11px] text-white/62 hover:border-white/28 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                >
                  + {hiddenMatches} {L.moreInPrivateSearch}
                </a>
              )}
            </div>
          </div>
        </div>

        <div
          className={[
            "absolute bottom-4 left-4 right-4 z-20 grid grid-cols-3 gap-2 transition delay-300 duration-700 motion-reduce:transition-none sm:bottom-6 sm:left-7 sm:right-7",
            mapOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          ].join(" ")}
        >
          {activeDistrictCopy.reportSignals.map((x) => (
            <div key={`full-${x}`} className="bg-white/66 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[var(--bcn-muted)] shadow-[0_12px_40px_rgba(28,28,24,0.05)] backdrop-blur-md sm:text-[11px] sm:tracking-[0.14em]">
              {x}
            </div>
          ))}
        </div>
      </div>, document.body) : null}

      <section id="properties" data-bcn-section="signal" className="bcn-home-flow-section bcn-home-flow-section--signal mt-28 scroll-mt-24 space-y-10">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <div className="text-[12px] tracking-[0.18em] text-[var(--bcn-muted)]">{L.curatedPropertyField}</div>
            <h2 className="mt-5 max-w-[620px] text-[42px] leading-[0.98] tracking-tight text-[var(--bcn-graphite)] sm:text-[64px]">
              {L.propertyHeadline}
            </h2>
            <p className="mt-6 max-w-[560px] text-[14px] leading-[1.7] text-[var(--bcn-graphite-soft)]">
              {L.propertyBridge}
            </p>
          </div>
          <div className="max-w-[760px] border-y border-[var(--bcn-line)] py-4 text-[13px] leading-[1.65] text-[var(--bcn-graphite-soft)] lg:ml-auto">
            {L.currentMatch}: <span className="text-[var(--bcn-graphite)]">{`${activeIntentCopy.label} -> ${activeDistrictCopy.name} -> ${propertyTitle(featured, lang)} -> ${featuredCopy.nextAction}`}</span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.48fr_0.52fr]">
          <div
            key={featured.id}
            className="bcn-property-signal-card group grid min-h-[680px] overflow-hidden bg-[rgba(255,255,252,0.72)] shadow-[0_44px_140px_rgba(28,28,24,0.1)] ring-1 ring-[var(--bcn-line)] lg:grid-cols-[1.15fr_0.85fr]"
            onMouseEnter={() => setActivePropertyId(featured.id)}
            onFocus={() => setActivePropertyId(featured.id)}
          >
            <div className="bcn-property-signal-media relative min-h-[500px] bg-[linear-gradient(135deg,var(--bcn-limestone),var(--bcn-porcelain))]">
              <ShortlistToggle id={featured.id} lang={lang} className="absolute right-5 top-5 z-10" />
              <a href={`${prefix}/p/${featured.id}`} aria-label={`${L.viewProperty} ${propertyTitle(featured, lang)}`}>
                <img
                  src={featuredVisual.src}
                  alt={featuredVisual.alt}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.012] motion-reduce:transition-none"
                  loading="eager"
                  decoding="async"
                  width={featuredVisual.width}
                  height={featuredVisual.height}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_52%,rgba(23,23,22,0.34))]" />
              </a>
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center gap-2">
                <span className="bg-[rgba(255,255,252,0.88)] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-[var(--bcn-sea-deep)] backdrop-blur-sm">
                  {L.advisorSelected}
                </span>
                <span className="bg-[rgba(255,255,252,0.88)] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-[var(--bcn-muted)] backdrop-blur-sm">
                  {activeDistrictCopy.signal}
                </span>
              </div>
            </div>
            <div className="bcn-property-signal-body flex flex-col justify-between p-8 sm:p-10">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-[11px] tracking-[0.2em] text-[var(--bcn-muted)]">{L.productObject}</div>
                  <div className="border border-[var(--bcn-line)] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--bcn-sea-deep)]">
                    {rankLabelText(featuredRecommendation.rankLabel)}
                  </div>
                </div>
                <a href={`${prefix}/p/${featured.id}`} className="block">
                  <h3 className="mt-6 text-[42px] leading-[0.98] tracking-tight text-[var(--bcn-graphite)]">{propertyTitle(featured, lang)}</h3>
                </a>
                <div className="mt-4 text-[13px] text-[var(--bcn-muted)]">
                  {featured.district} / {featured.sqm} m² / EUR {fmtEUR(featured.price)}
                </div>
                <div className="bcn-property-signal-readout mt-6 grid gap-3 border-y border-[var(--bcn-line)] py-4 text-[12px] leading-[1.55] text-[var(--bcn-graphite-soft)]">
                  <div className="bcn-property-signal-fit"><span className="text-[var(--bcn-muted)]">{L.bestFor}:</span> {featuredCopy.bestFor}</div>
                  <div className="bcn-property-signal-core"><span className="text-[var(--bcn-muted)]">{L.signal}:</span> {featuredCopy.signal}</div>
                  <div className="bcn-property-signal-tradeoff"><span className="text-[var(--bcn-muted)]">{L.tradeOff}:</span> {featuredCopy.tradeOff}</div>
                </div>
              </div>

              <div className="bcn-property-signal-memo mt-10 bg-[var(--bcn-porcelain)] p-6 ring-1 ring-[var(--bcn-line)]" aria-live="polite">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--bcn-muted)]">{L.advisorMemo}</div>
                <p className="mt-4 text-[24px] leading-[1.18] tracking-tight text-[var(--bcn-graphite)]">
                  {featuredCopy.advisorReason}
                </p>
                <div className="mt-6 grid gap-2 text-[12px] text-[var(--bcn-graphite-soft)] sm:grid-cols-3">
                  <div><span className="block text-[var(--bcn-muted)]">{L.readiness}</span>{featuredCopy.viewingReadinessLabel}</div>
                  <div><span className="block text-[var(--bcn-muted)]">{L.priority}</span>#{featured.shortlistPriority}</div>
                  <div><span className="block text-[var(--bcn-muted)]">{L.next}</span>{featuredCopy.nextAction}</div>
                </div>
                <div className="mt-5 border-t border-[var(--bcn-line)] pt-4 text-[12px] leading-[1.55] text-[var(--bcn-muted)]">
                  {featuredCopy.acquisitionNote}
                </div>
                <div className="bcn-property-signal-actions mt-5 flex flex-wrap gap-2">
                  <ShortlistToggle id={featured.id} lang={lang} className="border-[var(--bcn-line-strong)] bg-white px-4 py-2 text-[12px]" />
                  <button
                    type="button"
                    onClick={() => openLensInquiry("lens")}
                    className="rounded-full border border-[var(--bcn-line)] bg-white/50 px-4 py-2 text-[12px] text-[var(--bcn-graphite-soft)] hover:border-[var(--bcn-line-strong)] hover:text-[var(--bcn-graphite)]"
                  >
                    {featuredCopy.nextAction}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bcn-property-supporting-list grid content-center gap-0">
            {supporting.map(({ property, rankLabel }, i) => {
              const isActive = lensState.activePropertyId === property.id;
              const visual = propertyVisual(property);
              const copy = getListingAdvisoryCopy(property, lang);

              return (
                <div
                  key={property.id}
                  className={[
                    "bcn-property-supporting-card",
                    "group grid min-h-[220px] grid-cols-[136px_1fr] bg-[rgba(255,255,252,0.78)] shadow-[0_20px_70px_rgba(28,28,24,0.05)] ring-1 transition hover:-translate-y-1 hover:shadow-[var(--bcn-shadow-soft)] motion-reduce:transition-none",
                    i ? "-mt-3" : "",
                    isActive ? "ring-[var(--bcn-line-strong)]" : "ring-[var(--bcn-line)]",
                  ].join(" ")}
                  onMouseEnter={() => setActivePropertyId(property.id)}
                  onFocus={() => setActivePropertyId(property.id)}
                >
                  <div className="relative bg-[linear-gradient(135deg,var(--bcn-limestone),var(--bcn-porcelain))]">
                    <ShortlistToggle id={property.id} lang={lang} className="absolute left-2 top-2 z-10 px-2 py-1 text-[11px]" />
                    <a href={`${prefix}/p/${property.id}`} aria-label={`${L.viewProperty} ${propertyTitle(property, lang)}`}>
                      <img
                        src={visual.src}
                        alt={visual.alt}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02] motion-reduce:transition-none"
                        loading="lazy"
                        decoding="async"
                        width={visual.width}
                        height={visual.height}
                      />
                    </a>
                  </div>
                  <a href={`${prefix}/p/${property.id}`} className="flex flex-col justify-between p-4">
                    <div>
                      <div className="text-[10px] tracking-[0.18em] text-[var(--bcn-muted)]">{L.alternative} {String(i + 1).padStart(2, "0")} / {rankLabelText(rankLabel)}</div>
                      <div className="mt-2 text-[18px] leading-[1.1] tracking-tight text-[var(--bcn-graphite)]">{propertyTitle(property, lang)}</div>
                      <div className="mt-2 text-[12px] text-[var(--bcn-muted)]">{propertyMeta(property)}</div>
                    </div>
                    <div className="bcn-property-supporting-detail mt-4 border-t border-[var(--bcn-line)] pt-3 text-[12px] leading-[1.45] text-[var(--bcn-graphite-soft)]">
                      <span className="text-[var(--bcn-muted)]">{L.bestFor}:</span> {copy.bestFor}
                    </div>
                    <div className="bcn-property-supporting-badges mt-3 flex flex-wrap gap-2">
                      <span className="border border-[var(--bcn-line)] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--bcn-sea-deep)]">
                        {L.priority} {property.shortlistPriority}
                      </span>
                      <span className="border border-[var(--bcn-line)] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--bcn-muted)]">
                        {copy.viewingReadinessLabel}
                      </span>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="dossier" data-bcn-section="dossier" className="bcn-home-flow-section bcn-home-flow-section--dossier mt-28 grid scroll-mt-24 gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-center">
        <div className="space-y-5">
          <div className="text-[12px] tracking-[0.18em] text-[var(--bcn-muted)]">{L.shortlistDossier}</div>
          <h2 className="max-w-[620px] text-[42px] leading-[0.98] tracking-tight text-[var(--bcn-graphite)] sm:text-[64px]">
            {L.dossierHeadline}
          </h2>
          <p className="max-w-[560px] text-[14px] leading-[1.7] text-[var(--bcn-graphite-soft)]">
            {L.dossierBridge}
          </p>
          <div className="grid max-w-[560px] gap-2 text-[12px] uppercase tracking-[0.14em] text-[var(--bcn-muted)] sm:grid-cols-3">
            <div className="border-y border-[var(--bcn-line)] py-3">{L.intentSelected}</div>
            <div className="border-y border-[var(--bcn-line)] py-3">{L.lensFormed}</div>
            <div className="border-y border-[var(--bcn-line)] py-3">{L.shortlistReady}</div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              data-open-shortlist
              type="button"
              className="rounded-full border border-[var(--bcn-line-strong)] bg-[var(--bcn-surface)] px-5 py-2.5 text-[12px] text-[var(--bcn-graphite)] shadow-[var(--bcn-shadow-soft)] hover:border-[var(--bcn-graphite)]"
            >
              {L.buildShortlist}: {activeDistrictCopy.name}
            </button>
            <button
              type="button"
              onClick={() => openLensInquiry("lens")}
              className="rounded-full border border-[var(--bcn-line)] px-5 py-2.5 text-[12px] text-[var(--bcn-graphite-soft)] hover:border-[var(--bcn-line-strong)] hover:text-[var(--bcn-graphite)]"
            >
              {L.requestViewingPath}: {activeIntentCopy.shortLabel}
            </button>
          </div>
        </div>

        <div className="overflow-hidden bg-[var(--bcn-surface)] shadow-[0_38px_130px_rgba(28,28,24,0.1)] ring-1 ring-[var(--bcn-line-strong)]">
          <div className="relative overflow-hidden bg-[var(--bcn-graphite)] p-6 text-[var(--bcn-porcelain)] sm:p-7">
            <img
              src={bcnLensMedia.materials.handoff.src}
              alt={bcnLensMedia.materials.handoff.alt}
              className="absolute inset-0 h-full w-full object-cover opacity-[0.18]"
              loading="lazy"
              decoding="async"
              width={bcnLensMedia.materials.handoff.width}
              height={bcnLensMedia.materials.handoff.height}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,23,22,0.95),rgba(23,23,22,0.76))]" />
            <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/16 pb-5">
              <div>
                <div className="text-[11px] tracking-[0.2em] text-white/52">{L.dossierDistrict}</div>
                <div className="mt-3 text-[28px] leading-[1.05] tracking-tight">{activeDistrictCopy.name} / {activeIntentCopy.shortLabel}</div>
              </div>
              <div className="border border-white/18 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-white/64">{L.readyToSend}</div>
            </div>
            <div className="relative mt-5 grid gap-3 text-[12px] leading-[1.45] text-white/62 sm:grid-cols-3">
              <div>{Math.min(3, recommendationResult.matchedCount)} {L.selected}</div>
              <div>{activeDistrictCopy.signal}</div>
              <div>{activeIntentCopy.risk}</div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="grid border-y border-[var(--bcn-line)]" aria-live="polite">
              {recommendationResult.recommendations.slice(0, 3).map(({ property }, i) => {
                const visual = propertyVisual(property);

                return (
                <div key={property.id} className="grid gap-4 border-b border-[var(--bcn-line)] py-4 last:border-b-0 sm:grid-cols-[88px_1fr_0.86fr] sm:items-center">
                  <a href={`${prefix}/p/${property.id}`} className="block overflow-hidden bg-[var(--bcn-limestone)]">
                    <img
                      src={visual.src}
                      alt={visual.alt}
                      className="aspect-[1.18/1] w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      width={visual.width}
                      height={visual.height}
                    />
                  </a>
                  <div>
                    <div className="text-[10px] tracking-[0.18em] text-[var(--bcn-muted)]">{String(i + 1).padStart(2, "0")} / {property.code}</div>
                    <a href={`${prefix}/p/${property.id}`} className="mt-2 block text-[18px] leading-[1.1] tracking-tight text-[var(--bcn-graphite)]">
                      {propertyTitle(property, lang)}
                    </a>
                    <div className="mt-1 text-[12px] text-[var(--bcn-muted)]">{property.district}</div>
                  </div>
                  <div>
                    <div className="inline-flex border border-[var(--bcn-line)] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--bcn-sea-deep)]">
                      {L.priority} {property.shortlistPriority} / {getListingAdvisoryCopy(property, lang).viewingReadinessLabel}
                    </div>
                    <div className="mt-3 text-[12px] leading-[1.45] text-[var(--bcn-graphite-soft)]">{getListingAdvisoryCopy(property, lang).tradeOff}</div>
                  </div>
                </div>
              )})}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                data-open-shortlist
                type="button"
                className="rounded-full border border-[var(--bcn-line-strong)] bg-white/52 px-4 py-2 text-[12px] text-[var(--bcn-graphite)] hover:border-[var(--bcn-graphite)]"
              >
                {L.sendShortlist}
              </button>
              <button
                type="button"
                onClick={() => openLensInquiry("dossier")}
                className="rounded-full border border-[var(--bcn-line)] px-4 py-2 text-[12px] text-[var(--bcn-muted)] hover:border-[var(--bcn-line-strong)] hover:text-[var(--bcn-graphite)]"
              >
                {L.bookAdvisoryCall}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
