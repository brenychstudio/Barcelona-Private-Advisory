export const prerender = true;

import { SITE_URL, SITE_URL_IS_CONFIGURED, INDEXABLE } from "../config/site";

export function GET() {
  const lines = [
    "User-agent: *",
    INDEXABLE ? "Allow: /" : "Disallow: /",
    SITE_URL_IS_CONFIGURED
      ? `Sitemap: ${SITE_URL}/sitemap-index.xml`
      : "# TODO: set PUBLIC_SITE_URL before final publish to expose the absolute sitemap URL.",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
