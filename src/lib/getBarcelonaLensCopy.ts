import type { BuyerIntent, DistrictLens } from "../data/barcelonaLens";

export type LensLang = "en" | "es";

export function getBuyerIntentCopy(intent: BuyerIntent, lang: LensLang = "en") {
  const es = lang === "es" ? intent.intentEs : undefined;

  return {
    label: es?.label || intent.label,
    shortLabel: es?.shortLabel || intent.shortLabel,
    advisoryLine: es?.advisoryLine || intent.advisoryLine,
    atmosphere: es?.atmosphere || intent.atmosphere,
    signal: es?.signal || intent.signal,
    risk: es?.risk || intent.risk,
    value: es?.value || intent.value,
    signalTags: es?.signalTags || intent.signalTags,
  };
}

export function getDistrictLensCopy(district: DistrictLens, lang: LensLang = "en") {
  const es = lang === "es" ? district.lensEs : undefined;

  return {
    name: es?.name || district.name,
    summary: es?.summary || district.summary,
    signal: es?.signal || district.signal,
    bestFor: es?.bestFor || district.bestFor,
    risk: es?.risk || district.risk,
    valueShort: es?.valueShort || district.valueShort,
    buyerFit: es?.buyerFit || district.buyerFit,
    rhythm: es?.rhythm || district.rhythm,
    valueLogic: es?.valueLogic || district.valueLogic,
    tradeOff: es?.tradeOff || district.tradeOff,
    reportSignals: es?.reportSignals || district.reportSignals,
  };
}
