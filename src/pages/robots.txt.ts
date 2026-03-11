export const prerender = true;

export function GET() {
  const site = (import.meta.env.PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");
  const indexable = (import.meta.env.PUBLIC_INDEXABLE || "false").toLowerCase() === "true";

  const lines = [
    "User-agent: *",
    indexable ? "Allow: /" : "Disallow: /",
    `Sitemap: ${site}/sitemap-index.xml`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}