// src/pages/rss.xml.ts
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "../lib/site";
import { isProduction } from "../lib/build-context";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = await getCollection("posts", ({ data }) => {
    if (!data.draft) return true;
    return !isProduction();
  });
  const sorted = posts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    stylesheet: "/rss-styles.xsl",
    customData: `<language>${SITE.locale}</language>`,
    items: sorted.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/posts/${post.data.slug ?? post.id}/`,
      categories: [post.data.bucket, ...post.data.tags],
    })),
  });
}
