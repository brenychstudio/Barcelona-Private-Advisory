import { bcnMedia } from "./bcnMedia";

export type BuyerIntentId =
  | "family-calm"
  | "sea-light"
  | "investment-logic"
  | "design-renovation"
  | "privacy"
  | "walkable-daily-life";

export type DistrictId =
  | "eixample"
  | "gracia"
  | "sarria"
  | "poblenou"
  | "diagonal-mar"
  | "pedralbes";

export type BuyerIntent = {
  id: BuyerIntentId;
  label: string;
  shortLabel: string;
  advisoryLine: string;
  intentEs?: {
    label?: string;
    shortLabel?: string;
    advisoryLine?: string;
    atmosphere?: string;
    signal?: string;
    risk?: string;
    value?: string;
    signalTags?: string[];
  };
  visualImage: string;
  atmosphere: string;
  signal: string;
  risk: string;
  value: string;
  primaryDistrictId: DistrictId;
  secondaryDistrictIds: DistrictId[];
  signalTags: string[];
};

export type DistrictLens = {
  id: DistrictId;
  name: string;
  slug: string;
  node: { x: string; y: string };
  summary: string;
  signal: string;
  bestFor: string;
  risk: string;
  valueShort: string;
  buyerFit: string;
  rhythm: string;
  valueLogic: string;
  tradeOff: string;
  lensEs?: {
    name?: string;
    summary?: string;
    signal?: string;
    bestFor?: string;
    risk?: string;
    valueShort?: string;
    buyerFit?: string;
    rhythm?: string;
    valueLogic?: string;
    tradeOff?: string;
    reportSignals?: string[];
  };
  matchingIntentIds: BuyerIntentId[];
  reportSignals: string[];
};

export type LensPropertyMatch = {
  propertyId: string;
  districtId: DistrictId;
  intentIds: BuyerIntentId[];
  priority: number;
  advisorReason: string;
};

