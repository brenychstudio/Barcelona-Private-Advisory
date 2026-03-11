import { useMemo } from "react";
import { useShortlist } from "../../hooks/useShortlist";

type Lang = "en" | "es";

const ui = (lang: Lang) => {
  const en = { save: "Save", saved: "Saved" };
  const es = { save: "Guardar", saved: "Guardado" };
  return lang === "es" ? es : en;
};

function detectLang(): Lang {
  if (typeof document !== "undefined") {
    const h = document.documentElement.getAttribute("lang");
    if (h === "es") return "es";
  }
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/es")) return "es";
  return "en";
}

export default function ShortlistToggle({
  id,
  className = "",
  lang,
}: {
  id: string;
  className?: string;
  lang?: Lang;
}) {
  const resolved = useMemo(() => lang ?? detectLang(), [lang]);
  const L = ui(resolved);

  const { has, toggle } = useShortlist();
  const saved = has(id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      className={[
        "rounded-full border px-3 py-1.5 text-[12px] shadow-sm",
        saved ? "border-black/25 bg-white text-black" : "border-black/10 bg-white/90 text-black/70 hover:border-black/20 hover:text-black",
        className,
      ].join(" ")}
      aria-label={saved ? L.saved : L.save}
    >
      {saved ? L.saved : L.save}
    </button>
  );
}
