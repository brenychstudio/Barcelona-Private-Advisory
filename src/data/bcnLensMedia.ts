export type BcnLensMediaAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const bcnLensMedia = {
  base: {
    spatial: {
      src: "/media/bcn-advisory/lens/base/lens-spatial-base.webp",
      alt: "Abstract Barcelona district field for private property intelligence.",
      width: 1672,
      height: 941,
    },
    spatialAlt: {
      src: "/media/bcn-advisory/lens/base/lens-spatial-base-alt.webp",
      alt: "Elevated Barcelona city field for district lens analysis.",
      width: 1122,
      height: 1402,
    },
  },

  districts: {
    sarria: {
      src: "/media/bcn-advisory/lens/districts/sarria.webp",
      alt: "Sarria residential street atmosphere for family calm advisory.",
      width: 1448,
      height: 1086,
    },
    gracia: {
      src: "/media/bcn-advisory/lens/districts/gracia.webp",
      alt: "Gracia walkable street character for daily-life district fit.",
      width: 1122,
      height: 1402,
    },
    eixample: {
      src: "/media/bcn-advisory/lens/districts/eixample.webp",
      alt: "Eixample architectural order and central Barcelona rhythm.",
      width: 1536,
      height: 1024,
    },
    poblenou: {
      src: "/media/bcn-advisory/lens/districts/poblenou.webp",
      alt: "Poblenou contemporary coastal district view.",
      width: 1448,
      height: 1086,
    },
    diagonalMar: {
      src: "/media/bcn-advisory/lens/districts/diagonal-mar.webp",
      alt: "Diagonal Mar sea-light district with coastal exposure.",
      width: 1448,
      height: 1086,
    },
    pedralbes: {
      src: "/media/bcn-advisory/lens/districts/pedralbes.webp",
      alt: "Pedralbes private residential scale and calm access.",
      width: 1448,
      height: 1086,
    },
  },

  properties: {
    familyCalm: {
      src: "/media/bcn-advisory/lens/properties/family-calm.webp",
      alt: "Family calm Barcelona property interior with soft daily light.",
      width: 1536,
      height: 1024,
    },
    seaLight: {
      src: "/media/bcn-advisory/lens/properties/sea-light.webp",
      alt: "Sea-light Barcelona property with terrace and Mediterranean view.",
      width: 1536,
      height: 1024,
    },
    investmentLogic: {
      src: "/media/bcn-advisory/lens/properties/investment-logic.webp",
      alt: "Classic Barcelona interior for investment and renovation logic.",
      width: 1122,
      height: 1402,
    },
    designRenovation: {
      src: "/media/bcn-advisory/lens/properties/design-renovation.webp",
      alt: "Refined renovation property interior with heritage proportions.",
      width: 1122,
      height: 1402,
    },
    privacy: {
      src: "/media/bcn-advisory/lens/properties/privacy.webp",
      alt: "Private residential threshold for quiet Barcelona property selection.",
      width: 1122,
      height: 1402,
    },
    walkableDailyLife: {
      src: "/media/bcn-advisory/lens/properties/walkable-daily-life.webp",
      alt: "Walkable daily-life Barcelona property interior with calm material detail.",
      width: 1122,
      height: 1402,
    },
  },

  signals: {
    seaLightPlane: {
      src: "/media/bcn-advisory/lens/signals/sea-light-plane.webp",
      alt: "Sea-light signal plane for Barcelona property advisory.",
      width: 1122,
      height: 1402,
    },
    walkableDailyLifePlane: {
      src: "/media/bcn-advisory/lens/signals/walkable-daily-life-plane.webp",
      alt: "Walkable daily-life street plane for Barcelona advisory.",
      width: 1122,
      height: 1402,
    },
    privacyThreshold: {
      src: "/media/bcn-advisory/lens/signals/privacy-threshold.webp",
      alt: "Privacy threshold plane for private Barcelona property access.",
      width: 1122,
      height: 1402,
    },
  },

  materials: {
    porcelain: {
      src: "/media/bcn-advisory/lens/materials/porcelain-material-plane.webp",
      alt: "Porcelain material plane for calm advisory handoff.",
      width: 1122,
      height: 1402,
    },
    limestone: {
      src: "/media/bcn-advisory/lens/materials/limestone-light-plane.webp",
      alt: "Limestone light plane for Barcelona advisory material detail.",
      width: 1122,
      height: 1402,
    },
    handoff: {
      src: "/media/bcn-advisory/lens/materials/advisory-handoff.webp",
      alt: "Advisory handoff visual with refined Mediterranean material calm.",
      width: 1122,
      height: 1402,
    },
  },
} as const;

export type BcnLensMedia = typeof bcnLensMedia;
