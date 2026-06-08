// src/lib/mapEmbed.ts
// Build a travelbytrees /embed URL from structured options. Pure + testable.
// The /embed route contract lives in the travel-by-trees repo
// (web/lib/embedConfig.ts): layers, controls, intensity, dismount, s/e, center, zoom.

export interface MapEmbedOptions {
  /** Origin of the embed app. Default: production. */
  base?: string;
  /** Locale segment. Default: "en". */
  locale?: string;
  /** Which on-map controls to expose. */
  controls?: "layers" | "slider" | "mini";
  /** Data layers visible on load, e.g. ["parks", "trees", "groenkaart"]. */
  layers?: string[];
  /** Greenness slider 0-100 (only meaningful with controls="slider"). */
  intensity?: number;
  /** Allow routing through bicycle=no park paths. */
  dismount?: boolean;
  /** Route start [lng, lat]. */
  start?: [number, number];
  /** Route end [lng, lat]. */
  end?: [number, number];
  /** Initial map center [lng, lat]. */
  center?: [number, number];
  /** Initial zoom. */
  zoom?: number;
}

const DEFAULT_BASE = "https://travelbytrees.eu";

export function buildEmbedUrl(opts: MapEmbedOptions = {}): string {
  const base = (opts.base ?? DEFAULT_BASE).replace(/\/+$/, "");
  const locale = opts.locale ?? "en";
  const p = new URLSearchParams();
  if (opts.controls) p.set("controls", opts.controls);
  if (opts.layers && opts.layers.length) p.set("layers", opts.layers.join(","));
  if (opts.intensity != null) p.set("intensity", String(opts.intensity));
  if (opts.dismount) p.set("dismount", "1");
  if (opts.start) p.set("s", `${opts.start[0]},${opts.start[1]}`);
  if (opts.end) p.set("e", `${opts.end[0]},${opts.end[1]}`);
  if (opts.center) p.set("center", `${opts.center[0]},${opts.center[1]}`);
  if (opts.zoom != null) p.set("zoom", String(opts.zoom));
  const qs = p.toString();
  return `${base}/${locale}/embed${qs ? `?${qs}` : ""}`;
}
