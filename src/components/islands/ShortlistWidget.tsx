import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Listing } from "../../data/listings";
import { useShortlist } from "../../hooks/useShortlist";
import { getListingAdvisoryCopy, type AdvisoryLang } from "../../lib/getListingAdvisoryCopy";
import { openAdvisoryInquiry } from "./AdvisoryInquiryPanel";

type Lang = "en" | "es";
type DossierStatus = "empty" | "building" | "ready";

type WindowWithShortlist = Window & {
  __scOpenShortlist?: () => void;
  __scPendingShortlistOpen?: boolean;
};

const ui = (lang: Lang) => {
  const en = {
    button: "Dossier",
    close: "Close",
    copied: "Copied",
    copySummary: "Copy dossier summary",
    copyLink: "Copy dossier link",
    copyPrompt: "Copy dossier summary:",
    copyLinkPrompt: "Copy dossier link:",
    clear: "Clear",
    none: "No selected options yet",
    saved: "selected",
    imported: "Private shortlist imported from link.",
    open: "Open property",
    remove: "Remove",
    title: "Private Shortlist Dossier",
    subtitle: "Advisor-ready selection",
    intro: "Selected properties for review, trade-off comparison and viewing path.",
    request: "Request viewing path",
    handoffEyebrow: "Advisory handoff",
    handoffTitle: "Ready to turn this shortlist into a viewing path?",
    handoffText: "Your selected properties, priorities and trade-offs can be converted into a copy-ready advisory brief.",
    handoffCta: "Prepare viewing path request",
    summaryOnly: "Copy dossier summary exports selected properties only.",
    inquiryBrief: "Copy inquiry brief adds buyer notes, timing and contact.",
    explore: "Explore recommendations",
    count: "Selected",
    highestReadiness: "Highest readiness",
    topPriority: "Top priority",
    districts: "Districts",
    next: "Next",
    status: "Dossier status",
    statusEmpty: "Empty dossier",
    statusBuilding: "Building shortlist",
    statusReady: "Advisor-ready",
    comparison: "Trade-off comparison",
    property: "Property",
    bestFor: "Best for",
    signal: "Signal",
    tradeoff: "Trade-off",
    risk: "Risk note",
    viewTradeRisk: "View trade-off / risk",
    readiness: "Readiness",
    priority: "Priority",
    district: "District",
    area: "Area",
    bedrooms: "Bedrooms",
    nextAction: "Next action",
    emptyTitle: "Your private dossier is empty.",
    emptyCopy: "Select properties from the advisory board to build a focused shortlist.",
    summaryTitle: "Private Shortlist Dossier",
  };

  const es = {
    button: "Dossier",
    close: "Cerrar",
    copied: "Copiado",
    copySummary: "Copiar resumen del dossier",
    copyLink: "Copiar enlace del dossier",
    copyPrompt: "Copiar resumen del dossier:",
    copyLinkPrompt: "Copiar enlace del dossier:",
    clear: "Limpiar",
    none: "Aún no hay opciones",
    saved: "seleccionadas",
    imported: "Shortlist privada importada desde el enlace.",
    open: "Abrir propiedad",
    remove: "Quitar",
    title: "Dossier privado de selección",
    subtitle: "Selección preparada para asesoría",
    intro: "Propiedades seleccionadas para revisar, comparar y solicitar visita.",
    request: "Solicitar ruta de visita",
    handoffEyebrow: "Handoff de asesoría",
    handoffTitle: "¿Listo para convertir esta shortlist en una ruta de visita?",
    handoffText: "Tus propiedades seleccionadas, prioridades y compensaciones pueden convertirse en un brief preparado para asesoría.",
    handoffCta: "Preparar solicitud de ruta de visita",
    summaryOnly: "Copiar resumen del dossier exporta solo las propiedades seleccionadas.",
    inquiryBrief: "Copiar brief de solicitud añade notas, timing y contacto.",
    explore: "Explorar recomendaciones",
    count: "Seleccionadas",
    highestReadiness: "Mayor preparación",
    topPriority: "Prioridad principal",
    districts: "Distritos",
    next: "Siguiente",
    status: "Estado del dossier",
    statusEmpty: "Dossier vacío",
    statusBuilding: "Construyendo shortlist",
    statusReady: "Preparado para asesoría",
    comparison: "Comparación de compensaciones",
    property: "Propiedad",
    bestFor: "Ideal para",
    signal: "Señal",
    tradeoff: "Compensación",
    risk: "Nota de riesgo",
    viewTradeRisk: "Ver compensación / riesgo",
    readiness: "Preparación",
    priority: "Prioridad",
    district: "Distrito",
    area: "Superficie",
    bedrooms: "Dormitorios",
    nextAction: "Siguiente acción",
    emptyTitle: "Tu dossier privado está vacío.",
    emptyCopy: "Selecciona propiedades desde el panel de asesoría para crear una lista enfocada.",
    summaryTitle: "Dossier privado de selección",
  };

  return lang === "es" ? es : en;
};

