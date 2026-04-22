import type { MetadataRoute } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const SITE_URL = "https://medicalheadspa.kr";

/**
 * Dynamic sitemap (Next.js App Router convention)
 *
 * Lists every public, indexable customer-facing URL so that both
 * traditional search engines and AI crawlers can discover all branches
 * and deep-link the correct reservation pages into their answers.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static customer-facing routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/lookup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic: one entry per active branch reservation page
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return staticRoutes;

  try {
    const client = new ConvexHttpClient(convexUrl);
    const branches = await client.query(api.branches.list, { activeOnly: true });
    const branchRoutes: MetadataRoute.Sitemap = (branches ?? []).map(
      (b: { _id: string; _creationTime: number }) => ({
        url: `${SITE_URL}/reserve/${b._id}`,
        lastModified: new Date(b._creationTime),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      })
    );
    return [...staticRoutes, ...branchRoutes];
  } catch {
    // If Convex is unreachable at build time, ship the static sitemap only
    return staticRoutes;
  }
}
