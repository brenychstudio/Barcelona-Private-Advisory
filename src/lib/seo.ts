import { OG_IMAGE } from "../config/site";
import type { Listing } from "../data/listings";

export type SeoLang = "en" | "es";

export type SeoMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
  lang: SeoLang;
  alternatePath: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: "website" | "article";
  robots: string;
};

type SeoRoute = "home" | "search" | "about" | "contact";

const ROBOTS_INDEX = "index,follow";

const routeSeo: Record<SeoRoute, Record<SeoLang, Omit<SeoMetadata, "lang" | "alternatePath" | "ogType" | "robots">>> = {
  home: {
    en: {
      title: "Barcelona Private Advisory — Private Property Intelligence System",
      description:
        "A premium private advisory interface for Barcelona property buyers, turning intent, district logic and property signals into curated shortlist and viewing-path decisions.",
      canonicalPath: "/",
      ogTitle: "Barcelona Private Advisory",
      ogDescription: "Private Property Intelligence System for Barcelona buyer decisions.",
      ogImage: OG_IMAGE,
    },
    es: {
      title: "Barcelona Private Advisory — Sistema de inteligencia inmobiliaria privada",
      description:
        "Una interfaz privada de asesoría para compradores en Barcelona que convierte intención, lógica de distrito y señales de propiedad en shortlist curada y ruta de visita.",
      canonicalPath: "/es/",
      ogTitle: "Barcelona Private Advisory",
      ogDescription: "Sistema de inteligencia inmobiliaria privada para decisiones de compra en Barcelona.",
      ogImage: OG_IMAGE,
    },
  },
  search: {
    en: {
      title: "Private Search Surface — Barcelona Private Advisory",
      description:
        "Advisory-ranked Barcelona property recommendations filtered by buyer intent, district fit, readiness and acquisition signals.",
      canonicalPath: "/search",
      ogTitle: "Private Search Surface — Barcelona Private Advisory",
      ogDescription:
        "Advisory-ranked Barcelona property recommendations filtered by buyer intent and district fit.",
      ogImage: OG_IMAGE,
    },
    es: {
      title: "Superficie de búsqueda privada — Barcelona Private Advisory",
      description:
        "Recomendaciones inmobiliarias de Barcelona ordenadas por asesoría, filtradas por intención del comprador, ajuste de distrito, preparación y señales de adquisición.",
      canonicalPath: "/es/search",
      ogTitle: "Superficie de búsqueda privada — Barcelona Private Advisory",
      ogDescription:
        "Recomendaciones inmobiliarias de Barcelona ordenadas por intención, distrito y señales de adquisición.",
      ogImage: OG_IMAGE,
    },
  },
  about: {
    en: {
      title: "Advisory Method — Barcelona Private Advisory",
      description:
        "A district-first private property advisory method for Barcelona buyers: buyer brief, district lens, property signal, shortlist dossier and viewing path.",
      canonicalPath: "/about",
      ogTitle: "Advisory Method — Barcelona Private Advisory",
      ogDescription: "A district-first advisory method for Barcelona buyer shortlist decisions.",
      ogImage: OG_IMAGE,
    },
    es: {
      title: "Método asesor — Barcelona Private Advisory",
      description:
        "Método privado de asesoría inmobiliaria en Barcelona: brief del comprador, lente de distrito, señal de propiedad, dossier y ruta de visita.",
      canonicalPath: "/es/about",
      ogTitle: "Método asesor — Barcelona Private Advisory",
      ogDescription: "Método privado de asesoría para decisiones de shortlist en Barcelona.",
      ogImage: OG_IMAGE,
    },
  },
  contact: {
    en: {
      title: "Advisory Handoff — Barcelona Private Advisory",
      description:
        "Prepare a private viewing path request from buyer intent, district fit, shortlist context and timing.",
      canonicalPath: "/contact",
      ogTitle: "Advisory Handoff — Barcelona Private Advisory",
      ogDescription: "Prepare a private viewing path request from buyer intent and shortlist context.",
      ogImage: OG_IMAGE,
    },
    es: {
      title: "Handoff asesor — Barcelona Private Advisory",
      description:
        "Prepara una solicitud privada de ruta de visita desde intención del comprador, ajuste de distrito, shortlist y timing.",
      canonicalPath: "/es/contact",
      ogTitle: "Handoff asesor — Barcelona Private Advisory",
      ogDescription: "Prepara una solicitud privada de ruta de visita desde intención y shortlist.",
      ogImage: OG_IMAGE,
    },
  },
};

const alternateForPath = (canonicalPath: string, lang: SeoLang) => {
  if (lang === "en") {
    return canonicalPath === "/" ? "/es/" : `/es${canonicalPath}`;
  }

  return canonicalPath.replace(/^\/es(?=\/|$)/, "") || "/";
};

export const getRouteSeo = (route: SeoRoute, lang: SeoLang): SeoMetadata => {
  const meta = routeSeo[route][lang];

  return {
    ...meta,
    lang,
    alternatePath: alternateForPath(meta.canonicalPath, lang),
    ogType: "website",
    robots: ROBOTS_INDEX,
  };
};

export const getPropertySeo = (listing: Listing, lang: SeoLang): SeoMetadata => {
  const propertyTitle = lang === "es" ? listing.title_es ?? listing.title : listing.title;
  const canonicalPath = lang === "es" ? `/es/p/${listing.id}` : `/p/${listing.id}`;
  const title =
    lang === "es"
      ? `${propertyTitle} — Archivo privado de adquisición`
      : `${propertyTitle} — Private Acquisition File`;
  const description =
    lang === "es"
      ? `Archivo privado de adquisición para ${propertyTitle}, con señales asesoras, ajuste de distrito, galería de inspección, notas de riesgo y acción de ruta de visita.`
      : `A private acquisition file for ${propertyTitle}, with advisory signals, district fit, inspection gallery, risk notes and viewing-path action.`;

  return {
    title,
    description,
    canonicalPath,
    lang,
    alternatePath: alternateForPath(canonicalPath, lang),
    ogTitle: title,
    ogDescription: description,
    ogImage: OG_IMAGE,
    ogType: "article",
    robots: ROBOTS_INDEX,
  };
};
