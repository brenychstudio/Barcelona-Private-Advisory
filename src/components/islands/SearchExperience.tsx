import { useEffect, useMemo, useState } from "react";
import type { Listing } from "../../data/listings";
import ShortlistToggle from "./ShortlistToggle";

type Mode = "best" | "investment" | "sea" | "family";
type Lang = "en" | "es";

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
    search: "SEARCH",
    h: "Best fit over bulk.",
    sub: "Advisory filters (demo): lifestyle tags + lens ranking.",
    reset: "Reset",
    matches: "matches",
    allDistricts: "All districts",
    anyBeds: "Any beds",
    anyPrice: "Any price",
    best: "Best fit",
    investment: "Investment",
    sea: "Sea",
    family: "Family",
    briefLens: "Lens",
    briefLifestyle: "Lifestyle",
    briefDistrict: "District",
    briefBeds: "Beds",
    briefMax: "Max",
    briefNote: "Note",
    bd: "bd",
    ba: "ba",
  };
  const es = {
    search: "BUSCAR",
    h: "Mejor encaje antes que volumen.",
    sub: "Filtros advisory (demo): estilo de vida + ranking por enfoque.",
    reset: "Reiniciar",
    matches: "coincidencias",
    allDistricts: "Todos los distritos",
    anyBeds: "Cualquier",
    anyPrice: "Cualquier",
    best: "Mejor encaje",
    investment: "Inversión",
    sea: "Mar",
    family: "Familia",
    briefLens: "Enfoque",
    briefLifestyle: "Estilo de vida",
    briefDistrict: "Distrito",
    briefBeds: "Hab",
    briefMax: "Máx.",
    briefNote: "Nota",
    bd: "hab",
    ba: "baños",
  };
  return lang === "es" ? es : en;
};

function scoreListing(
  x: Listing,
  mode: Mode,
  selectedTags: string[],
  district: string,
  minBeds: number,
  maxPrice: number
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

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);

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
    if (d) setDistrict(d);

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
    const parts: string[] = [`${L.briefLens}: ${modeLabel}`];
    if (effectiveTags.length) parts.push(`${L.briefLifestyle}: ${effectiveTags.map(tagLabel).join(" · ")}`);
    if (district) parts.push(`${L.briefDistrict}: ${district}`);
    if (minBeds) parts.push(`${L.briefBeds}: ${minBeds}+`);
    if (maxPrice) parts.push(`${L.briefMax}: €${fmtEUR(maxPrice)}`);
    if (note.trim()) parts.push(`${L.briefNote}: ${note.trim()}`);
    return parts.join(" · ");
  }, [L.briefBeds, L.briefDistrict, L.briefLens, L.briefLifestyle, L.briefMax, L.briefNote, district, effectiveTags, maxPrice, minBeds, modeLabel, note, lang]);

  const results = useMemo(() => {
    const scored = listings.map((x) => ({
      x,
      s: scoreListing(x, mode, effectiveTags, district, minBeds, maxPrice),
    }));

    scored.sort((a, b) => b.s - a.s);

    return scored
      .filter(({ x }) => {
        if (district && x.district.toLowerCase() !== district.toLowerCase()) return false;
        if (minBeds && x.beds < minBeds) return false;
        if (maxPrice && x.price > maxPrice) return false;
        return true;
      })
      .map((r) => r.x);
  }, [listings, mode, effectiveTags, district, minBeds, maxPrice]);

  const toggleTag = (key: string) => {
    setSelectedTags((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-[12px] tracking-[0.18em] text-black/50">{L.search}</div>
        <h2 className="text-[22px] tracking-tight">{L.h}</h2>
        <p className="max-w-[760px] text-[12px] text-black/60">{L.sub}</p>
        <div className="max-w-[980px] text-[12px] text-black/50">{brief}</div>
      </div>

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

      <div className="grid gap-3 rounded-2xl border border-black/10 bg-white p-4 md:grid-cols-[1fr_auto_auto_auto]">
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
                  "rounded-full border px-3 py-1.5 text-[12px]",
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

        <select
          className="h-9 rounded-full border border-black/10 bg-white px-3 text-[12px] text-black/70"
          value={minBeds}
          onChange={(e) => setMinBeds(Number(e.target.value))}
        >
          <option value={0}>{L.anyBeds}</option>
          <option value={1}>1+</option>
          <option value={2}>2+</option>
          <option value={3}>3+</option>
          <option value={4}>4+</option>
        </select>

        <select
          className="h-9 rounded-full border border-black/10 bg-white px-3 text-[12px] text-black/70"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        >
          <option value={0}>{L.anyPrice}</option>
          <option value={450000}>≤ €450k</option>
          <option value={650000}>≤ €650k</option>
          <option value={900000}>≤ €900k</option>
          <option value={1300000}>≤ €1.3M</option>
          <option value={2500000}>≤ €2.5M</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[12px] text-black/60">
          {results.length} {L.matches}
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
          }}
          className="rounded-full border border-black/10 px-3 py-1.5 text-[12px] text-black/70 hover:border-black/20 hover:text-black"
        >
          {L.reset}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {results.map((x) => (
          <a
            key={x.id}
            href={`${prefix}/p/${x.id}`}
            className="overflow-hidden rounded-2xl border border-black/10 bg-white hover:border-black/20"
          >
            <div className="relative aspect-[4/5] bg-black/5">
              <ShortlistToggle id={x.id} className="absolute right-3 top-3" lang={lang} />
              <img src={x.images.hero} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="p-4">
              <div className="text-[13px] font-medium">{lang === "es" ? (x.title_es ?? x.title) : x.title}</div>
              <div className="mt-1 text-[12px] text-black/60">
                {x.district} · {x.beds} {L.bd} · {x.baths} {L.ba} · {x.sqm} m²
              </div>
              <div className="mt-1 text-[12px] text-black/60">€{fmtEUR(x.price)}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
