import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
import type { Listing } from "../../data/listings";
import { getListingAdvisoryCopy } from "../../lib/getListingAdvisoryCopy";
import { useSectionProgress } from "../../hooks/useSectionProgress";
import { useShortlist } from "../../hooks/useShortlist";
import Lightbox from "./Lightbox";
import { openAdvisoryInquiry, type AdvisoryInquirySource } from "./AdvisoryInquiryPanel";

type Lang = "en" | "es";

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

function StickyStage({ src, alt }: { src: string; alt?: string }) {
  return (
    <div className="bcn-property-stage sticky top-[84px]">
      <div className="bcn-property-stage__surface overflow-hidden bg-[rgb(var(--paper))] shadow-[0_34px_120px_rgba(46,43,35,0.12)] ring-1 ring-black/10">
        <div className="relative aspect-[4/5] w-full">
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
    request: "Request private viewing",
    save: "Save to shortlist",
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
    ctaSaved: "Saved to shortlist.",
    ctaRemoved: "Removed from shortlist.",
    bd: "bd",
    ba: "ba",
  };

  const es = {
    request: "Solicitar visita",
    save: "Guardar en selección",
    saved: "Guardado",
    lens: "Barcelona Lens",
    privateRecommendation: "Recomendacion privada",
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
    acquisitionNote: "Nota de adquisición",
    advisoryPath: "Ruta advisory",
    privateBrief: "Brief privado",
    districtFit: "encaje de distrito",
    viewingPath: "ruta de visita",
    numbers: "NÚMEROS",
    ppsm: "Precio / m²",
    est: "Costes de compra*",
    liquidity: "Liquidez",
    roi: "Potencial ROI",
    ref: "Métrica de referencia.",
    estNote: "*Rango indicativo. Varia por impuestos, gastos y escenario.",
    lensNote: "Enfoque advisory.",
    roiNote: "Estimacion advisory de alto nivel.",
    risk: "SEÑALES DE RIESGO",
    ctaReq: "Solicitud preparada. Copia el brief o continua con una ruta de visita privada.",
    ctaSaved: "Guardado en selección.",
    ctaRemoved: "Quitado de la selección.",
    bd: "hab",
    ba: "baños",
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

  const sections = ["overview", "gallery", "neighborhood", "numbers"] as const;
  const progress = useSectionProgress([...sections]);

  const active = sections.reduce(
    (best, id) => ((progress[id] ?? 0) > (progress[best] ?? 0) ? id : best),
    "overview" as (typeof sections)[number]
  );

  const stageSrc =
    active === "overview"
      ? listing.images.hero
      : active === "gallery"
      ? listing.images.gallery[0] ?? listing.images.hero
      : active === "neighborhood"
      ? listing.images.gallery[1] ?? listing.images.hero
      : listing.images.gallery[2] ?? listing.images.hero;

  const activeP = Math.max(...sections.map((s) => progress[s] ?? 0));

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
  const pathIntent = advisoryCopy.bestFor || L.privateBrief;
  const advisoryPath = `${pathIntent} -> ${districtLabel || L.districtFit} -> ${titleText} -> ${requestLabel || L.viewingPath}`;
  const signalRows = [
    { label: L.bestFor, value: advisoryCopy.bestFor },
    { label: L.signal, value: advisoryCopy.signal },
    { label: L.tradeOff, value: advisoryCopy.tradeOff },
    { label: L.riskNote, value: advisoryCopy.riskNote },
    { label: L.readiness, value: advisoryCopy.viewingReadinessLabel },
  ].filter((row) => row.value);
  const riskFlags = [advisoryCopy.riskNote, ...adv.riskFlags.filter((r) => r !== advisoryCopy.riskNote)].filter(Boolean);

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
      ...listing.images.gallery.map((src, i) => ({
        src,
        alt: `${titleText} gallery image ${i + 1}`,
      })),
    ],
    [listing.images.hero, listing.images.gallery, titleText]
  );

  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  const openLightboxBySrc = (src: string) => {
    const i = allImages.findIndex((x) => x.src === src);
    setLbIndex(i >= 0 ? i : 0);
    setLbOpen(true);
  };

  return (
    <div className="bcn-property-shell bcn-section grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">
      <div className="space-y-16">
        <section data-section="overview" className="bcn-property-file bcn-section--threshold space-y-8 border-b border-black/10 pb-10">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-black/42">
              <span>{L.privateRecommendation}</span>
              <span className="h-px w-10 bg-black/14" />
              <span>{L.selectedObject} {listing.code}</span>
            </div>

            <h1 className="bcn-advisory-line max-w-[820px] text-[42px] leading-[0.98] tracking-tight text-black/90 sm:text-[64px]">
              {titleText}
            </h1>

            <div className="max-w-[760px] text-[13px] leading-[1.7] text-black/58">
              {districtLabel} / {listing.sqm} m2 / {listing.beds} {L.bd} / {listing.baths} {L.ba} / EUR{" "}
              {fmtEUR(listing.price)}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-[12px] text-black/62">
            <span className="border border-black/10 bg-white/70 px-3 py-1.5">{L.readiness}: {advisoryCopy.viewingReadinessLabel}</span>
            <span className="border border-black/10 bg-white/70 px-3 py-1.5">{L.priority}: #{listing.shortlistPriority}</span>
            <span className="border border-black/10 bg-white/70 px-3 py-1.5">{L.lens}: {listing.district}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
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
              onClick={() => openLightboxBySrc(listing.images.hero)}
              className="rounded-full border border-black/10 px-4 py-2 text-[12px] text-black/70 hover:border-black/20 hover:text-black"
            >
              {L.inspectGallery}
            </button>

            <a
              href={`${prefix}/district/${adv.districtSlug}`}
              className="rounded-full border border-black/10 px-4 py-2 text-[12px] text-black/70 hover:border-black/20 hover:text-black"
            >
              {L.lens}: {listing.district}
            </a>
          </div>

          {ctaMsg && (
            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-[12px] text-black/60">
              {ctaMsg}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {highlights.map((h) => (
              <span key={h} className="rounded-full border border-black/10 bg-[rgb(var(--paper))] px-3 py-1.5 text-[12px] text-black/64">
                {h}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.16fr_0.84fr]">
            <div className="bcn-property-memo bcn-memo-surface bg-[var(--bcn-graphite)] p-6 pl-7 text-[var(--bcn-porcelain)] shadow-[0_30px_110px_rgba(28,28,24,0.16)]">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/48">{L.advisorMemo}</div>
              <p className="mt-5 text-[24px] leading-[1.3] tracking-tight text-white/86">{advisorMemo}</p>
              {advisoryCopy.acquisitionNote && (
                <p className="mt-6 border-t border-white/12 pt-5 text-[13px] leading-[1.75] text-white/62">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-white/38">{L.acquisitionNote}</span>
                  {advisoryCopy.acquisitionNote}
                </p>
              )}
            </div>

            <div className="bcn-property-path bcn-editorial-surface border-l border-black/10 bg-[rgb(var(--paper))] p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-black/42">{L.advisoryPath}</div>
              <p className="mt-4 text-[14px] leading-[1.65] text-black/66">{advisoryPath}</p>
            </div>
          </div>

          <div className="bcn-property-signals bcn-section--threshold border-y border-black/10 py-2">
            <div className="px-1 py-4 text-[11px] uppercase tracking-[0.18em] text-black/42">{L.signals}</div>
            {signalRows.map((row) => (
              <div key={row.label} className="grid gap-3 border-t border-black/10 px-1 py-4 sm:grid-cols-[170px_1fr]">
                <div className="text-[11px] text-black/42">{row.label}</div>
                <div className="text-[13px] leading-[1.65] text-black/66">{row.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <div className="text-[12px] tracking-[0.18em] text-black/50">{L.desc}</div>
            <div className="border-l border-black/10 bg-[rgb(var(--paper))] p-5">
              {descText
                .split("\n\n")
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i} className={["text-[13px] leading-[1.85] text-black/60", i ? "mt-4" : ""].join(" ")}>
                    {p}
                  </p>
                ))}
            </div>
          </div>
        </section>

        <section data-section="gallery" className="bcn-section space-y-3">
          <div className="text-[12px] tracking-[0.18em] text-black/50">{L.gallery}</div>
          <div className="grid gap-3 md:grid-cols-2">
            {listing.images.gallery.map((src) => (
              <div key={src} className="overflow-hidden border border-black/10 bg-[rgb(var(--paper))]">
                <div className="aspect-[4/5] bg-black/5">
                  <button
                    type="button"
                    onClick={() => openLightboxBySrc(src)}
                    className="h-full w-full"
                    aria-label="Open image"
                  >
                    <img
                      className="h-full w-full object-cover"
                      src={src}
                      alt={`${titleText} gallery view`}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section data-section="neighborhood" className="bcn-section space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[12px] tracking-[0.18em] text-black/50">{L.neighborhood}</div>
            <a href={`${prefix}/district/${adv.districtSlug}`} className="text-[12px] text-black/50 hover:text-black">
              {L.openDistrict}
            </a>
          </div>

          <div className="border border-black/10 bg-[rgb(var(--paper))] p-5">
            <div className="text-[12px] text-black/60">{L.recommended}</div>

            <div className="mt-3 flex flex-wrap gap-2">
              {fitTags.length ? fitTags.map((t0) => <Chip key={t0}>{labels[t0] ?? t0}</Chip>) : <Chip>Barcelona-first</Chip>}
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {adv.facts.slice(0, 4).map((f) => (
                <div
                  key={f}
                  className="border border-black/10 bg-white px-3 py-2 text-[12px] text-black/70"
                >
                  {f}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section data-section="numbers" className="space-y-3">
          <div className="text-[12px] tracking-[0.18em] text-black/50">{L.numbers}</div>

          <div className="border-y border-black/10 bg-[rgb(var(--paper))]">
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

          <div className="border-l border-black/10 bg-[rgb(var(--paper))] p-5">
            <div className="text-[12px] tracking-[0.18em] text-black/50">{L.risk}</div>
            <div className="mt-3 grid gap-2">
              {riskFlags.map((r) => (
                <div
                  key={r}
                  className="border-t border-black/10 py-2 text-[12px] text-black/66 first:border-t-0"
                >
                  {r}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-3">
        <MachineReadout code={listing.code} progress={activeP} />
        <button
          type="button"
          onClick={() => openLightboxBySrc(stageSrc)}
          className="w-full text-left"
          aria-label="Open gallery"
        >
          <StickyStage src={stageSrc} alt={titleText} />
        </button>
      </div>

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
        onRequestAction={() => requestViewing("gallery")}
        onSaveAction={saveToShortlist}
      />
    </div>
  );
}
