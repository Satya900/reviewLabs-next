// app/sitemap.ts
import { MetadataRoute } from "next";
import { loadChallenges } from "@/lib/challenges/loader";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reviewlabs.space";
  
  const challenges = loadChallenges();
  const challengeUrls = challenges.map((c) => ({
    url: `${baseUrl}/challenges/${c.slug}`,
    lastModified: new Date(c.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const mainUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/challenges`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mock-interview`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/rewards`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  return [...mainUrls, ...challengeUrls];
}