export const buyerIntents: BuyerIntent[] = [
  {
    id: "family-calm",
    label: "Family calm",
    shortLabel: "family calm",
    advisoryLine: "Daily rhythm before image preference.",
    intentEs: {
      label: "Calma familiar",
      shortLabel: "calma familiar",
      advisoryLine: "Ritmo diario antes que preferencia de imagen.",
      atmosphere: "residencial tranquilo / rutas verdes",
      signal: "plan familiar de bajo ruido",
      risk: "dependencia de ruta escolar",
      value: "demanda estable a largo plazo",
      signalTags: ["colegios", "proximidad verde", "almacenaje", "bajo ruido"],
    },
    visualImage: bcnMedia.thresholds.familyCalm.src,
    atmosphere: "quiet residential / green routes",
    signal: "low-noise family plan",
    risk: "school-route dependency",
    value: "stable long-hold demand",
    primaryDistrictId: "sarria",
    secondaryDistrictIds: ["pedralbes", "eixample"],
    signalTags: ["schools", "green proximity", "storage", "low noise"],
  },
  {
    id: "sea-light",
    label: "Sea light",
    shortLabel: "sea light",
    advisoryLine: "Terrace logic, exposure and daily access.",
    intentEs: {
      label: "Luz mediterránea",
      shortLabel: "luz mediterránea",
      advisoryLine: "Lógica de terraza, exposición y acceso diario.",
      atmosphere: "aire costero / luz de terraza",
      signal: "exposición al mar",
      risk: "revisión de comunidad y luz directa",
      value: "escasez de terraza",
      signalTags: ["terraza", "acceso costero", "aire diario", "revisión de exposición"],
    },
    visualImage: bcnMedia.thresholds.seaLight.src,
    atmosphere: "coastal air / terrace light",
    signal: "sea exposure",
    risk: "HOA + glare review",
    value: "terrace scarcity",
    primaryDistrictId: "diagonal-mar",
    secondaryDistrictIds: ["poblenou", "sarria"],
    signalTags: ["terrace", "coastal access", "daily air", "exposure review"],
  },
  {
    id: "investment-logic",
    label: "Investment logic",
    shortLabel: "investment",
    advisoryLine: "Liquidity, friction and resale clarity.",
    intentEs: {
      label: "Lógica de inversión",
      shortLabel: "inversión",
      advisoryLine: "Liquidez, fricción y claridad de reventa.",
      atmosphere: "stock central / demanda clara",
      signal: "profundidad de liquidez",
      risk: "calidad de reforma",
      value: "profundidad de comprador",
      signalTags: ["liquidez", "rentabilidad", "reventa", "baja fricción"],
    },
    visualImage: bcnMedia.thresholds.investmentLogic.src,
    atmosphere: "central stock / clear demand",
    signal: "liquidity depth",
    risk: "renovation quality",
    value: "buyer depth",
    primaryDistrictId: "eixample",
    secondaryDistrictIds: ["poblenou", "gracia"],
    signalTags: ["liquidity", "rentability", "resale", "low friction"],
  },
  {
    id: "design-renovation",
    label: "Design renovation",
    shortLabel: "renovation",
    advisoryLine: "Light, structure and material upside.",
    intentEs: {
      label: "Reforma de diseño",
      shortLabel: "reforma",
      advisoryLine: "Luz, estructura y potencial material.",
      atmosphere: "detalle material / luz suave",
      signal: "potencial de diseño",
      risk: "licencias y estructura",
      value: "carácter escaso",
      signalTags: ["luz", "licencias", "estructura", "potencial material"],
    },
    visualImage: bcnMedia.thresholds.designRenovation.src,
    atmosphere: "material detail / soft daylight",
    signal: "design upside",
    risk: "permit + structure",
    value: "scarce character",
    primaryDistrictId: "gracia",
    secondaryDistrictIds: ["eixample", "poblenou"],
    signalTags: ["light", "permits", "structure", "material upside"],
  },
  {
    id: "privacy",
    label: "Privacy",
    shortLabel: "privacy",
    advisoryLine: "Access, discretion and controlled rhythm.",
    intentEs: {
      label: "Privacidad",
      shortLabel: "privacidad",
      advisoryLine: "Acceso, discreción y ritmo controlado.",
      atmosphere: "acceso controlado / escala tranquila",
      signal: "discreción primero",
      risk: "encaje de rutina",
      value: "prima por escala privada",
      signalTags: ["discreción", "acceso controlado", "seguridad", "quietud"],
    },
    visualImage: bcnMedia.thresholds.privacy.src,
    atmosphere: "controlled access / quiet scale",
    signal: "discretion first",
    risk: "routine fit",
    value: "private scale premium",
    primaryDistrictId: "pedralbes",
    secondaryDistrictIds: ["sarria", "diagonal-mar"],
    signalTags: ["discretion", "controlled access", "security", "quiet"],
  },
  {
    id: "walkable-daily-life",
    label: "Walkable daily life",
    shortLabel: "walkable life",
    advisoryLine: "Street texture before apartment ranking.",
    intentEs: {
      label: "Vida diaria caminable",
      shortLabel: "vida caminable",
      advisoryLine: "Textura de calle antes que ranking de vivienda.",
      atmosphere: "cafés / mercados / rutas diarias",
      signal: "carácter caminable",
      risk: "ruido calle por calle",
      value: "identidad local",
      signalTags: ["mercados", "cafés", "transporte", "textura de calle"],
    },
    visualImage: bcnMedia.thresholds.walkableDailyLife.src,
    atmosphere: "cafes / markets / daily routes",
    signal: "walkable character",
    risk: "street-by-street noise",
    value: "local identity",
    primaryDistrictId: "gracia",
    secondaryDistrictIds: ["eixample", "poblenou"],
    signalTags: ["markets", "cafes", "transport", "street texture"],
  },
];

