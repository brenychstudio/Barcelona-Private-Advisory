import { bcnMedia } from "./bcnMedia";
import type { BuyerIntentId, DistrictId } from "./barcelonaLens";

type ViewingReadiness = "High" | "Medium" | "Selective";

export type ListingAdvisoryCopy = {
  bestFor?: string;
  signal?: string;
  tradeOff?: string;
  advisorReason?: string;
  acquisitionNote?: string;
  riskNote?: string;
  nextAction?: string;
};

export type ListingAdvisory = {
  districtId: DistrictId;
  districtLabel: string;
  intentIds: BuyerIntentId[];
  bestFor: string;
  signal: string;
  tradeOff: string;
  advisorReason: string;
  viewingReadiness: ViewingReadiness;
  shortlistPriority: number;
  acquisitionNote: string;
  riskNote: string;
  nextAction: string;
  advisoryEs?: ListingAdvisoryCopy;
};

type ListingBase = {
  id: string; // l-01 ... l-09
  code: string; // SC-xxxxx (demo)
  title: string;
  title_es?: string;
  district: string;
  price: number;
  beds: number;
  baths: number;
  sqm: number;
  highlights: [string, string, string];
  highlights_es?: [string, string, string];
  tags: string[]; // advisory tags
  description: string; // premium editorial description (supports \n\n paragraphs)
  description_es?: string;
  images: {
    hero: string; // cover
    gallery: string[]; // 3 frames minimum
  };
};

export type Listing = ListingBase & ListingAdvisory;

const hero = (id: keyof typeof bcnMedia.properties.byListingId) => bcnMedia.properties.byListingId[id].src;
const g = (id: string) => [
  `/demo/listings/${id}/${id}-02.png`,
  `/demo/listings/${id}/${id}-03.png`,
  `/demo/listings/${id}/${id}-04.png`,
];

