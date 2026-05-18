import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Listing } from "../../data/listings";
import { useShortlist } from "../../hooks/useShortlist";
import { getListingAdvisoryCopy } from "../../lib/getListingAdvisoryCopy";

type Lang = "en" | "es";

export type AdvisoryInquirySource = "hero" | "lens" | "property" | "gallery" | "dossier" | "search" | "contact";

export type AdvisoryInquiryContext = {
  source: AdvisoryInquirySource;
  intentLabel?: string;
  districtLabel?: string;
  propertyTitle?: string;
  propertyId?: string;
  nextAction?: string;
  selectedListings?: Listing[];
  advisorNote?: string;
  dossierMeta?: {
    selectedCount?: number;
    districtSpread?: string;
    topPriorityTitle?: string;
    highestReadiness?: string;
    selectedTitles?: string[];
  };
};

type InquiryEvent = CustomEvent<Partial<AdvisoryInquiryContext>>;
type InquiryClickEvent = MouseEvent & { __bcnInquiryHandled?: boolean };
type WindowWithInquiry = Window & {
  __bcnOpenInquiry?: (detail: Partial<AdvisoryInquiryContext>) => void;
  __bcnPendingInquiry?: Partial<AdvisoryInquiryContext> | null;
};

const ADVISORY_EMAIL = "";
const WHATSAPP_PHONE = "";

const ui = (lang: Lang) => {
  const en = {
    title: "Request viewing path",
    subtitle: "A private advisory request prepared from your current search context.",
    dossierTitle: "Private dossier handoff",
    dossierSubtitle: "This brief is prepared from your selected properties, priorities and trade-offs.",
    close: "Close",
    context: "Context summary",
    source: "Source",
    intent: "Intent",
    district: "District lens",
    property: "Selected property",
    dossier: "Dossier",
    next: "Next action",
    open: "Open",
    notSpecified: "Not specified yet",
    notSelected: "Not selected",
    selectedProperties: "selected properties",
    districtSpread: "District spread",
    topPriority: "Top priority",
    highestReadiness: "Highest readiness",
    selectedList: "Selected properties",
    bestFor: "Best for",
    signal: "Signal",
    tradeOff: "Trade-off",
    readiness: "Readiness",
    buyerNotes: "Buyer notes",
    notesPlaceholder: "Add timing, budget, constraints or questions.",
    timing: "Preferred timing",
    contact: "Contact",
    name: "Name",
    email: "Email",
    phone: "Phone / WhatsApp optional",
    copy: "Copy inquiry brief",
    copied: "Brief copied",
    emailDraft: "Open email draft",
    emailOpened: "Email draft opened",
    whatsappDraft: "Open WhatsApp draft",
    whatsappOpened: "WhatsApp draft opened",
    returnDossier: "Return to dossier",
    continue: "Continue exploring",
    fallbackPrompt: "Copy inquiry brief:",
    heading: "Barcelona Private Advisory - Viewing Path Request",
    advisorNote: "Advisor note",
    notes: "Buyer notes",
    timingLabel: "Preferred timing",
    contactLabel: "Contact",
    timings: ["This week", "Next week", "Flexible", "Just researching"],
    defaultNext: "Start private search",
    privacyNote: "This brief is prepared locally from your current selection. Nothing is sent automatically.",
    sourceLabels: {
      hero: "Private search",
      lens: "Barcelona Lens",
      search: "Private search",
      contact: "Contact handoff",
      property: "Property detail",
      gallery: "Gallery inspection",
      dossier: "Private dossier",
    },
  };

  const es = {
    title: "Solicitar ruta de visita",
    subtitle: "Una solicitud privada preparada a partir de tu contexto de búsqueda.",
    dossierTitle: "Handoff del dossier privado",
    dossierSubtitle: "Este brief se prepara desde tus propiedades seleccionadas, prioridades y compensaciones.",
    close: "Cerrar",
    context: "Resumen del contexto",
    source: "Origen",
    intent: "Intención",
    district: "Lente de distrito",
    property: "Propiedad seleccionada",
    dossier: "Dossier",
    next: "Siguiente acción",
    open: "Abierto",
    notSpecified: "Aún no especificado",
    notSelected: "No seleccionada",
    selectedProperties: "propiedades seleccionadas",
    districtSpread: "Distritos",
    topPriority: "Prioridad principal",
    highestReadiness: "Mayor preparación",
    selectedList: "Propiedades seleccionadas",
    bestFor: "Ideal para",
    signal: "Señal",
    tradeOff: "Compensación",
    readiness: "Preparación",
    buyerNotes: "Notas del comprador",
    notesPlaceholder: "Añade timing, presupuesto, limitaciones o preguntas.",
    timing: "Momento preferido",
    contact: "Contacto",
    name: "Nombre",
    email: "Email",
    phone: "Teléfono / WhatsApp opcional",
    copy: "Copiar brief de solicitud",
    copied: "Brief copiado",
    emailDraft: "Abrir borrador de email",
    emailOpened: "Borrador de email abierto",
    whatsappDraft: "Abrir borrador de WhatsApp",
    whatsappOpened: "Borrador de WhatsApp abierto",
    returnDossier: "Volver al dossier",
    continue: "Seguir explorando",
    fallbackPrompt: "Copiar brief de solicitud:",
    heading: "Barcelona Private Advisory - Solicitud de ruta de visita",
    advisorNote: "Nota del asesor",
    notes: "Notas del comprador",
    timingLabel: "Momento preferido",
    contactLabel: "Contacto",
    timings: ["Esta semana", "Próxima semana", "Flexible", "Solo estoy investigando"],
    defaultNext: "Iniciar búsqueda privada",
    privacyNote: "Este brief se prepara localmente a partir de tu selección actual. No se envía nada automáticamente.",
    sourceLabels: {
      hero: "Búsqueda privada",
      lens: "Barcelona Lens",
      search: "Búsqueda privada",
      contact: "Handoff de contacto",
      property: "Detalle de propiedad",
      gallery: "Inspección de galería",
      dossier: "Dossier privado",
    },
  };

  return lang === "es" ? es : en;
};