export const districtLens: DistrictLens[] = [
  {
    id: "eixample",
    name: "Eixample",
    slug: "eixample",
    node: { x: "42%", y: "42%" },
    summary: "Structured urban rhythm with classic building stock, strong walkability and legible resale logic.",
    signal: "classic liquidity",
    bestFor: "investors + renovation buyers",
    risk: "noise + finish diligence",
    valueShort: "stock clarity + buyer depth",
    buyerFit: "Classic Barcelona buyers, liquidity-aware investors and renovation profiles that need acquisition clarity.",
    rhythm: "Ordered, luminous, central and highly walkable, with street-by-street noise variation.",
    valueLogic: "Long-term demand is easy to understand because stock, transport and buyer depth are visible.",
    tradeOff: "Renovation quality, balcony exposure and street noise need early diligence.",
    lensEs: {
      name: "Eixample",
      summary: "Ritmo urbano estructurado, stock clásico, alta caminabilidad y lógica de reventa legible.",
      signal: "liquidez clásica",
      bestFor: "inversores y compradores de reforma",
      risk: "ruido y diligencia de acabados",
      valueShort: "claridad de stock + profundidad de comprador",
      buyerFit: "Compradores de Barcelona clásica, inversores atentos a liquidez y perfiles de reforma que necesitan claridad de adquisición.",
      rhythm: "Ordenado, luminoso, central y muy caminable, con variación de ruido calle por calle.",
      valueLogic: "La demanda a largo plazo es fácil de leer porque stock, transporte y profundidad de comprador son visibles.",
      tradeOff: "Calidad de reforma, exposición de balcón y ruido de calle requieren diligencia temprana.",
      reportSignals: ["liquidez alta", "diligencia de reforma", "ruido varía por calle"],
    },
    matchingIntentIds: ["investment-logic", "design-renovation", "walkable-daily-life", "family-calm"],
    reportSignals: ["liquidity high", "renovation diligence", "noise varies by street"],
  },
  {
    id: "gracia",
    name: "Gràcia",
    slug: "gracia",
    node: { x: "34%", y: "27%" },
    summary: "Human-scale, local and design-forward, with strong daily-life texture.",
    signal: "walkable character",
    bestFor: "daily-life buyers",
    risk: "street-by-street noise",
    valueShort: "scarcity + local identity",
    buyerFit: "Lifestyle buyers who want walkability, character and neighborhood identity without spectacle.",
    rhythm: "Village-like streets, cafes, small squares and pockets of calm near active routes.",
    valueLogic: "Scarcity and local identity protect desirability when micro-location is right.",
    tradeOff: "Quiet pocket versus active street can change the experience completely.",
    lensEs: {
      name: "Gràcia",
      summary: "Escala humana, identidad local y orientación al diseño, con textura fuerte de vida diaria.",
      signal: "carácter caminable",
      bestFor: "compradores de vida diaria",
      risk: "ruido calle por calle",
      valueShort: "escasez + identidad local",
      buyerFit: "Compradores de estilo de vida que buscan caminabilidad, carácter e identidad de barrio sin espectáculo.",
      rhythm: "Calles de escala casi de pueblo, cafés, plazas pequeñas y bolsas de calma cerca de rutas activas.",
      valueLogic: "La escasez y la identidad local protegen el deseo cuando la microzona encaja.",
      tradeOff: "Un bolsillo tranquilo y una calle activa pueden cambiar por completo la experiencia.",
      reportSignals: ["microzona clave", "encaje de diseño fuerte", "prima por escasez"],
    },
    matchingIntentIds: ["design-renovation", "walkable-daily-life", "investment-logic"],
    reportSignals: ["micro-location matters", "design fit strong", "scarcity premium"],
  },
  {
    id: "sarria",
    name: "Sarrià",
    slug: "sarria",
    node: { x: "20%", y: "36%" },
    summary: "Residential, green and school-oriented, built around longer daily routines.",
    signal: "family calm",
    bestFor: "relocation + long hold",
    risk: "route dependency",
    valueShort: "stable family demand",
    buyerFit: "Family relocation and long-hold buyers who value calm over central energy.",
    rhythm: "Quiet streets, practical routes, softer pace and a stronger residential baseline.",
    valueLogic: "Stable demand from family profiles supports premium stock with good plans.",
    tradeOff: "Less central energy; transport and school routes must fit before viewing volume grows.",
    lensEs: {
      name: "Sarrià",
      summary: "Residencial, verde y orientado a colegios, construido alrededor de rutinas diarias más largas.",
      signal: "calma familiar",
      bestFor: "relocalización y tenencia larga",
      risk: "dependencia de rutas",
      valueShort: "demanda familiar estable",
      buyerFit: "Relocalización familiar y compradores de largo plazo que valoran calma por encima de energía central.",
      rhythm: "Calles tranquilas, rutas prácticas, ritmo más suave y base residencial más fuerte.",
      valueLogic: "La demanda estable de perfiles familiares sostiene stock premium con buenas plantas.",
      tradeOff: "Menos energía central; transporte y rutas escolares deben encajar antes de ampliar visitas.",
      reportSignals: ["base familiar", "proximidad verde", "demanda premium estable"],
    },
    matchingIntentIds: ["family-calm", "privacy", "sea-light"],
    reportSignals: ["family baseline", "green proximity", "stable premium demand"],
  },
  {
    id: "poblenou",
    name: "Poblenou",
    slug: "poblenou",
    node: { x: "68%", y: "50%" },
    summary: "Creative, modern and coastal-adjacent, with varied stock from raw to premium.",
    signal: "future-facing demand",
    bestFor: "modern buyers",
    risk: "stock variance",
    valueShort: "regeneration + lifestyle",
    buyerFit: "Contemporary buyers, flexible living profiles and investors looking at future-facing demand.",
    rhythm: "Open, evolving, practical and close to both work clusters and the coast.",
    valueLogic: "Lifestyle narrative and regeneration support a clear future-facing position.",
    tradeOff: "Building stock varies sharply; raw charm and finished premium are not the same risk.",
    lensEs: {
      name: "Poblenou",
      summary: "Creativo, moderno y cercano a la costa, con stock variado desde bruto hasta premium.",
      signal: "demanda orientada al futuro",
      bestFor: "compradores modernos",
      risk: "variación de stock",
      valueShort: "regeneración + estilo de vida",
      buyerFit: "Compradores contemporaneos, perfiles flexibles e inversores que miran demanda futura.",
      rhythm: "Abierto, en evolución, práctico y cercano tanto a hubs de trabajo como a la costa.",
      valueLogic: "La narrativa de estilo de vida y regeneración sostiene una posición clara a futuro.",
      tradeOff: "El stock varía mucho; encanto en bruto y premium terminado no tienen el mismo riesgo.",
      reportSignals: ["demanda futura", "stock variable", "cerca de la costa"],
    },
    matchingIntentIds: ["sea-light", "investment-logic", "design-renovation", "walkable-daily-life"],
    reportSignals: ["future demand", "stock varies", "coastal-adjacent"],
  },
  {
    id: "diagonal-mar",
    name: "Diagonal Mar",
    slug: "diagonal-mar",
    node: { x: "76%", y: "62%" },
    summary: "Coastal, modern and terrace-led, with high-comfort building logic.",
    signal: "sea-light comfort",
    bestFor: "coastal relocation",
    risk: "HOA + exposure",
    valueShort: "terrace + view scarcity",
    buyerFit: "Sea-light relocation, family comfort and buyers who value modern amenities.",
    rhythm: "Open, bright and coastal, with daily comfort tied to exposure, services and HOA logic.",
    valueLogic: "Lifestyle scarcity is clear when terrace, view and building management are aligned.",
    tradeOff: "Entry point, HOA structure and exposure should be reviewed before emotional commitment.",
    lensEs: {
      name: "Diagonal Mar",
      summary: "Costero, moderno y guiado por terraza, con lógica de edificio de alto confort.",
      signal: "confort de luz mediterránea",
      bestFor: "relocalización costera",
      risk: "comunidad y exposición",
      valueShort: "terraza + escasez de vista",
      buyerFit: "Relocalización con luz mediterránea, confort familiar y compradores que valoran amenities modernos.",
      rhythm: "Abierto, luminoso y costero, con confort diario ligado a exposición, servicios y lógica de comunidad.",
      valueLogic: "La escasez de estilo de vida es clara cuando terraza, vista y gestión del edificio están alineadas.",
      tradeOff: "Precio de entrada, estructura de comunidad y exposición deben revisarse antes del compromiso emocional.",
      reportSignals: ["exposición al mar", "revisión de comunidad", "valor de terraza"],
    },
    matchingIntentIds: ["sea-light", "family-calm", "privacy"],
    reportSignals: ["sea exposure", "HOA review", "terrace value"],
  },
  {
    id: "pedralbes",
    name: "Pedralbes",
    slug: "pedralbes",
    node: { x: "14%", y: "58%" },
    summary: "Discreet, residential and spacious, with a private-office sense of calm.",
    signal: "private scale",
    bestFor: "privacy-led buyers",
    risk: "less urban texture",
    valueShort: "scale + discretion",
    buyerFit: "Privacy-led relocation, family scale and buyers who need controlled access patterns.",
    rhythm: "Slow, protected and residential, with stronger car logic and quieter daily routines.",
    valueLogic: "Premium scarcity comes from scale, privacy and stability rather than central buzz.",
    tradeOff: "Less urban texture; convenience depends on school, driver and routine fit.",
    lensEs: {
      name: "Pedralbes",
      summary: "Discreto, residencial y amplio, con una calma cercana a oficina privada.",
      signal: "escala privada",
      bestFor: "compradores guiados por privacidad",
      risk: "menos textura urbana",
      valueShort: "escala + discreción",
      buyerFit: "Relocalización guiada por privacidad, escala familiar y compradores que necesitan patrones de acceso controlado.",
      rhythm: "Lento, protegido y residencial, con más lógica de coche y rutinas diarias más tranquilas.",
      valueLogic: "La escasez premium viene de escala, privacidad y estabilidad, no de energía central.",
      tradeOff: "Menos textura urbana; la conveniencia depende de colegio, conductor y encaje de rutina.",
      reportSignals: ["discreción primero", "prima por escala", "encaje de rutina"],
    },
    matchingIntentIds: ["privacy", "family-calm"],
    reportSignals: ["discretion first", "scale premium", "routine fit"],
  },
];