const advisoryByListingId: Record<string, ListingAdvisory> = {
  "l-01": {
    districtId: "gracia",
    districtLabel: "Gràcia",
    intentIds: ["design-renovation", "walkable-daily-life"],
    bestFor: "Design-led buyers who want walkability, quiet texture and a softer local rhythm.",
    signal: "Soft daylight, clean geometry and a neighborhood fit that supports daily use.",
    tradeOff: "Less immediate liquidity depth than Eixample and more street-by-street noise variation.",
    advisorReason: "Strong match when the brief values Barcelona character without visual clutter or renovation drama.",
    viewingReadiness: "High",
    shortlistPriority: 5,
    acquisitionNote: "Prioritize if the buyer wants a design-forward daily-life base rather than a trophy address.",
    riskNote: "Check micro-location noise, stair/lift condition and community maintenance history.",
    nextAction: "Compare quiet streets",
    advisoryEs: {
      bestFor: "Compradores orientados al diseño que buscan caminabilidad, textura tranquila y un ritmo local más suave.",
      signal: "Luz suave, geometría limpia y encaje de barrio que sostiene el uso diario.",
      tradeOff: "Menor profundidad de liquidez inmediata que Eixample y más variación de ruido según la calle.",
      advisorReason: "Buen encaje cuando el brief valora carácter de Barcelona sin ruido visual ni drama de reforma.",
      acquisitionNote: "Priorizar si el comprador busca una base de vida diaria con diseño, no una dirección trofeo.",
      riskNote: "Revisar ruido de microzona, estado de escalera/ascensor e historial de mantenimiento comunitario.",
      nextAction: "Comparar calles tranquilas",
    },
  },
  "l-02": {
    districtId: "eixample",
    districtLabel: "Eixample",
    intentIds: ["investment-logic", "design-renovation", "walkable-daily-life", "family-calm"],
    bestFor: "Liquidity-aware buyers who still want classic Barcelona proportion and comfort.",
    signal: "Central stock clarity, balcony rhythm and easy resale logic.",
    tradeOff: "Finish quality and street exposure need earlier diligence than in newer coastal stock.",
    advisorReason: "Best fit when the brief needs a legible asset with strong buyer depth and classic city appeal.",
    viewingReadiness: "High",
    shortlistPriority: 4,
    acquisitionNote: "Use as the benchmark for price discipline and renovation quality across the shortlist.",
    riskNote: "Review acoustic exposure, renovation permits and building-level capital works.",
    nextAction: "Request renovation file",
    advisoryEs: {
      bestFor: "Compradores atentos a liquidez que también quieren proporción clásica de Barcelona y confort.",
      signal: "Claridad de stock central, ritmo de balcón y lógica de reventa legible.",
      tradeOff: "La calidad de acabados y la exposición de calle requieren diligencia antes que en stock costero moderno.",
      advisorReason: "Mejor encaje cuando el brief necesita un activo comprensible, con profundidad de demanda y atractivo urbano clásico.",
      acquisitionNote: "Usar como referencia para disciplina de precio y calidad de reforma dentro de la shortlist.",
      riskNote: "Revisar exposición acústica, permisos de reforma y obras previstas del edificio.",
      nextAction: "Solicitar expediente de reforma",
    },
  },
  "l-03": {
    districtId: "poblenou",
    districtLabel: "Poblenou",
    intentIds: ["investment-logic", "design-renovation", "sea-light", "walkable-daily-life"],
    bestFor: "Modern buyers who want future-facing demand near creative and coastal-adjacent routes.",
    signal: "Flexible plan, contemporary stock and regeneration-backed lifestyle logic.",
    tradeOff: "Stock quality varies sharply between raw charm and true premium finish.",
    advisorReason: "Useful alternative when the buyer wants modern energy with stronger future-demand logic than heritage stock.",
    viewingReadiness: "Medium",
    shortlistPriority: 6,
    acquisitionNote: "View after Eixample or Diagonal Mar to calibrate modern-stock value.",
    riskNote: "Verify building quality, surrounding development and noise from active mixed-use streets.",
    nextAction: "Validate stock quality",
    advisoryEs: {
      bestFor: "Compradores modernos que buscan demanda futura cerca de rutas creativas y proximidad costera.",
      signal: "Planta flexible, stock contemporáneo y lógica lifestyle apoyada por regeneración urbana.",
      tradeOff: "La calidad del stock varía mucho entre encanto en bruto y acabado realmente premium.",
      advisorReason: "Alternativa útil si el comprador quiere energía moderna con más lógica de demanda futura que el stock patrimonial.",
      acquisitionNote: "Visitar después de Eixample o Diagonal Mar para calibrar el valor del stock moderno.",
      riskNote: "Verificar calidad del edificio, desarrollo del entorno y ruido de calles mixtas activas.",
      nextAction: "Validar calidad del stock",
    },
  },
  "l-04": {
    districtId: "diagonal-mar",
    districtLabel: "Diagonal Mar",
    intentIds: ["sea-light", "family-calm", "privacy"],
    bestFor: "Sea-light relocation with family comfort and low renovation-risk constraints.",
    signal: "High daily-use clarity, terrace mood and modern building logic.",
    tradeOff: "Higher entry price and less heritage character than Eixample.",
    advisorReason: "Best current match for buyers prioritizing light, air, terrace use and low renovation risk.",
    viewingReadiness: "High",
    shortlistPriority: 1,
    acquisitionNote: "Prioritize private viewing if coastal proximity is non-negotiable.",
    riskNote: "Review community fees, glare control, exposure and long-term building maintenance.",
    nextAction: "Request viewing path",
    advisoryEs: {
      bestFor: "Relocalización con luz mediterránea, confort familiar y bajo riesgo de reforma.",
      signal: "Claridad de uso diario, terraza como extensión de vida y lógica de edificio moderno.",
      tradeOff: "Precio de entrada más alto y menos carácter patrimonial que en Eixample.",
      advisorReason: "Mejor encaje actual para compradores que priorizan luz, aire, uso de terraza y bajo riesgo de reforma.",
      acquisitionNote: "Priorizar visita privada si la proximidad costera no es negociable.",
      riskNote: "Revisar gastos de comunidad, control de luz directa, exposición y mantenimiento del edificio a largo plazo.",
      nextAction: "Solicitar ruta de visita",
    },
  },
  "l-05": {
    districtId: "sarria",
    districtLabel: "Sarrià",
    intentIds: ["family-calm", "privacy"],
    bestFor: "Family relocation buyers prioritizing calm routines, schools and long-hold comfort.",
    signal: "Residential quiet, storage logic and stable family-demand baseline.",
    tradeOff: "Less central energy and more dependency on school, transport and daily route fit.",
    advisorReason: "Strongest family-calm object when the brief is about predictability rather than central buzz.",
    viewingReadiness: "High",
    shortlistPriority: 2,
    acquisitionNote: "Use as the family baseline before comparing coastal or privacy-led alternatives.",
    riskNote: "Validate school routes, transport cadence and noise at the exact micro-location.",
    nextAction: "Map family routine",
    advisoryEs: {
      bestFor: "Familias en relocalizacion que priorizan rutinas calmadas, colegios y confort a largo plazo.",
      signal: "Calma residencial, lógica de almacenamiento y base estable de demanda familiar.",
      tradeOff: "Menos energía central y más dependencia del encaje de colegios, transporte y rutas diarias.",
      advisorReason: "Objeto familiar más fuerte cuando el brief busca previsibilidad antes que energía urbana.",
      acquisitionNote: "Usar como base familiar antes de comparar alternativas costeras o centradas en privacidad.",
      riskNote: "Validar rutas escolares, cadencia de transporte y ruido en la microzona exacta.",
      nextAction: "Mapear rutina familiar",
    },
  },
  "l-06": {
    districtId: "diagonal-mar",
    districtLabel: "Barceloneta",
    intentIds: ["sea-light", "walkable-daily-life"],
    bestFor: "Buyers who want a compact city base with immediate sea access and simple ownership.",
    signal: "Low footprint, coastal proximity and efficient daily use.",
    tradeOff: "Regulation sensitivity and limited long-term family flexibility.",
    advisorReason: "Good alternative when sea proximity beats size and the buyer accepts a compact plan.",
    viewingReadiness: "Selective",
    shortlistPriority: 8,
    acquisitionNote: "Keep as a use-case option rather than a default family or investment recommendation.",
    riskNote: "Confirm rental intent, local restrictions, building condition and micro-unit liquidity.",
    nextAction: "Check regulation fit",
    advisoryEs: {
      bestFor: "Compradores que quieren una base compacta en ciudad con acceso inmediato al mar y propiedad sencilla.",
      signal: "Huella reducida, proximidad costera y uso diario eficiente.",
      tradeOff: "Sensibilidad regulatoria y flexibilidad familiar limitada a largo plazo.",
      advisorReason: "Buena alternativa cuando la proximidad al mar pesa más que el tamaño y el comprador acepta una planta compacta.",
      acquisitionNote: "Mantener como opción de caso de uso, no como recomendación familiar o de inversión por defecto.",
      riskNote: "Confirmar intención de alquiler, restricciones locales, estado del edificio y liquidez de micro-unidad.",
      nextAction: "Revisar encaje regulatorio",
    },
  },
  "l-07": {
    districtId: "gracia",
    districtLabel: "El Born",
    intentIds: ["design-renovation", "walkable-daily-life"],
    bestFor: "Heritage-minded buyers who want walkability, texture and selective quietness.",
    signal: "Preserved character, warm detail and museum-calm atmosphere.",
    tradeOff: "Renovation constraints and nightlife-adjacent micro-location risk need diligence.",
    advisorReason: "Useful as the heritage counterpoint when the buyer values character over new-build certainty.",
    viewingReadiness: "Medium",
    shortlistPriority: 7,
    acquisitionNote: "Compare only after confirming the buyer accepts heritage constraints.",
    riskNote: "Review building age, permits, noise windows and conservation obligations.",
    nextAction: "Review heritage limits",
    advisoryEs: {
      bestFor: "Compradores con sensibilidad patrimonial que buscan caminabilidad, textura y quietud selectiva.",
      signal: "Caracter preservado, detalle calido y atmosfera de calma casi museistica.",
      tradeOff: "Restricciones de reforma y riesgo de microzona cercana a vida nocturna requieren diligencia.",
      advisorReason: "Contrapunto patrimonial útil cuando el comprador valora carácter por encima de certeza de obra nueva.",
      acquisitionNote: "Comparar solo después de confirmar que el comprador acepta límites patrimoniales.",
      riskNote: "Revisar antiguedad del edificio, permisos, ventanas de ruido y obligaciones de conservacion.",
      nextAction: "Revisar límites patrimoniales",
    },
  },
  "l-08": {
    districtId: "pedralbes",
    districtLabel: "Pedralbes",
    intentIds: ["privacy", "family-calm"],
    bestFor: "Privacy-led relocation where scale, discretion and controlled daily rhythm matter most.",
    signal: "Private scale, quiet luxury and long-term family comfort.",
    tradeOff: "Less urban texture and stronger car/routine dependency than central districts.",
    advisorReason: "Premium privacy object when the brief prioritizes discretion over neighborhood buzz.",
    viewingReadiness: "Medium",
    shortlistPriority: 3,
    acquisitionNote: "Qualify routine fit before private viewing; the asset works best for controlled access patterns.",
    riskNote: "Confirm security, access, maintenance burden and whether the daily rhythm fits.",
    nextAction: "Qualify privacy routine",
    advisoryEs: {
      bestFor: "Relocalización orientada a privacidad donde escala, discreción y ritmo diario controlado son centrales.",
      signal: "Escala privada, lujo silencioso y confort familiar de largo plazo.",
      tradeOff: "Menos textura urbana y mayor dependencia de coche/rutina que en distritos centrales.",
      advisorReason: "Objeto premium de privacidad cuando el brief prioriza discreción por encima de energía de barrio.",
      acquisitionNote: "Calificar el encaje de rutina antes de visita privada; funciona mejor con patrones de acceso controlado.",
      riskNote: "Confirmar seguridad, accesos, carga de mantenimiento y ajuste del ritmo diario.",
      nextAction: "Calificar rutina de privacidad",
    },
  },
  "l-09": {
    districtId: "eixample",
    districtLabel: "Barcelona",
    intentIds: ["investment-logic", "walkable-daily-life"],
    bestFor: "Investment-lens buyers seeking durability, low maintenance and straightforward ownership.",
    signal: "Neutral style, durable finishes and low aesthetic risk.",
    tradeOff: "Less emotional pull and weaker premium storytelling than district-specific options.",
    advisorReason: "Practical shortlist object when the buyer wants clean usability before lifestyle drama.",
    viewingReadiness: "Selective",
    shortlistPriority: 9,
    acquisitionNote: "Use as a value-control option if the shortlist becomes too emotionally weighted.",
    riskNote: "Check rentability assumptions, maintenance records and resale differentiation.",
    nextAction: "Stress-test returns",
    advisoryEs: {
      bestFor: "Compradores con lente de inversión que buscan durabilidad, bajo mantenimiento y propiedad directa.",
      signal: "Estilo neutro, acabados durables y bajo riesgo estetico.",
      tradeOff: "Menor atracción emocional y narrativa premium más débil que opciones específicas de distrito.",
      advisorReason: "Objeto práctico de shortlist cuando el comprador quiere usabilidad limpia antes que carga emocional.",
      acquisitionNote: "Usar como opción de control de valor si la shortlist se vuelve demasiado emocional.",
      riskNote: "Revisar supuestos de rentabilidad, historial de mantenimiento y diferenciacion de reventa.",
      nextAction: "Estresar retornos",
    },
  },
};