function titleFor(listing: Listing, lang: Lang) {
  return lang === "es" ? listing.title_es ?? listing.title : listing.title;
}

function districtFor(listing: Listing) {
  return listing.districtLabel || listing.district || "Barcelona";
}

const readinessRank: Record<string, number> = {
  High: 3,
  Alta: 3,
  Medium: 2,
  Media: 2,
  Selective: 1,
  Selectiva: 1,
};

function hasRealEmailTarget(value: string) {
  return !!value && !value.endsWith("@example.com");
}

function hasRealWhatsAppTarget(value: string) {
  return !!value;
}

function normalizeSource(value: unknown): AdvisoryInquirySource {
  if (
    value === "lens" ||
    value === "property" ||
    value === "gallery" ||
    value === "dossier" ||
    value === "search" ||
    value === "contact"
  ) return value;
  return "hero";
}

function contextFromDataset(target: HTMLElement): Partial<AdvisoryInquiryContext> {
  return {
    source: normalizeSource(target.dataset.inquirySource),
    intentLabel: target.dataset.inquiryIntent,
    districtLabel: target.dataset.inquiryDistrict,
    propertyTitle: target.dataset.inquiryPropertyTitle,
    propertyId: target.dataset.inquiryPropertyId,
    nextAction: target.dataset.inquiryNextAction,
    advisorNote: target.dataset.inquiryAdvisorNote,
  };
}

export function openAdvisoryInquiry(detail: Partial<AdvisoryInquiryContext>) {
  window.dispatchEvent(new CustomEvent("bcn:inquiry_open", { detail }));
}

