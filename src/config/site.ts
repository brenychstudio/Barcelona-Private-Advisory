export const SITE_URL =
  import.meta.env.PUBLIC_SITE_URL || "https://example.com";

export const SITE_NAME =
  import.meta.env.PUBLIC_SITE_NAME || "Barcelona Private Advisory";

export const SITE_DESCRIPTION =
  import.meta.env.PUBLIC_SITE_DESCRIPTION ||
  "Barcelona-first private property advisory — curated shortlist, due diligence, negotiation support.";

export const OG_IMAGE =
  import.meta.env.PUBLIC_OG_IMAGE || "/og/og-01.png";

export const INDEXABLE =
  (import.meta.env.PUBLIC_INDEXABLE || "false").toLowerCase() === "true";