const baseListings: ListingBase[] = [
  {
    id: "l-01",
    code: "SC-01332",
    title: "Gràcia — design light bedroom",
    title_es: "Gràcia — dormitorio luminoso de diseño",
    district: "Gràcia",
    price: 780000,
    beds: 2,
    baths: 2,
    sqm: 92,
    highlights: ["Soft daylight", "Clean geometry", "Premium materials"],
    highlights_es: ["Luz suave", "Geometría limpia", "Materiales premium"],
    tags: ["quiet", "design", "walkable"],
    description: `A calm, design-led apartment in Gràcia with a warm-white palette and restrained material choices. Soft daylight and clean geometry keep the space quiet and precise, with a layout that prioritizes comfort over spectacle.

Best for a walkable lifestyle with a strong neighborhood fit — cafés, parks, and human-scale streets. Ideal when you want “Barcelona character” without noise and visual clutter.`,
    description_es: `Un piso calmado y de diseño en Gràcia, con paleta blanco-cálida y materiales contenidos. La luz suave y la geometría limpia mantienen una sensación precisa, sin ruido visual.

Ideal para un estilo de vida caminable y un encaje de barrio fuerte: cafés, parques y calles de escala humana. Perfecto si buscas carácter de Barcelona sin exceso.`,
    images: { hero: hero("l-01"), gallery: g("l-01") },
  },
  {
    id: "l-02",
    code: "SC-01327",
    title: "Eixample — classic balcony renovation",
    title_es: "Eixample — renovación clásica con balcón",
    district: "Eixample",
    price: 990000,
    beds: 3,
    baths: 2,
    sqm: 128,
    highlights: ["Tall windows", "Oak floor", "Quiet palette"],
    highlights_es: ["Ventanas altas", "Suelo de roble", "Paleta serena"],
    tags: ["walkable", "classic", "investor"],
    description: `A classic Eixample renovation built around tall windows and balcony rhythm — bright, calm, and structurally legible. Oak flooring and restrained tones keep the interior timeless, while the plan reads as efficient and easy to live in.

Strong fit for buyers who value liquidity and long-term demand in the city core. A good “investment lens” option when you want classic Barcelona proportions with modern comfort.`,
    description_es: `Renovación clásica en Eixample basada en ventanas altas y ritmo de balcón: luminosa, serena y fácil de leer. Suelo de roble y tonos discretos para un interior atemporal.

Buen perfil para liquidez y demanda sostenida en el centro. Opción sólida “lente inversión” cuando quieres proporciones barcelonesas con confort actual.`,
    images: { hero: hero("l-02"), gallery: g("l-02") },
  },
  {
    id: "l-03",
    code: "SC-01310",
    title: "Poblenou — refined industrial-to-premium",
    title_es: "Poblenou — industrial refinado a premium",
    district: "Poblenou",
    price: 860000,
    beds: 2,
    baths: 2,
    sqm: 110,
    highlights: ["High ceilings", "Concrete + oak", "Soft shadows"],
    highlights_es: ["Techos altos", "Hormigón + roble", "Sombras suaves"],
    tags: ["modern", "creative", "investor"],
    description: `A refined industrial-to-premium feel: height, soft concrete, oak warmth, and controlled shadows. The space reads contemporary without turning “showroom” — it’s minimal, tactile, and credible.

Best for modern buyers who want proximity to tech/creative clusters and a flexible plan for daily life. A solid fit for a future-forward lifestyle with strong re-sale logic.`,
    description_es: `Industrial refinado a premium: altura, hormigón suave, calidez de roble y sombras controladas. Se siente contemporáneo sin volverse “showroom”.

Ideal para compradores modernos cerca de hubs creativos/tech y un plano flexible. Buen encaje para un estilo de vida actual con lógica de reventa.`,
    images: { hero: hero("l-03"), gallery: g("l-03") },
  },
  {
    id: "l-04",
    code: "SC-01288",
    title: "Diagonal Mar — high floor sea hint",
    title_es: "Diagonal Mar — planta alta con luz de mar",
    district: "Diagonal Mar",
    price: 1250000,
    beds: 3,
    baths: 2,
    sqm: 156,
    highlights: ["Sea light", "Terrace", "Modern lines"],
    highlights_es: ["Luz de mar", "Terraza", "Líneas modernas"],
    tags: ["sea", "modern", "family"],
    description: `A high-floor coastal profile with modern lines, terrace mood, and a clean “sea light” atmosphere. The interior stays calm and spacious, designed to hold daylight without glare or visual noise.

Best for buyers who want contemporary comfort near the coast and a family-friendly plan. Advisory note: buildings in this segment often include HOA/amenity structures — review early.`,
    description_es: `Perfil costero en planta alta, líneas modernas y una terraza con atmósfera. La “luz de mar” entra sin deslumbrar; interior amplio y silencioso.

Ideal para confort contemporáneo cerca de la costa y plan familiar. Nota advisory: en este segmento suelen existir estructuras de comunidad/amenities — revisar pronto.`,
    images: { hero: hero("l-04"), gallery: g("l-04") },
  },
  {
    id: "l-05",
    code: "SC-01271",
    title: "Sarrià — family-ready quiet fit",
    title_es: "Sarrià — encaje familiar y silencioso",
    district: "Sarrià",
    price: 1150000,
    beds: 4,
    baths: 3,
    sqm: 165,
    highlights: ["Storage", "Calm rooms", "Green feel"],
    highlights_es: ["Almacenamiento", "Estancias tranquilas", "Sensación verde"],
    tags: ["family", "quiet", "green"],
    description: `A Sarrià profile focused on family comfort: calm rooms, practical storage, and a “green feel” that reads residential rather than touristic. The layout favors long-term livability and predictable daily rhythm.

Best for buyers optimizing for quiet streets, schools, and a stable neighborhood baseline. A strong match when lifestyle fit matters more than central hype.`,
    description_es: `Sarrià orientado a vida familiar: estancias calmadas, almacenamiento práctico y sensación verde, más residencial que turística. Prioriza habitabilidad a largo plazo.

Ideal si optimizas por calles tranquilas, colegios y estabilidad. Fuerte encaje cuando el estilo de vida pesa más que el “hype” central.`,
    images: { hero: hero("l-05"), gallery: g("l-05") },
  },
  {
    id: "l-06",
    code: "SC-01240",
    title: "Barceloneta — compact beach-side unit",
    title_es: "Barceloneta — compacto junto a la playa",
    district: "Barceloneta",
    price: 390000,
    beds: 1,
    baths: 1,
    sqm: 48,
    highlights: ["Walkable", "Sea proximity", "Clean layout"],
    highlights_es: ["Caminable", "Cerca del mar", "Distribución limpia"],
    tags: ["sea", "walkable", "compact"],
    description: `A compact, beach-side unit designed for efficiency: clean layout, minimal footprint, and immediate walkability. It reads bright and functional — ideal as a base in the city with the sea within minutes.

Best for buyers who prioritize proximity and simplicity. Advisory note: coastal micro-units can be regulation-sensitive depending on rental intent — confirm constraints early.`,
    description_es: `Unidad compacta y eficiente: distribución limpia y caminabilidad inmediata con el mar a minutos. Luminosa, funcional y sin exceso.

Ideal para proximidad y simplicidad. Nota advisory: micro-unidades costeras pueden ser sensibles a normativa según uso — confirmar restricciones pronto.`,
    images: { hero: hero("l-06"), gallery: g("l-06") },
  },
  {
    id: "l-07",
    code: "SC-01212",
    title: "El Born — heritage detail, refined",
    title_es: "El Born — detalle histórico, refinado",
    district: "El Born",
    price: 640000,
    beds: 2,
    baths: 2,
    sqm: 84,
    highlights: ["Warm texture", "Museum calm", "Soft contrast"],
    highlights_es: ["Textura cálida", "Calma museo", "Contraste suave"],
    tags: ["walkable", "heritage", "quiet"],
    description: `A refined heritage mood with warm texture and soft contrast — “museum calm” rather than nightlife energy. The tone is restrained, with details that feel preserved, not staged.

Best for buyers seeking walkability and architectural character with selective quietness. Advisory note: heritage areas can include renovation constraints — due diligence matters.`,
    description_es: `Ambiente histórico refinado con textura cálida y contraste suave — calma “museo” más que energía nocturna. Detalles que se sienten preservados, no escenificados.

Ideal para caminabilidad y carácter arquitectónico con quietud selectiva. Nota advisory: en zonas patrimoniales puede haber límites de reforma — diligencia clave.`,
    images: { hero: hero("l-07"), gallery: g("l-07") },
  },
  {
    id: "l-08",
    code: "SC-01195",
    title: "Pedralbes — villa calm interior",
    title_es: "Pedralbes — calma, villa y privacidad",
    district: "Pedralbes",
    price: 2400000,
    beds: 5,
    baths: 4,
    sqm: 310,
    highlights: ["Limestone", "Terrace mood", "Quiet luxury"],
    highlights_es: ["Piedra caliza", "Atmósfera de terraza", "Lujo silencioso"],
    tags: ["privacy", "quiet", "family"],
    description: `A Pedralbes-level calm: privacy, limestone tactility, terrace mood, and quiet luxury without visual excess. The scale supports long-term family life and a slower, more controlled rhythm.

Best for buyers prioritizing discretion and space in a high-end residential zone. A premium “relocation” fit where comfort, privacy, and stability are non-negotiable.`,
    description_es: `Calma de Pedralbes: privacidad, tactilidad de piedra y lujo silencioso sin exceso. La escala acompaña vida familiar y ritmo controlado.

Ideal si priorizas discreción y espacio en zona residencial alta. Encaje premium para reubicación donde confort y privacidad son no negociables.`,
    images: { hero: hero("l-08"), gallery: g("l-08") },
  },
  {
    id: "l-09",
    code: "SC-01173",
    title: "Investment lens — clean modern unit",
    title_es: "Enfoque inversión — unidad moderna y neutra",
    district: "Barcelona",
    price: 520000,
    beds: 2,
    baths: 1,
    sqm: 76,
    highlights: ["Durable finishes", "Bright light", "Neutral style"],
    highlights_es: ["Acabados durables", "Luz clara", "Estilo neutro"],
    tags: ["investor", "modern", "walkable"],
    description: `A clean modern unit with durable finishes, bright light, and a neutral baseline — designed to stay relevant. The plan reads practical and efficient, with minimal aesthetic risk.

Best for an “investment lens” shortlist when you want strong usability and low maintenance. A balanced pick with straightforward ownership logic.`,
    description_es: `Unidad moderna, limpia y de base neutra: acabados durables, luz clara y baja fricción estética. Distribución práctica y eficiente.

Ideal para shortlist “lente inversión” con uso fuerte y mantenimiento bajo. Elección equilibrada con lógica de propiedad directa.`,
    images: { hero: hero("l-09"), gallery: g("l-09") },
  },
];

export const listings: Listing[] = baseListings.map((listing) => ({
  ...listing,
  ...advisoryByListingId[listing.id],
}));
