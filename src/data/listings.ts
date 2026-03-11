export type Listing = {
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

const hero = (id: string) => `/demo/listings/${id}/${id}-01.png`;
const g = (id: string) => [
  `/demo/listings/${id}/${id}-02.png`,
  `/demo/listings/${id}/${id}-03.png`,
  `/demo/listings/${id}/${id}-04.png`,
];

export const listings: Listing[] = [
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
