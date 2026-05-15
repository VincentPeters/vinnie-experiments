// src/lib/site.ts
export const SITE = {
  title: "vinnie-experiments",
  subtitle:
    "a public lab notebook: question, data, procedure, metric, result, limits.",
  description:
    "Hands-on, demo-driven write-ups about data science, AI, IoT, web platforms, and the occasional cultural side-project.",
  author: "Vincent Peters",
  url: "https://blog.vinnie.studio",
  github: "https://github.com/VincentPeters/vinnie-experiments",
  portfolio: "https://vinnie.studio",
  locale: "en",
  buildDate: new Date().toISOString().slice(0, 10),
} as const;

export const NAV: ReadonlyArray<{ label: string; href: string }> = [
  { label: "posts", href: "/" },
  { label: "about", href: "/about" },
  { label: "rss", href: "/rss.xml" },
  { label: "github", href: SITE.github },
];

/**
 * Feature flags. Flip to hide/show optional UI without ripping out the code.
 */
export const FLAGS = {
  /** Show the bucket filter bar on the homepage. */
  showBucketFilter: false,
} as const;