export default function AdvisoryInquiryPanel({
  listings,
  lang = "en",
}: {
  listings: Listing[];
  lang?: Lang;
}) {
  const L = ui(lang);
  const shouldReduceMotion = useReducedMotion();
  const { ids } = useShortlist();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<AdvisoryInquiryContext>({ source: "hero" });
  const [notes, setNotes] = useState("");
  const [timing, setTiming] = useState(L.timings[2]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [handoffStatus, setHandoffStatus] = useState<"copied" | "email" | "whatsapp" | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const shortlistItems = useMemo(
    () => ids.map((id) => listings.find((x) => x.id === id)).filter(Boolean) as Listing[],
    [ids, listings],
  );

  const selectedListings = context.selectedListings?.length ? context.selectedListings : shortlistItems;
  const contextProperty = context.propertyId ? listings.find((x) => x.id === context.propertyId) : undefined;
  const propertyTitle = context.propertyTitle || (contextProperty ? titleFor(contextProperty, lang) : undefined);
  const districtSpread = context.dossierMeta?.districtSpread ||
    (selectedListings.length ? Array.from(new Set(selectedListings.map(districtFor))).join(", ") : undefined);
  const topPriorityListing = selectedListings.length
    ? [...selectedListings].sort((a, b) => a.shortlistPriority - b.shortlistPriority)[0]
    : undefined;
  const topPriorityTitle = context.dossierMeta?.topPriorityTitle || (topPriorityListing ? titleFor(topPriorityListing, lang) : undefined);
  const highestReadiness = context.dossierMeta?.highestReadiness ||
    (selectedListings.length
      ? selectedListings
          .map((listing) => getListingAdvisoryCopy(listing, lang).viewingReadinessLabel)
          .sort((a, b) => (readinessRank[b] ?? 0) - (readinessRank[a] ?? 0))[0]
      : undefined);
  const districtLabel =
    context.districtLabel ||
    (contextProperty ? districtFor(contextProperty) : districtSpread);
  const nextAction = context.nextAction || L.defaultNext;
  const dossierLabel = `${selectedListings.length} ${L.selectedProperties}`;
  const isDossierSource = context.source === "dossier";
  const panelTitle = isDossierSource ? L.dossierTitle : L.title;
  const panelSubtitle = isDossierSource ? L.dossierSubtitle : L.subtitle;
  const emailTarget = hasRealEmailTarget(ADVISORY_EMAIL) ? ADVISORY_EMAIL : "";
  const whatsappTarget = hasRealWhatsAppTarget(WHATSAPP_PHONE) ? WHATSAPP_PHONE : "";
  const statusText =
    handoffStatus === "copied"
      ? L.copied
      : handoffStatus === "email"
        ? L.emailOpened
        : handoffStatus === "whatsapp"
          ? L.whatsappOpened
          : "";

  const summaryRows = [
    { label: L.source, value: L.sourceLabels[context.source] || L.sourceLabels.hero },
    { label: L.intent, value: context.intentLabel || L.notSpecified },
    { label: L.district, value: districtLabel || L.notSpecified },
    { label: L.property, value: propertyTitle || L.notSelected },
    { label: L.dossier, value: dossierLabel },
    ...(isDossierSource
      ? [
          { label: L.districtSpread, value: districtSpread || L.notSpecified },
          { label: L.topPriority, value: topPriorityTitle || L.notSelected },
          { label: L.highestReadiness, value: highestReadiness || L.notSpecified },
        ]
      : []),
    { label: L.next, value: nextAction },
    { label: L.timingLabel, value: timing || L.notSpecified },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTiming(ui(lang).timings[2]);
  }, [lang]);

  useEffect(() => {
    const openPanel = (detail: Partial<AdvisoryInquiryContext>) => {
      lastFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setContext({
        source: normalizeSource(detail.source),
        intentLabel: detail.intentLabel,
        districtLabel: detail.districtLabel,
        propertyTitle: detail.propertyTitle,
        propertyId: detail.propertyId,
        nextAction: detail.nextAction,
        selectedListings: detail.selectedListings,
        advisorNote: detail.advisorNote,
        dossierMeta: detail.dossierMeta,
      });
      setHandoffStatus(null);
      setOpen(true);
    };

    const onInquiry = (event: Event) => {
      openPanel((event as InquiryEvent).detail || { source: "hero" });
    };

    const onClick = (event: MouseEvent) => {
      const inquiryEvent = event as InquiryClickEvent;
      if (inquiryEvent.__bcnInquiryHandled) return;

      const target =
        event.target instanceof Element ? event.target.closest<HTMLElement>("[data-open-inquiry]") : null;

      if (!target) return;
      event.preventDefault();
      inquiryEvent.__bcnInquiryHandled = true;
      openPanel(contextFromDataset(target));
    };

    const w = window as WindowWithInquiry;
    w.__bcnOpenInquiry = openPanel;

    if (w.__bcnPendingInquiry) {
      openPanel(w.__bcnPendingInquiry);
      w.__bcnPendingInquiry = null;
    }

    window.addEventListener("bcn:inquiry_open", onInquiry);
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("bcn:inquiry_open", onInquiry);
      document.removeEventListener("click", onClick, true);

      const current = window as WindowWithInquiry;
      if (current.__bcnOpenInquiry === openPanel) {
        delete current.__bcnOpenInquiry;
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      window.requestAnimationFrame(() => lastFocused.current?.focus());
    };
  }, [open]);

  const buildBrief = () => {
    if (isDossierSource) {
      const lines = [
        L.heading,
        "",
        `${L.source}: ${L.sourceLabels.dossier}`,
        `${L.dossier}: ${dossierLabel}`,
        `${L.districtSpread}: ${districtSpread || L.notSpecified}`,
        `${L.topPriority}: ${topPriorityTitle || L.notSelected}`,
        `${L.highestReadiness}: ${highestReadiness || L.notSpecified}`,
        `${L.next}: ${nextAction}`,
        "",
      ];

      if (selectedListings.length) {
        lines.push(`${L.selectedList}:`);
        selectedListings.forEach((listing, index) => {
          const copy = getListingAdvisoryCopy(listing, lang);
          lines.push(`${index + 1}. ${titleFor(listing, lang)}`);
          lines.push(`${L.district}: ${districtFor(listing)}`);
          lines.push(`${L.bestFor}: ${copy.bestFor || "-"}`);
          lines.push(`${L.signal}: ${copy.signal || "-"}`);
          lines.push(`${L.tradeOff}: ${copy.tradeOff || "-"}`);
          lines.push(`${L.readiness}: ${copy.viewingReadinessLabel || "-"}`);
          lines.push("");
        });
      }

      lines.push(
        `${L.notes}:`,
        notes.trim() || "-",
        "",
        `${L.timingLabel}:`,
        timing,
        "",
        `${L.contactLabel}:`,
        name.trim() || "-",
        email.trim() || "-",
        phone.trim() || "-",
      );

      return lines.join("\n").trim();
    }

    const lines = [
      L.heading,
      "",
      `${L.intent}: ${context.intentLabel || L.notSpecified}`,
      `${L.source}: ${L.sourceLabels[context.source] || L.sourceLabels.hero}`,
      `${L.district}: ${districtLabel || L.notSpecified}`,
      `${L.property}: ${propertyTitle || L.notSelected}`,
      `${L.dossier}: ${dossierLabel}`,
      `${L.next}: ${nextAction}`,
      "",
    ];

    if (context.advisorNote) {
      lines.push(`${L.advisorNote}:`, context.advisorNote, "");
    }

    if (selectedListings.length) {
      lines.push(L.dossier + ":");
      selectedListings.forEach((listing, index) => {
        lines.push(`${index + 1}. ${titleFor(listing, lang)} - ${districtFor(listing)}`);
      });
      lines.push("");
    }

    lines.push(
      `${L.notes}:`,
      notes.trim() || "-",
      "",
      `${L.timingLabel}:`,
      timing,
      "",
      `${L.contactLabel}:`,
      name.trim() || "-",
      email.trim() || "-",
      phone.trim() || "-",
    );

    return lines.join("\n").trim();
  };

  const copyBrief = async () => {
    const text = buildBrief();
    try {
      await navigator.clipboard.writeText(text);
      setHandoffStatus("copied");
      window.setTimeout(() => setHandoffStatus(null), 1800);
    } catch {
      window.prompt(L.fallbackPrompt, text);
    }
  };

  const openEmailDraft = () => {
    if (!emailTarget) return;

    const subject = encodeURIComponent(L.heading);
    const body = encodeURIComponent(buildBrief());
    window.location.href = `mailto:${emailTarget}?subject=${subject}&body=${body}`;
    setHandoffStatus("email");
    window.setTimeout(() => setHandoffStatus(null), 2200);
  };

  const openWhatsAppDraft = () => {
    if (!whatsappTarget) return;

    const text = encodeURIComponent(buildBrief());
    window.open(`https://wa.me/${whatsappTarget}?text=${text}`, "_blank", "noopener,noreferrer");
    setHandoffStatus("whatsapp");
    window.setTimeout(() => setHandoffStatus(null), 2200);
  };

  const returnToDossier = () => {
    window.dispatchEvent(new CustomEvent("sc:shortlist_ui_open"));
    setOpen(false);
  };

  const panel = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[160] bg-[rgba(23,23,22,0.28)] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="advisory-inquiry-title"
            ref={panelRef}
            tabIndex={-1}
            className="fixed bottom-0 right-0 top-14 z-[170] flex w-full max-w-[680px] flex-col overflow-hidden border-l border-[var(--bcn-line-strong)] bg-[var(--bcn-surface)] shadow-[0_34px_130px_rgba(23,23,22,0.2)] outline-none sm:right-4 sm:top-20 sm:bottom-4 sm:w-[min(94vw,680px)] sm:border"
            initial={shouldReduceMotion ? { opacity: 0 } : { x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: 24, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.12 : 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="border-b border-[var(--bcn-line)] bg-[var(--bcn-graphite)] p-5 text-[var(--bcn-porcelain)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/52">Barcelona Private Advisory</div>
                  <h2 id="advisory-inquiry-title" className="mt-3 text-[30px] leading-[1.02] tracking-tight">
                    {panelTitle}
                  </h2>
                  <p className="mt-3 max-w-[520px] text-[13px] leading-[1.65] text-white/64">{panelSubtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/18 px-3 py-1.5 text-[12px] text-white/72 hover:border-white/38 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/70"
                  aria-label={L.close}
                >
                  {L.close}
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <section
                className={[
                  "border border-[var(--bcn-line)] bg-[var(--bcn-porcelain)] p-4",
                  isDossierSource ? "bcn-inquiry-dossier-summary" : "",
                ].join(" ")}
              >
                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--bcn-muted)]">{L.context}</div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {summaryRows.map((row) => (
                    <div key={row.label} className="border border-[var(--bcn-line)] bg-white/70 p-3">
                      <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--bcn-muted)]">{row.label}</div>
                      <div className="mt-2 text-[13px] leading-[1.35] text-[var(--bcn-graphite)]">{row.value}</div>
                    </div>
                  ))}
                </div>
                {context.advisorNote && (
                  <p className="mt-4 border-t border-[var(--bcn-line)] pt-4 text-[13px] leading-[1.65] text-[var(--bcn-graphite-soft)]">
                    {context.advisorNote}
                  </p>
                )}
                <p className="mt-4 border-t border-[var(--bcn-line)] pt-4 text-[12px] leading-[1.55] text-[var(--bcn-muted)]">
                  {L.privacyNote}
                </p>
              </section>

              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-[12px] text-[var(--bcn-muted)]">
                  <span>{L.buyerNotes}</span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder={L.notesPlaceholder}
                    rows={4}
                    className="min-h-[116px] resize-y border border-[var(--bcn-line)] bg-white p-3 text-[13px] leading-[1.6] text-[var(--bcn-graphite)] outline-none focus:border-[var(--bcn-line-strong)] focus:ring-2 focus:ring-black/10"
                  />
                </label>

                <label className="grid gap-2 text-[12px] text-[var(--bcn-muted)]">
                  <span>{L.timing}</span>
                  <select
                    value={timing}
                    onChange={(event) => setTiming(event.target.value)}
                    className="border border-[var(--bcn-line)] bg-white px-3 py-2.5 text-[13px] text-[var(--bcn-graphite)] outline-none focus:border-[var(--bcn-line-strong)] focus:ring-2 focus:ring-black/10"
                  >
                    {L.timings.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="grid gap-2 text-[12px] text-[var(--bcn-muted)]">
                    <span>{L.name}</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="border border-[var(--bcn-line)] bg-white px-3 py-2.5 text-[13px] text-[var(--bcn-graphite)] outline-none focus:border-[var(--bcn-line-strong)] focus:ring-2 focus:ring-black/10"
                    />
                  </label>
                  <label className="grid gap-2 text-[12px] text-[var(--bcn-muted)]">
                    <span>{L.email}</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="border border-[var(--bcn-line)] bg-white px-3 py-2.5 text-[13px] text-[var(--bcn-graphite)] outline-none focus:border-[var(--bcn-line-strong)] focus:ring-2 focus:ring-black/10"
                    />
                  </label>
                  <label className="grid gap-2 text-[12px] text-[var(--bcn-muted)]">
                    <span>{L.phone}</span>
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="border border-[var(--bcn-line)] bg-white px-3 py-2.5 text-[13px] text-[var(--bcn-graphite)] outline-none focus:border-[var(--bcn-line-strong)] focus:ring-2 focus:ring-black/10"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--bcn-line)] bg-[rgba(255,255,252,0.86)] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-h-5 text-[12px] text-[var(--bcn-sea-deep)]" aria-live="polite">
                  {statusText}
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {(selectedListings.length > 0 || context.source === "dossier") && (
                    <button
                      type="button"
                      onClick={returnToDossier}
                      className="rounded-full border border-[var(--bcn-line)] px-4 py-2 text-[12px] text-[var(--bcn-muted)] hover:border-[var(--bcn-line-strong)] hover:text-[var(--bcn-graphite)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)]"
                    >
                      {L.returnDossier}
                    </button>
                  )}
                  {emailTarget && (
                    <button
                      type="button"
                      onClick={openEmailDraft}
                      className="rounded-full border border-[var(--bcn-line)] px-4 py-2 text-[12px] text-[var(--bcn-muted)] hover:border-[var(--bcn-line-strong)] hover:text-[var(--bcn-graphite)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)]"
                    >
                      {L.emailDraft}
                    </button>
                  )}
                  {whatsappTarget && (
                    <button
                      type="button"
                      onClick={openWhatsAppDraft}
                      className="rounded-full border border-[var(--bcn-line)] px-4 py-2 text-[12px] text-[var(--bcn-muted)] hover:border-[var(--bcn-line-strong)] hover:text-[var(--bcn-graphite)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)]"
                    >
                      {L.whatsappDraft}
                    </button>
                  )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-[var(--bcn-line)] px-4 py-2 text-[12px] text-[var(--bcn-muted)] hover:border-[var(--bcn-line-strong)] hover:text-[var(--bcn-graphite)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)]"
                >
                  {L.continue}
                </button>
                <button
                  type="button"
                  onClick={copyBrief}
                  className="rounded-full border border-[var(--bcn-line-strong)] bg-white px-4 py-2 text-[12px] text-[var(--bcn-graphite)] shadow-[var(--bcn-shadow-soft)] hover:border-[var(--bcn-graphite)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--bcn-sea-deep)]"
                >
                  {handoffStatus === "copied" ? L.copied : L.copy}
                </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return mounted ? createPortal(panel, document.body) : null;
}
