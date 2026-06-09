// src/components/MapEmbedIsland.ts
// Click-to-load the travelbytrees map iframe. The poster (a real map image) is
// the always-visible default; the button upgrades to the live interactive embed
// on demand. Click-to-load, not autoload: the embed is a cross-origin iframe
// whose `load` event fires even when the frame is blocked or 404s, so there is
// no reliable cross-origin success signal to gate an automatic reveal on. The
// poster plus the caption's "open full map" link cover the case where the
// backend is unavailable.

function mount(root: HTMLElement): void {
  const src = root.dataset.embedSrc;
  const frame = root.querySelector<HTMLElement>("[data-map-embed-frame]");
  const poster = root.querySelector<HTMLElement>("[data-map-embed-poster]");
  const btn = root.querySelector<HTMLButtonElement>("[data-map-embed-load]");
  if (!src || !frame || !btn) return;

  const idle = "load interactive map";
  let loading = false;

  btn.addEventListener("click", () => {
    if (loading) return;
    loading = true;
    btn.textContent = "loading the map…";
    btn.disabled = true;

    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = root.dataset.embedTitle ?? "Interactive map";
    iframe.loading = "eager";
    iframe.style.cssText =
      "width:100%;height:100%;border:0;opacity:0;transition:opacity .35s ease";
    frame.appendChild(iframe);

    let settled = false;
    iframe.addEventListener("load", () => {
      if (settled) return;
      settled = true;
      iframe.style.opacity = "1";
      poster?.setAttribute("hidden", "");
      btn.hidden = true;
    });

    // If the frame never loads at all, restore the button so the reader can
    // retry, and drop the dead iframe so the poster stays visible.
    window.setTimeout(() => {
      if (settled) return;
      iframe.remove();
      btn.disabled = false;
      btn.textContent = idle;
      loading = false;
    }, 12000);
  });
}

document
  .querySelectorAll<HTMLElement>("[data-map-embed]")
  .forEach((el) => mount(el));
