import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const BUCKETS = ["A", "B", "C", "D", "E", "F", "meta"] as const;

// Display name for each bucket letter. Single source of truth; both
// the apparatus on post pages and the about-page bucket key consume this.
const BUCKET_LABELS: Record<(typeof BUCKETS)[number], string> = {
  A: "niche",
  B: "reuse",
  C: "classical ML",
  D: "methodology and statistics",
  E: "writing and reading",
  F: "cultural",
  meta: "meta",
};

// Recognized post-format tags. When a post's tag matches one of these,
// the apparatus links it to /about#format; topic tags stay as plain labels.
const FORMAT_TAGS = new Set([
  "build-along",
  "post-mortem",
  "paper-summary",
  "weeknote",
]);

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/posts",
    // Posts live in per-post folders: "YYYY-MM-DD-slug/index.md" (assets co-located).
    // The legacy flat form "YYYY-MM-DD-slug.md" is still accepted. URL uses just the slug.
    generateId: ({ entry }) => {
      const path = entry.replace(/\\/g, "/");
      const base = path
        .replace(/\/index\.(md|mdx)$/, "")
        .replace(/\.(md|mdx)$/, "");
      return base.replace(/^\d{4}-\d{2}-\d{2}-/, "");
    },
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1).max(120),
      slug: z.string().optional(),
      date: z.date(),
      updated: z.date().optional(),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      bucket: z.enum(BUCKETS),
      description: z.string().min(1).max(280),
      ogImage: image().optional(),
    }),
});

export const collections = { posts };
export { BUCKETS, BUCKET_LABELS, FORMAT_TAGS };