const readinessRank: Record<string, number> = {
  High: 3,
  Medium: 2,
  Selective: 1,
};

const formatEUR = (n: number) => `EUR ${Intl.NumberFormat("en-US").format(Math.round(n))}`;

function titleFor(x: Listing, lang: Lang) {
  return lang === "es" ? x.title_es ?? x.title : x.title;
}

function districtFor(x: Listing) {
  return x.districtLabel || x.district || "Barcelona";
}

function commercialMetaFor(x: Listing, lang: Lang) {
  const beds = lang === "es" ? "hab" : "bd";
  return `${districtFor(x)} / ${x.beds} ${beds} / ${x.sqm} m\u00b2 / ${formatEUR(x.price)}`;
}

function commercialFactsFor(x: Listing, lang: Lang) {
  const beds = lang === "es" ? "hab" : "bd";
  return `${districtFor(x)} / ${x.beds} ${beds} / ${x.sqm} m\u00b2`;
}

function statusFor(count: number): DossierStatus {
  if (count === 0) return "empty";
  if (count < 3) return "building";
  return "ready";
}

function statusLabel(status: DossierStatus, L: ReturnType<typeof ui>) {
  if (status === "ready") return L.statusReady;
  if (status === "building") return L.statusBuilding;
  return L.statusEmpty;
}

function highestReadiness(items: Listing[], lang: AdvisoryLang) {
  const best = [...items].sort(
    (a, b) => (readinessRank[b.viewingReadiness] ?? 0) - (readinessRank[a.viewingReadiness] ?? 0)
  )[0];
  return best ? getListingAdvisoryCopy(best, lang).viewingReadinessLabel : "-";
}

function topPriority(items: Listing[]) {
  const best = [...items].sort((a, b) => a.shortlistPriority - b.shortlistPriority)[0];
  return best ? `#${best.shortlistPriority}` : "-";
}

function topNextAction(items: Listing[], fallback: string, lang: AdvisoryLang) {
  const best = [...items].sort((a, b) => a.shortlistPriority - b.shortlistPriority)[0];
  return best ? getListingAdvisoryCopy(best, lang).nextAction : fallback;
}

function districtSpread(items: Listing[]) {
  const districts = Array.from(new Set(items.map(districtFor).filter(Boolean)));
  return districts.length ? districts.join(", ") : "-";
}

