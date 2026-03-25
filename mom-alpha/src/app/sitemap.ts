import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://mom.alphaspeedai.com",
      lastModified: "2026-03-25",
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
