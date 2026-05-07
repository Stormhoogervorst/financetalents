import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL as BASE_URL } from "@/lib/site";
import {
  getRechtsgebiedSlug,
  RECHTSGEBIEDEN,
} from "@/lib/constants/rechtsgebieden";

const CITIES = [
  "amsterdam",
  "rotterdam",
  "utrecht",
  "den-haag",
  "eindhoven",
  "groningen",
  "tilburg",
  "breda",
  "nijmegen",
  "enschede",
  "arnhem",
  "den-bosch",
  "maastricht",
  "leiden",
] as const;

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/jobs", priority: 0.9, changeFrequency: "daily" },
  { path: "/internships", priority: 0.9, changeFrequency: "daily" },
  { path: "/companies", priority: 0.8, changeFrequency: "weekly" },
  { path: "/insights", priority: 0.7, changeFrequency: "weekly" },
  { path: "/for-employers", priority: 0.5, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const route of STATIC_ROUTES) {
    entries.push({
      url: `${BASE_URL}${route.path === "/" ? "" : route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    });
  }

  for (const city of CITIES) {
    entries.push(
      {
        url: `${BASE_URL}/jobs/${city}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/internships/${city}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      }
    );
  }

  for (const sector of RECHTSGEBIEDEN) {
    entries.push({
      url: `${BASE_URL}/jobs/${getRechtsgebiedSlug(sector)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("slug, updated_at")
    .eq("status", "active");

  for (const job of jobs ?? []) {
    entries.push({
      url: `${BASE_URL}/jobs/${job.slug}`,
      lastModified: job.updated_at ? new Date(job.updated_at) : now,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  const { data: firms } = await supabase
    .from("firms")
    .select("slug, created_at")
    .eq("is_published", true);

  for (const firm of firms ?? []) {
    entries.push({
      url: `${BASE_URL}/companies/${firm.slug}`,
      lastModified: firm.created_at ? new Date(firm.created_at) : now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  const { data: blogs } = await supabase
    .from("blogs")
    .select("slug, created_at")
    .eq("status", "published");

  for (const blog of blogs ?? []) {
    entries.push({
      url: `${BASE_URL}/insights/${blog.slug}`,
      lastModified: blog.created_at ? new Date(blog.created_at) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return entries;
}
