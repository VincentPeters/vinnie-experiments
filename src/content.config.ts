import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const BUCKETS = ["A", "B", "C", "D", "E", "F", "meta"] as const;

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/posts",
    // Filename is "YYYY-MM-DD-slug.md" for ls sortability; URL uses just the slug.
    generateId: ({ entry }) => entry.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.(md|mdx)$/, ""),
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
export { BUCKETS };
