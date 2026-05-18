import type { Listing } from "../data/listings";

export type AdvisoryLang = "en" | "es";

const readinessLabels: Record<AdvisoryLang, Record<string, string>> = {
  en: {
    High: "High",
    Medium: "Medium",
    Selective: "Selective",
    Low: "Low",
  },
  es: {
    High: "Alta",
    Medium: "Media",
    Selective: "Selectiva",
    Low: "Baja",
  },
};

export function getListingAdvisoryCopy(listing: Listing, lang: AdvisoryLang = "en") {
  const es = lang === "es" ? listing.advisoryEs : undefined;

  return {
    bestFor: es?.bestFor || listing.bestFor,
    signal: es?.signal || listing.signal,
    tradeOff: es?.tradeOff || listing.tradeOff,
    advisorReason: es?.advisorReason || listing.advisorReason,
    acquisitionNote: es?.acquisitionNote || listing.acquisitionNote,
    riskNote: es?.riskNote || listing.riskNote,
    nextAction: es?.nextAction || listing.nextAction,
    viewingReadinessLabel: readinessLabels[lang][listing.viewingReadiness] || listing.viewingReadiness,
  };
}
