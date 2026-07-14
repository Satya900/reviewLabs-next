// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reviewlabs.space";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/mock-interview/play", "/mock-interview/results/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
