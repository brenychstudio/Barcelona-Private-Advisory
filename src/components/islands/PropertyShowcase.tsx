import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
import type { Listing } from "../../data/listings";
import { useSectionProgress } from "../../hooks/useSectionProgress";
import { useShortlist } from "../../hooks/useShortlist";
import Lightbox from "./Lightbox";

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
    <div className="sticky top-[84px]">
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
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
      ? (lang === "es" ? "Fuerte (demo)" : "Strong (demo)")
      : tags.has("sea")
      ? (lang === "es" ? "Selectivo (demo)" : "Selective (demo)")
      : (lang === "es" ? "Equilibrado (demo)" : "Balanced (demo)");

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
        ? "Diligencia estándar recomendada (demo)"
        : "Standard due diligence recommended (demo)"
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
    request: "Request viewing",
    save: "Save to shortlist",
    saved: "Saved",
    lens: "Barcelona Lens",
    desc: "DESCRIPTION",
    gallery: "GALLERY",
    neighborhood: "NEIGHBORHOOD FIT",
    openDistrict: "Open district →",
    recommended: "Recommended for:",
    numbers: "NUMBERS",
    ppsm: "Price / m²",
    est: "Est. acquisition costs*",
    liquidity: "Liquidity",
    roi: "ROI potential",
    ref: "Reference metric (demo).",
    estNote: "*Demo range. Varies by taxes/fees and scenario.",
    lensNote: "Advisory lens (demo).",
    roiNote: "High-level demo estimate.",
    risk: "RISK FLAGS",
    ctaReq: "Request received (demo). We’ll confirm availability and propose slots.",
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
    desc: "DESCRIPCIÓN",
    gallery: "GALERÍA",
    neighborhood: "ENCAJE DE BARRIO",
    openDistrict: "Abrir distrito →",
    recommended: "Recomendado para:",
    numbers: "NÚMEROS",
    ppsm: "Precio / m²",
    est: "Costes de compra*",
    liquidity: "Liquidez",
    roi: "Potencial ROI",
    ref: "Métrica de referencia (demo).",
    estNote: "*Rango demo. Varía por impuestos/fees y escenario.",
    lensNote: "Enfoque advisory (demo).",
    roiNote: "Estimación demo de alto nivel.",
    risk: "SEÑALES DE RIESGO",
    ctaReq: "Solicitud recibida (demo). Confirmaremos disponibilidad y propondremos horarios.",
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

  const requestViewing = () => {
    setCtaMsg(L.ctaReq);
    window.setTimeout(() => setCtaMsg(""), 2200);
  };

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

  const allImages = useMemo(
    () => [{ src: listing.images.hero }, ...listing.images.gallery.map((src) => ({ src }))],
    [listing.images.hero, listing.images.gallery]
  );

  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  const openLightboxBySrc = (src: string) => {
    const i = allImages.findIndex((x) => x.src === src);
    setLbIndex(i >= 0 ? i : 0);
    setLbOpen(true);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
      <div className="space-y-14">
        <section data-section="overview" className="space-y-4">
          <MachineReadout code={listing.code} progress={activeP} />

          <h1 className="text-[26px] leading-[1.1] tracking-tight">{titleText}</h1>

          <div className="text-[12px] text-black/60">
            {listing.district} · {listing.sqm} m² · {listing.beds} {L.bd} · {listing.baths} {L.ba} · €
            {fmtEUR(listing.price)}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={requestViewing}
              className="rounded-full border border-black/25 bg-white px-4 py-2 text-[12px] hover:border-black/35"
            >
              {L.request}
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

          <div className="grid gap-2 pt-4">
            {highlights.map((h) => (
              <div key={h} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-[12px]">
                {h}
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <div className="text-[12px] tracking-[0.18em] text-black/50">{L.desc}</div>
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              {descText
                .split("\n\n")
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i} className={["text-[12px] text-black/60", i ? "mt-3" : ""].join(" ")}>
                    {p}
                  </p>
                ))}
            </div>
          </div>
        </section>

        <section data-section="gallery" className="space-y-3">
          <div className="text-[12px] tracking-[0.18em] text-black/50">{L.gallery}</div>
          <div className="grid gap-3 md:grid-cols-2">
            {listing.images.gallery.map((src) => (
              <div key={src} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                <div className="aspect-[4/5] bg-black/5">
                  <button
                    type="button"
                    onClick={() => openLightboxBySrc(src)}
                    className="h-full w-full"
                    aria-label="Open image"
                  >
                    <img className="h-full w-full object-cover" src={src} alt="" loading="lazy" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section data-section="neighborhood" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[12px] tracking-[0.18em] text-black/50">{L.neighborhood}</div>
            <a href={`${prefix}/district/${adv.districtSlug}`} className="text-[12px] text-black/50 hover:text-black">
              {L.openDistrict}
            </a>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="text-[12px] text-black/60">{L.recommended}</div>

            <div className="mt-3 flex flex-wrap gap-2">
              {fitTags.length ? fitTags.map((t0) => <Chip key={t0}>{labels[t0] ?? t0}</Chip>) : <Chip>Barcelona-first</Chip>}
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {adv.facts.slice(0, 4).map((f) => (
                <div
                  key={f}
                  className="rounded-xl border border-black/10 bg-white px-3 py-2 text-[12px] text-black/70"
                >
                  {f}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section data-section="numbers" className="space-y-3">
          <div className="text-[12px] tracking-[0.18em] text-black/50">{L.numbers}</div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-[12px] text-black/50">{L.ppsm}</div>
              <div className="mt-1 text-[18px] tracking-tight">€{fmtEUR(adv.ppsm)}</div>
              <div className="mt-1 text-[12px] text-black/60">{L.ref}</div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-[12px] text-black/50">{L.est}</div>
              <div className="mt-1 text-[18px] tracking-tight">{adv.estCosts}</div>
              <div className="mt-1 text-[12px] text-black/60">{L.estNote}</div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-[12px] text-black/50">{L.liquidity}</div>
              <div className="mt-1 text-[18px] tracking-tight">{adv.liquidity}</div>
              <div className="mt-1 text-[12px] text-black/60">{L.lensNote}</div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-[12px] text-black/50">{L.roi}</div>
              <div className="mt-1 text-[18px] tracking-tight">{adv.roi}</div>
              <div className="mt-1 text-[12px] text-black/60">{L.roiNote}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="text-[12px] tracking-[0.18em] text-black/50">{L.risk}</div>
            <div className="mt-3 grid gap-2">
              {adv.riskFlags.map((r) => (
                <div
                  key={r}
                  className="rounded-xl border border-black/10 bg-white px-3 py-2 text-[12px] text-black/70"
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
      />
    </div>
  );
}