function buildDossierSummary(items: Listing[], lang: Lang) {
  const L = ui(lang);
  const lines = [L.summaryTitle, ""];

  items.forEach((x, index) => {
    const copy = getListingAdvisoryCopy(x, lang);
    lines.push(`${index + 1}. ${titleFor(x, lang)}`);
    lines.push(`${L.district}: ${districtFor(x)}`);
    lines.push(`${L.bestFor}: ${copy.bestFor || "-"}`);
    lines.push(`${L.signal}: ${copy.signal || "-"}`);
    lines.push(`${L.tradeoff}: ${copy.tradeOff || "-"}`);
    lines.push(`${L.risk}: ${copy.riskNote || "-"}`);
    lines.push(`${L.readiness}: ${copy.viewingReadinessLabel || "-"}`);
    lines.push(`${L.nextAction}: ${copy.nextAction || L.request}`);
    lines.push("");
  });

  return lines.join("\n").trim();
}

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [imported, setImported] = useState(false);
  const [mounted, setMounted] = useState(false);

  const items = useMemo(
    () => ids.map((id) => listings.find((x) => x.id === id)).filter(Boolean) as Listing[],
    [ids, listings]
  );

  const status = statusFor(items.length);
  const summaryStats = [
    { label: L.count, value: `${items.length}` },
    { label: L.highestReadiness, value: highestReadiness(items, lang) },
    { label: L.topPriority, value: topPriority(items) },
    { label: L.districts, value: districtSpread(items) },
    { label: L.next, value: topNextAction(items, L.request, lang) },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

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
    const openDrawer = () => setOpen(true);
    const w = window as WindowWithShortlist;

    window.addEventListener("sc:shortlist_ui_open", openDrawer);
    w.__scOpenShortlist = openDrawer;

    if (w.__scPendingShortlistOpen) {
      w.__scPendingShortlistOpen = false;
      window.setTimeout(openDrawer, 0);
    }

    return () => {
      window.removeEventListener("sc:shortlist_ui_open", openDrawer);

      const current = window as WindowWithShortlist;
      if (current.__scOpenShortlist === openDrawer) {
        delete current.__scOpenShortlist;
      }
    };
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

  const copyDossierSummary = async () => {
    if (!items.length) return;

    const text = buildDossierSummary(items, lang);

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt(L.copyPrompt, text);
    }
  };

  const copyShareLink = async () => {
    if (!ids.length) return;

    const base = lang === "es" ? "/es/search" : "/search";
    const url = new URL(base, window.location.origin);
    url.searchParams.set("shortlist", ids.join(","));
    url.searchParams.set("open_shortlist", "1");

    const text = url.toString();

    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1600);
    } catch {
      window.prompt(L.copyLinkPrompt, text);
    }
  };

  const openDossierInquiry = (listing?: Listing) => {
    const copy = listing ? getListingAdvisoryCopy(listing, lang) : undefined;
    const selected = listing ? [listing, ...items.filter((item) => item.id !== listing.id)] : items;
    const ordered = [...selected].sort((a, b) => a.shortlistPriority - b.shortlistPriority);
    const top = ordered[0];

    openAdvisoryInquiry({
      source: "dossier",
      districtLabel: listing ? districtFor(listing) : districtSpread(items),
      propertyTitle: listing ? titleFor(listing, lang) : undefined,
      propertyId: listing?.id,
      nextAction: copy?.nextAction || topNextAction(items, L.request, lang),
      selectedListings: selected,
      advisorNote: copy?.advisorReason || copy?.acquisitionNote,
      dossierMeta: {
        selectedCount: selected.length,
        districtSpread: districtSpread(selected),
        topPriorityTitle: top ? titleFor(top, lang) : undefined,
        highestReadiness: highestReadiness(selected, lang),
        selectedTitles: selected.map((item) => titleFor(item, lang)),
      },
    });
  };

  const drawerUI = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-x-0 top-14 bottom-0 z-[80] bg-[rgba(23,23,22,0.24)] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          <motion.aside
            className="bcn-dossier-drawer fixed right-0 top-14 z-[90] h-[calc(100vh-3.5rem)] w-[min(96vw,760px)] overflow-y-auto border-l border-[var(--bcn-line-strong)] bg-[var(--bcn-surface)] shadow-[var(--bcn-shadow-soft)]"
            initial={{ x: 24, opacity: 0, filter: "blur(8px)" }}
            animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ x: 24, opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.36, ease: [0.2, 0.8, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortlist-dossier-title"
          >
            <div className="bg-[var(--bcn-graphite)] px-5 py-4 text-[var(--bcn-porcelain)] sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] tracking-[0.2em] text-white/52">{L.subtitle}</div>
                  <div id="shortlist-dossier-title" className="mt-2 text-[24px] leading-[1.02] tracking-tight">
                    {L.title}
                  </div>
                  <p className="mt-2 max-w-[520px] text-[12px] leading-[1.5] text-white/62">{L.intro}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/18 px-3 py-1.5 text-[12px] text-white/72 outline-none hover:border-white/34 hover:text-white focus-visible:ring-2 focus-visible:ring-white/35"
                >
                  {L.close}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/14 pt-3">
                <div className="border border-white/14 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-white/72">
                  {count ? `${count} ${L.saved}` : L.none}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {imported && (
                <div className="mb-3 border border-[var(--bcn-line)] bg-white px-3 py-2 text-[12px] text-[var(--bcn-muted)]">
                  {L.imported}
                </div>
              )}

              {!items.length ? (
                <div className="border border-[var(--bcn-line)] bg-white p-5">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--bcn-muted)]">
                    {L.status}: {statusLabel(status, L)}
                  </div>
                  <div className="mt-4 text-[24px] leading-[1.05] tracking-tight text-[var(--bcn-graphite)]">{L.emptyTitle}</div>
                  <p className="mt-3 max-w-[420px] text-[13px] leading-[1.65] text-[var(--bcn-muted)]">{L.emptyCopy}</p>
                  <a
                    href={lang === "es" ? "/es/search" : "/search"}
                    className="mt-4 inline-flex rounded-full border border-[var(--bcn-line-strong)] px-3 py-1.5 text-[12px] text-[var(--bcn-graphite)] outline-none hover:border-[var(--bcn-graphite)] focus-visible:ring-2 focus-visible:ring-black/20"
                  >
                    {L.explore}
                  </a>
                </div>
              ) : (
                <>
                  <section className="bcn-dossier-command border border-[var(--bcn-line)] bg-white p-3.5">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                      <div>
                        <div className="grid gap-2 sm:grid-cols-5">
                          {summaryStats.map((stat) => (
                            <div key={stat.label} className="bcn-dossier-command__stat">
                              <div className="text-[9px] uppercase tracking-[0.13em] text-[var(--bcn-muted)]">{stat.label}</div>
                              <div className="mt-1 line-clamp-2 text-[12px] leading-[1.25] text-[var(--bcn-graphite)]">{stat.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openDossierInquiry()}
                        className="justify-self-start rounded-full border border-[var(--bcn-graphite)] bg-[var(--bcn-graphite)] px-4 py-2 text-[12px] text-[var(--bcn-porcelain)] outline-none hover:bg-black focus-visible:ring-2 focus-visible:ring-black/20 lg:justify-self-end"
                      >
                        {L.handoffCta}
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--bcn-line)] pt-3">
                      <div className="max-w-[320px] text-[11px] leading-[1.4] text-[var(--bcn-muted)]">{L.inquiryBrief}</div>
                      <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={copyDossierSummary}
                        className="rounded-full border border-[var(--bcn-line)] px-3 py-1.5 text-[12px] text-[var(--bcn-muted)] outline-none hover:border-[var(--bcn-line-strong)] hover:text-[var(--bcn-graphite)] focus-visible:ring-2 focus-visible:ring-black/20"
                      >
                        {copied ? L.copied : L.copySummary}
                      </button>
                      <button
                        type="button"
                        onClick={copyShareLink}
                        className="rounded-full border border-[var(--bcn-line)] px-3 py-1.5 text-[12px] text-[var(--bcn-muted)] outline-none hover:border-[var(--bcn-line-strong)] hover:text-[var(--bcn-graphite)] focus-visible:ring-2 focus-visible:ring-black/20"
                      >
                        {copiedLink ? L.copied : L.copyLink}
                      </button>
                      <a
                        href={lang === "es" ? "/es/search" : "/search"}
                        className="rounded-full border border-[var(--bcn-line)] px-3 py-1.5 text-[12px] text-[var(--bcn-muted)] outline-none hover:border-[var(--bcn-line-strong)] hover:text-[var(--bcn-graphite)] focus-visible:ring-2 focus-visible:ring-black/20"
                      >
                        {L.explore}
                      </a>
                        <button
                          type="button"
                          onClick={clear}
                          className="rounded-full border border-[var(--bcn-line)] px-3 py-1.5 text-[12px] text-[var(--bcn-muted)] outline-none hover:border-[var(--bcn-line-strong)] hover:text-[var(--bcn-graphite)] focus-visible:ring-2 focus-visible:ring-black/20"
                        >
                          {L.clear}
                        </button>
                      </div>
                    </div>
                  </section>
                </>
              )}

              <div className="mt-3 grid gap-2.5">
                {items.map((x, index) => {
                  const copy = getListingAdvisoryCopy(x, lang);

                  return (
                  <article
                    key={x.id}
                    className="bcn-dossier-entry bcn-dossier-property-row overflow-hidden border border-[var(--bcn-line)] bg-white shadow-[0_12px_36px_rgba(28,28,24,0.04)]"
                  >
                    <div className="bcn-dossier-property-shell grid gap-0 sm:grid-cols-[220px_1fr]">
                      <a
                        href={`${prefix}/p/${x.id}`}
                        className="bcn-dossier-property-thumb block bg-[linear-gradient(135deg,var(--bcn-limestone),var(--bcn-porcelain))] outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                        aria-label={`${L.open}: ${titleFor(x, lang)}`}
                      >
                        <img
                          src={x.images.hero}
                          alt={titleFor(x, lang)}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </a>
                      <div className="bcn-dossier-property-body p-3">
                        <div className="bcn-dossier-property-topline grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                          <div className="min-w-0">
                            <div className="text-[10px] tracking-[0.18em] text-[var(--bcn-muted)]">
                              {String(index + 1).padStart(2, "0")} / {x.code}
                            </div>
                            <a
                              href={`${prefix}/p/${x.id}`}
                              className="mt-1 line-clamp-2 block text-[17px] font-medium leading-[1.12] text-[var(--bcn-graphite)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-black/20"
                            >
                              {titleFor(x, lang)}
                            </a>
                            <div className="bcn-dossier-property-meta mt-1 text-[12px] leading-[1.35] text-[var(--bcn-graphite-soft)]">
                              {commercialFactsFor(x, lang)}
                              <span className="sr-only"> / {commercialMetaFor(x, lang)}</span>
                            </div>
                          </div>
                          <div className="bcn-dossier-property-price">{formatEUR(x.price)}</div>
                        </div>

                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          <span className="border border-[var(--bcn-line)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--bcn-sea-deep)]">
                            {L.priority} #{x.shortlistPriority}
                          </span>
                          <span className="border border-[var(--bcn-line)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--bcn-sea-deep)]">
                            {L.readiness}: {copy.viewingReadinessLabel}
                          </span>
                        </div>

                        <div className="bcn-dossier-property-readout mt-2 grid gap-1 border-t border-[var(--bcn-line)] pt-2 text-[12px] leading-[1.34] text-[var(--bcn-graphite-soft)]">
                          <div>
                            <span className="text-[var(--bcn-muted)]">{L.bestFor}:</span>{" "}
                            <span className="line-clamp-1">{copy.bestFor}</span>
                          </div>
                          <div>
                            <span className="text-[var(--bcn-muted)]">{L.signal}:</span>{" "}
                            <span className="line-clamp-1">{copy.signal}</span>
                          </div>
                        </div>

                        <details className="bcn-dossier-risk-disclosure mt-2 text-[11px] leading-[1.45] text-[var(--bcn-muted)]">
                          <summary className="inline-flex cursor-pointer items-center gap-2 text-[var(--bcn-graphite-soft)]">
                            <span>{L.viewTradeRisk}</span>
                            <span aria-hidden="true" className="bcn-dossier-risk-disclosure__mark">+</span>
                          </summary>
                          <div className="mt-2 grid gap-1.5 border-t border-[var(--bcn-line)] pt-2">
                            <div>{copy.tradeOff}</div>
                            <div>{copy.riskNote}</div>
                          </div>
                        </details>

                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <a
                            href={`${prefix}/p/${x.id}`}
                            className="rounded-full border border-[var(--bcn-line-strong)] px-3 py-1.5 text-[12px] text-[var(--bcn-graphite)] outline-none hover:border-[var(--bcn-graphite)] focus-visible:ring-2 focus-visible:ring-black/20"
                          >
                            {L.open}
                          </a>
                          <button
                            type="button"
                            onClick={() => openDossierInquiry(x)}
                            className="rounded-full border border-[var(--bcn-line)] px-3 py-1.5 text-[12px] text-[var(--bcn-muted)] outline-none hover:border-[var(--bcn-line-strong)] hover:text-[var(--bcn-graphite)] focus-visible:ring-2 focus-visible:ring-black/20"
                          >
                            {copy.nextAction || L.request}
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(x.id)}
                            className="rounded-full border border-[var(--bcn-line)] px-3 py-1.5 text-[12px] text-[var(--bcn-muted)] outline-none hover:border-[var(--bcn-line-strong)] hover:text-[var(--bcn-graphite)] focus-visible:ring-2 focus-visible:ring-black/20"
                            aria-label={`${L.remove}: ${titleFor(x, lang)}`}
                          >
                            {L.remove}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )})}
              </div>

              {items.length > 1 && (
                <details className="bcn-dossier-comparison mt-4 border border-[var(--bcn-line)] bg-[var(--bcn-porcelain)] p-4">
                  <summary className="cursor-pointer text-[11px] uppercase tracking-[0.18em] text-[var(--bcn-muted)]">
                    {L.comparison}
                  </summary>
                  <div className="mt-3 grid gap-2">
                    {items.map((x) => {
                      const copy = getListingAdvisoryCopy(x, lang);

                      return (
                      <div key={`compare-${x.id}`} className="border-t border-[var(--bcn-line)] bg-white/40 pt-3">
                        <div className="text-[13px] font-medium leading-[1.25] text-[var(--bcn-graphite)]">{titleFor(x, lang)}</div>
                        <div className="mt-2 grid gap-2 text-[12px] leading-[1.45] text-[var(--bcn-graphite-soft)] sm:grid-cols-2">
                          <div><span className="text-[var(--bcn-muted)]">{L.tradeoff}:</span> {copy.tradeOff}</div>
                          <div><span className="text-[var(--bcn-muted)]">{L.readiness}:</span> {copy.viewingReadinessLabel}</div>
                        </div>
                      </div>
                    )})}
                  </div>
                </details>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          "rounded-full border border-[var(--bcn-line)] bg-white/26 px-3 py-1.5 text-[12px] text-[var(--bcn-graphite-soft)] outline-none hover:border-[var(--bcn-line-strong)] hover:bg-white/46 hover:text-[var(--bcn-graphite)] focus-visible:ring-2 focus-visible:ring-black/20",
          className,
        ].join(" ")}
        aria-label={L.title}
      >
        {L.button}
        {count ? ` · ${count}` : ""}
      </button>

      {mounted ? createPortal(drawerUI, document.body) : null}
    </>
  );
}
