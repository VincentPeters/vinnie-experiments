// src/components/MapEmbedIsland.ts
// Lazy-load the travelbytrees map iframe when an embed scrolls into view.
// Mirrors PyDemoIsland's IntersectionObserver approach so text pages stay
// zero-JS except where an interactive map actually appears. The poster (a
// looping webm or a placeholder) covers the load gap and stays beneath the
// iframe as a fallback if the embed never paints (e.g. backend offline).

function mount(root: HTMLElement): void {
  const src = root.dataset.embedSrc;
  const frame = root.querySelector<HTMLElement>("[data-map-embed-frame]");
  const poster = root.querySelector<HTMLElement>("[data-map-embed-poster]");
  if (!src || !frame) return;

  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.loading = "lazy";
    iframe.title = root.dataset.embedTitle ?? "Interactive map";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";
    // Once the embed paints, drop the poster. If it errors we keep the poster
    // visible underneath so the reader still sees something meaningful.
    iframe.addEventListener("load", () => poster?.setAttribute("hidden", ""));
    frame.appendChild(iframe);
  };

  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          load();
          obs.disconnect();
        }
      }
    },
    { rootMargin: "200px" },
  );
  obs.observe(root);
}

document
  .querySelectorAll<HTMLElement>("[data-map-embed]")
  .forEach((el) => mount(el));