export const lensPropertyMatches: LensPropertyMatch[] = [
  {
    propertyId: "l-05",
    districtId: "sarria",
    intentIds: ["family-calm", "privacy"],
    priority: 100,
    advisorReason: "Family plan / calm rooms / green proximity.",
  },
  {
    propertyId: "l-08",
    districtId: "pedralbes",
    intentIds: ["privacy", "family-calm"],
    priority: 96,
    advisorReason: "Privacy / scale / controlled rhythm.",
  },
  {
    propertyId: "l-04",
    districtId: "diagonal-mar",
    intentIds: ["sea-light", "family-calm", "privacy"],
    priority: 94,
    advisorReason: "Sea light / terrace / modern building logic.",
  },
  {
    propertyId: "l-02",
    districtId: "eixample",
    intentIds: ["investment-logic", "design-renovation", "walkable-daily-life", "family-calm"],
    priority: 90,
    advisorReason: "Classic stock / central liquidity.",
  },
  {
    propertyId: "l-01",
    districtId: "gracia",
    intentIds: ["design-renovation", "walkable-daily-life"],
    priority: 88,
    advisorReason: "Soft daylight / walkable texture / design restraint.",
  },
  {
    propertyId: "l-03",
    districtId: "poblenou",
    intentIds: ["investment-logic", "design-renovation", "sea-light", "walkable-daily-life"],
    priority: 82,
    advisorReason: "Contemporary stock / future-facing demand.",
  },
  {
    propertyId: "l-07",
    districtId: "gracia",
    intentIds: ["design-renovation", "walkable-daily-life"],
    priority: 76,
    advisorReason: "Heritage detail / selective quietness.",
  },
  {
    propertyId: "l-06",
    districtId: "diagonal-mar",
    intentIds: ["sea-light", "walkable-daily-life"],
    priority: 72,
    advisorReason: "Compact coastal access / regulation check.",
  },
  {
    propertyId: "l-09",
    districtId: "eixample",
    intentIds: ["investment-logic", "walkable-daily-life"],
    priority: 70,
    advisorReason: "Neutral finish / low-maintenance investment.",
  },
];

export function getBuyerIntent(id: BuyerIntentId) {
  return buyerIntents.find((intent) => intent.id === id) ?? buyerIntents[0];
}

export function getDistrictLens(id: DistrictId) {
  return districtLens.find((district) => district.id === id) ?? districtLens[0];
}

export function resolveLensMatches(activeIntentId: BuyerIntentId, activeDistrictId: DistrictId) {
  return [...lensPropertyMatches].sort((a, b) => {
    const aIntent = a.intentIds.includes(activeIntentId) ? 1000 : 0;
    const bIntent = b.intentIds.includes(activeIntentId) ? 1000 : 0;
    const aDistrict = a.districtId === activeDistrictId ? 450 : 0;
    const bDistrict = b.districtId === activeDistrictId ? 450 : 0;

    return bIntent + bDistrict + b.priority - (aIntent + aDistrict + a.priority);
  });
}
