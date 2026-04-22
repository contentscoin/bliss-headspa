import type { MetadataRoute } from "next";

const SITE_URL = "https://medicalheadspa.kr";

/**
 * robots.txt generator (Next.js App Router convention)
 *
 * GEO policy: explicitly ALLOW all major AI crawlers so that the brand,
 * branch locations, services, and FAQ content can be cited by ChatGPT,
 * Claude, Perplexity, Google AI Overviews, Grok, and others.
 *
 * We only block the authenticated CMS/store consoles — customer-facing
 * content should be fully indexable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rule — open to standard search engines
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cms", "/cms/", "/store/login", "/buyer"],
      },
      // Explicit AI crawler allow-list (GEO)
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Googlebot-Image", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Yeti", allow: "/" }, // Naver
      { userAgent: "Daumoa", allow: "/" }, // Daum
      { userAgent: "cohere-ai", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
      { userAgent: "Amazonbot", allow: "/" },
      { userAgent: "DuckDuckBot", allow: "/" },
      { userAgent: "Meta-ExternalAgent", allow: "/" },
      { userAgent: "FacebookBot", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
