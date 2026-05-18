export type BcnMediaRole =
  | "hero"
  | "property"
  | "district"
  | "threshold"
  | "dossier"
  | "lens"
  | "materials"
  | "case";

export type BcnMediaFolder =
  | "hero"
  | "properties"
  | "districts"
  | "thresholds"
  | "dossier"
  | "lens"
  | "materials"
  | "case";

export type BcnMediaAsset = {
  id: string;
  role: BcnMediaRole;
  folder: BcnMediaFolder;
  title: string;
  alt: string;
  src: string;
  width: number;
  height: number;
  source: string;
};

export const bcnMediaAssets = [
  {
    "id": "hero.cityField",
    "role": "hero",
    "folder": "hero",
    "title": "Barcelona advisory city field",
    "alt": "Barcelona advisory city field for private property search.",
    "src": "/media/bcn-advisory/hero/advisory-hero-city-field.webp",
    "width": 1448,
    "height": 1086,
    "source": "1.png"
  },
  {
    "id": "hero.interiorLight",
    "role": "hero",
    "folder": "hero",
    "title": "Barcelona advisory interior light",
    "alt": "Refined Barcelona interior with soft daylight for advisory presentation.",
    "src": "/media/bcn-advisory/hero/advisory-hero-interior-light.webp",
    "width": 1448,
    "height": 1086,
    "source": "2.png"
  },
  {
    "id": "hero.terraceSea",
    "role": "hero",
    "folder": "hero",
    "title": "Barcelona advisory terrace sea",
    "alt": "Barcelona terrace and sea-light atmosphere for private buyer advisory.",
    "src": "/media/bcn-advisory/hero/advisory-hero-terrace-sea.webp",
    "width": 1448,
    "height": 1086,
    "source": "3.png"
  },
  {
    "id": "properties.l01",
    "role": "property",
    "folder": "properties",
    "title": "Gracia design light bedroom",
    "alt": "Design-led Gracia property image with calm daylight.",
    "src": "/media/bcn-advisory/properties/l-01-gracia-design-light-bedroom.webp",
    "width": 1448,
    "height": 1086,
    "source": "4.png"
  },
  {
    "id": "properties.l02",
    "role": "property",
    "folder": "properties",
    "title": "Eixample classic balcony renovation",
    "alt": "Classic Eixample renovation with balcony rhythm and refined finish.",
    "src": "/media/bcn-advisory/properties/l-02-eixample-classic-balcony-renovation.webp",
    "width": 1448,
    "height": 1086,
    "source": "5.png"
  },
  {
    "id": "properties.l03",
    "role": "property",
    "folder": "properties",
    "title": "Poblenou refined industrial premium",
    "alt": "Poblenou property image with refined industrial and premium material tone.",
    "src": "/media/bcn-advisory/properties/l-03-poblenou-refined-industrial-premium.webp",
    "width": 1448,
    "height": 1086,
    "source": "6.png"
  },
  {
    "id": "properties.l04",
    "role": "property",
    "folder": "properties",
    "title": "Diagonal Mar high floor sea hint",
    "alt": "Diagonal Mar property image with high-floor sea-light atmosphere.",
    "src": "/media/bcn-advisory/properties/l-04-diagonal-mar-high-floor-sea-hint.webp",
    "width": 1448,
    "height": 1086,
    "source": "7.png"
  },
  {
    "id": "properties.l05",
    "role": "property",
    "folder": "properties",
    "title": "Sarria family-ready quiet fit",
    "alt": "Sarria family property image with calm residential character.",
    "src": "/media/bcn-advisory/properties/l-05-sarria-family-ready-quiet-fit.webp",
    "width": 1448,
    "height": 1086,
    "source": "8.png"
  },
  {
    "id": "properties.l06",
    "role": "property",
    "folder": "properties",
    "title": "Barceloneta compact beach-side unit",
    "alt": "Compact Barceloneta beach-side property image.",
    "src": "/media/bcn-advisory/properties/l-06-barceloneta-compact-beach-side-unit.webp",
    "width": 1448,
    "height": 1086,
    "source": "9.png"
  },
  {
    "id": "properties.l07",
    "role": "property",
    "folder": "properties",
    "title": "El Born heritage detail refined",
    "alt": "El Born property image with refined heritage detail.",
    "src": "/media/bcn-advisory/properties/l-07-el-born-heritage-detail-refined.webp",
    "width": 1448,
    "height": 1086,
    "source": "10.png"
  },
  {
    "id": "properties.l08",
    "role": "property",
    "folder": "properties",
    "title": "Pedralbes villa calm interior",
    "alt": "Pedralbes property image with private villa calm.",
    "src": "/media/bcn-advisory/properties/l-08-pedralbes-villa-calm-interior.webp",
    "width": 1448,
    "height": 1086,
    "source": "11.png"
  },
  {
    "id": "properties.l09",
    "role": "property",
    "folder": "properties",
    "title": "Investment lens clean modern unit",
    "alt": "Clean modern Barcelona property image for investment lens review.",
    "src": "/media/bcn-advisory/properties/l-09-investment-lens-clean-modern-unit.webp",
    "width": 1448,
    "height": 1086,
    "source": "12.png"
  },
  {
    "id": "districts.eixample",
    "role": "district",
    "folder": "districts",
    "title": "Eixample structured urban rhythm",
    "alt": "Eixample district image with structured urban rhythm.",
    "src": "/media/bcn-advisory/districts/eixample-structured-urban-rhythm.webp",
    "width": 1448,
    "height": 1086,
    "source": "13.png"
  },
  {
    "id": "districts.gracia",
    "role": "district",
    "folder": "districts",
    "title": "Gracia human-scale design",
    "alt": "Gracia district image with human-scale streets and design character.",
    "src": "/media/bcn-advisory/districts/gracia-human-scale-design.webp",
    "width": 1536,
    "height": 1024,
    "source": "14.png"
  },
  {
    "id": "districts.sarria",
    "role": "district",
    "folder": "districts",
    "title": "Sarria family calm routes",
    "alt": "Sarria district image for family calm and residential routes.",
    "src": "/media/bcn-advisory/districts/sarria-family-calm-routes.webp",
    "width": 1536,
    "height": 1024,
    "source": "15.png"
  },
  {
    "id": "districts.poblenou",
    "role": "district",
    "folder": "districts",
    "title": "Poblenou modern creative coastal",
    "alt": "Poblenou district image with modern creative coastal-adjacent tone.",
    "src": "/media/bcn-advisory/districts/poblenou-modern-creative-coastal.webp",
    "width": 1536,
    "height": 1024,
    "source": "16.png"
  },
  {
    "id": "districts.diagonalMar",
    "role": "district",
    "folder": "districts",
    "title": "Diagonal Mar coastal terrace",
    "alt": "Diagonal Mar district image with coastal terrace logic.",
    "src": "/media/bcn-advisory/districts/diagonal-mar-coastal-terrace.webp",
    "width": 1536,
    "height": 1024,
    "source": "17.png"
  },
  {
    "id": "districts.barceloneta",
    "role": "district",
    "folder": "districts",
    "title": "Barceloneta compact sea proximity",
    "alt": "Barceloneta district image with compact sea proximity.",
    "src": "/media/bcn-advisory/districts/barceloneta-compact-sea-proximity.webp",
    "width": 1122,
    "height": 1402,
    "source": "18.png"
  },
  {
    "id": "districts.pedralbes",
    "role": "district",
    "folder": "districts",
    "title": "Pedralbes private villa calm",
    "alt": "Pedralbes district image with private villa calm.",
    "src": "/media/bcn-advisory/districts/pedralbes-private-villa-calm.webp",
    "width": 1122,
    "height": 1402,
    "source": "19.png"
  },
  {
    "id": "thresholds.familyCalm",
    "role": "threshold",
    "folder": "thresholds",
    "title": "Family calm threshold",
    "alt": "Buyer intent threshold image for family calm.",
    "src": "/media/bcn-advisory/thresholds/family-calm-threshold.webp",
    "width": 1122,
    "height": 1402,
    "source": "20.png"
  },
  {
    "id": "thresholds.seaLight",
    "role": "threshold",
    "folder": "thresholds",
    "title": "Sea light threshold",
    "alt": "Buyer intent threshold image for sea light and terrace logic.",
    "src": "/media/bcn-advisory/thresholds/sea-light-threshold.webp",
    "width": 1122,
    "height": 1402,
    "source": "21.png"
  },
  {
    "id": "thresholds.investmentLogic",
    "role": "threshold",
    "folder": "thresholds",
    "title": "Investment logic threshold",
    "alt": "Buyer intent threshold image for investment logic.",
    "src": "/media/bcn-advisory/thresholds/investment-logic-threshold.webp",
    "width": 1122,
    "height": 1402,
    "source": "22.png"
  },
  {
    "id": "thresholds.designRenovation",
    "role": "threshold",
    "folder": "thresholds",
    "title": "Design renovation threshold",
    "alt": "Buyer intent threshold image for design renovation.",
    "src": "/media/bcn-advisory/thresholds/design-renovation-threshold.webp",
    "width": 1122,
    "height": 1402,
    "source": "23.png"
  },
  {
    "id": "thresholds.privacy",
    "role": "threshold",
    "folder": "thresholds",
    "title": "Privacy threshold",
    "alt": "Buyer intent threshold image for privacy-led advisory.",
    "src": "/media/bcn-advisory/thresholds/privacy-threshold.webp",
    "width": 1122,
    "height": 1402,
    "source": "24.png"
  },
  {
    "id": "thresholds.walkableDailyLife",
    "role": "threshold",
    "folder": "thresholds",
    "title": "Walkable daily life threshold",
    "alt": "Buyer intent threshold image for walkable daily life.",
    "src": "/media/bcn-advisory/thresholds/walkable-daily-life-threshold.webp",
    "width": 1122,
    "height": 1402,
    "source": "25.png"
  },
  {
    "id": "dossier.privateShortlistCover",
    "role": "dossier",
    "folder": "dossier",
    "title": "Private shortlist cover",
    "alt": "Private Barcelona shortlist dossier cover image.",
    "src": "/media/bcn-advisory/dossier/private-shortlist-cover.webp",
    "width": 1122,
    "height": 1402,
    "source": "26.png"
  },
  {
    "id": "dossier.dueDiligenceFieldNote",
    "role": "dossier",
    "folder": "dossier",
    "title": "Due diligence field note",
    "alt": "Barcelona advisory due diligence field note image.",
    "src": "/media/bcn-advisory/dossier/due-diligence-field-note.webp",
    "width": 1672,
    "height": 941,
    "source": "27.png"
  },
  {
    "id": "dossier.acquisitionBriefTable",
    "role": "dossier",
    "folder": "dossier",
    "title": "Acquisition brief table",
    "alt": "Barcelona acquisition brief table for advisory dossier.",
    "src": "/media/bcn-advisory/dossier/acquisition-brief-table.webp",
    "width": 1672,
    "height": 941,
    "source": "28.png"
  },
  {
    "id": "materials.premiumStudy",
    "role": "materials",
    "folder": "materials",
    "title": "Premium materials study",
    "alt": "Premium materials study for Barcelona advisory visual system.",
    "src": "/media/bcn-advisory/materials/premium-materials-study.webp",
    "width": 1122,
    "height": 1402,
    "source": "29.png"
  },
  {
    "id": "materials.renovationDetail",
    "role": "materials",
    "folder": "materials",
    "title": "Renovation detail study",
    "alt": "Renovation detail study for Barcelona advisory decisions.",
    "src": "/media/bcn-advisory/materials/renovation-detail-study.webp",
    "width": 1536,
    "height": 1024,
    "source": "30.png"
  },
  {
    "id": "case.buyerResolution",
    "role": "case",
    "folder": "case",
    "title": "Buyer case resolution",
    "alt": "Buyer case resolution image for Barcelona advisory workflow.",
    "src": "/media/bcn-advisory/case/buyer-case-resolution.webp",
    "width": 1122,
    "height": 1402,
    "source": "31.png"
  },
  {
    "id": "lens.spatialField",
    "role": "lens",
    "folder": "lens",
    "title": "Barcelona Lens spatial field",
    "alt": "Barcelona Lens spatial field image for district advisory navigation.",
    "src": "/media/bcn-advisory/lens/barcelona-lens-spatial-field.webp",
    "width": 1672,
    "height": 941,
    "source": "Barcelona Lens Spatial Field.png"
  }
] as const satisfies readonly BcnMediaAsset[];

