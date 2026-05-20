const publicSiteUrl = import.meta.env.PUBLIC_SITE_URL;
const fallbackSiteUrl = "http://localhost:4321";

export const SITE_URL =
  (publicSiteUrl || fallbackSiteUrl).replace(/\/$/, "");

export const SITE_URL_IS_CONFIGURED = Boolean(publicSiteUrl);

export const SITE_NAME =
  import.meta.env.PUBLIC_SITE_NAME || "Barcelona Private Advisory";

export const SITE_DESCRIPTION =
  import.meta.env.PUBLIC_SITE_DESCRIPTION ||
  "Barcelona-first private property advisory - curated shortlist, due diligence and viewing-path decisions.";

export const OG_IMAGE =
  import.meta.env.PUBLIC_OG_IMAGE || "/og/barcelona-private-advisory-og.png";

export const INDEXABLE =
  (import.meta.env.PUBLIC_INDEXABLE || "true").toLowerCase() === "true";