export const bcnMediaById = Object.fromEntries(
  bcnMediaAssets.map((asset) => [asset.id, asset]),
) as Record<(typeof bcnMediaAssets)[number]["id"], (typeof bcnMediaAssets)[number]>;

export function getBcnMedia(id: (typeof bcnMediaAssets)[number]["id"]) {
  return bcnMediaById[id];
}

export const bcnMedia = {
  hero: {
    main: getBcnMedia("hero.cityField"),
    cityField: getBcnMedia("hero.cityField"),
    interiorLight: getBcnMedia("hero.interiorLight"),
    terraceSea: getBcnMedia("hero.terraceSea"),
  },
  properties: {
    graciaDesignLightBedroom: getBcnMedia("properties.l01"),
    eixampleBalconyRenovation: getBcnMedia("properties.l02"),
    poblenouCoastalUrban: getBcnMedia("properties.l03"),
    diagonalMarSeaLight: getBcnMedia("properties.l04"),
    sarriaFamilyCalm: getBcnMedia("properties.l05"),
    barcelonetaCompactBeachSide: getBcnMedia("properties.l06"),
    elBornHeritageDetail: getBcnMedia("properties.l07"),
    pedralbesPrivateResidence: getBcnMedia("properties.l08"),
    investmentCleanModernUnit: getBcnMedia("properties.l09"),
    byListingId: {
      "l-01": getBcnMedia("properties.l01"),
      "l-02": getBcnMedia("properties.l02"),
      "l-03": getBcnMedia("properties.l03"),
      "l-04": getBcnMedia("properties.l04"),
      "l-05": getBcnMedia("properties.l05"),
      "l-06": getBcnMedia("properties.l06"),
      "l-07": getBcnMedia("properties.l07"),
      "l-08": getBcnMedia("properties.l08"),
      "l-09": getBcnMedia("properties.l09"),
    },
  },
  districts: {
    eixample: getBcnMedia("districts.eixample"),
    gracia: getBcnMedia("districts.gracia"),
    sarria: getBcnMedia("districts.sarria"),
    poblenou: getBcnMedia("districts.poblenou"),
    diagonalMar: getBcnMedia("districts.diagonalMar"),
    barceloneta: getBcnMedia("districts.barceloneta"),
    pedralbes: getBcnMedia("districts.pedralbes"),
  },
  thresholds: {
    familyCalm: getBcnMedia("thresholds.familyCalm"),
    seaLight: getBcnMedia("hero.terraceSea"),
    investmentLogic: getBcnMedia("hero.cityField"),
    designRenovation: getBcnMedia("properties.l03"),
    privacy: getBcnMedia("districts.eixample"),
    walkableDailyLife: getBcnMedia("properties.l07"),
    pedralbesExterior: getBcnMedia("districts.pedralbes"),
    pedralbesPrivateAccess: getBcnMedia("thresholds.privacy"),
  },
  dossier: {
    advisoryDossierDesk: getBcnMedia("dossier.privateShortlistCover"),
    acquisitionMemoDetail: getBcnMedia("dossier.dueDiligenceFieldNote"),
    acquisitionBriefTable: getBcnMedia("dossier.acquisitionBriefTable"),
  },
  lens: {
    spatialField: getBcnMedia("lens.spatialField"),
    districtLensDesk: getBcnMedia("dossier.acquisitionBriefTable"),
  },
  materials: {
    finalCtaLimestoneDetail: getBcnMedia("materials.premiumStudy"),
    porcelainShadow: getBcnMedia("materials.renovationDetail"),
    limestoneRailDetail: getBcnMedia("materials.renovationDetail"),
  },
  case: {
    buyerResolution: getBcnMedia("case.buyerResolution"),
  },
} as const;
