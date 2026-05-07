// src/components/pyodide-worker.ts
import stdlibSource from "./pydemo-stdlib.py?raw";

type InitMsg = { id: string; type: "init"; packages: string[] };
type SetupMsg = { id: string; type: "setup"; code: string };
type RunMsg = { id: string; type: "run"; code: string; inputs: Record<string, unknown> };
type Msg = InitMsg | SetupMsg | RunMsg;

type Output = { kind: "text" | "plotly" | "md" | "html" | "error"; payload: string };

let pyodide: any = null;
let pendingPackages = new Set<string>();
let installedPackages = new Set<string>();

// Pyodide is served from jsdelivr's CDN. Bump the version segment when
// upgrading the pyodide npm dep so the runtime and wheels stay in sync.
const pyodideIndexURL = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";

async function init(packages: string[]): Promise<void> {
  if (!pyodide) {
    // Module worker: dynamic import of the ESM build, not importScripts.
    const pyodideModule: any = await import(
      /* @vite-ignore */ `${pyodideIndexURL}pyodide.mjs`
    );
    pyodide = await pyodideModule.loadPyodide({ indexURL: pyodideIndexURL });
  }
  for (const p of packages) pendingPackages.add(p);
  const toInstall = [...pendingPackages].filter((p) => !installedPackages.has(p));
  if (toInstall.length > 0) {
    await pyodide.loadPackage(toInstall);
    for (const p of toInstall) installedPackages.add(p);
    pendingPackages.clear();
  }
  pyodide.runPython(stdlibSource);
}

async function setup(code: string): Promise<void> {
  if (!pyodide) throw new Error("setup before init");
  pyodide.runPython(code);
}

async function run(code: string, inputs: Record<string, unknown>): Promise<Output[]> {
  if (!pyodide) throw new Error("run before init");
  pyodide.runPython("_reset_outputs()");
  for (const [k, v] of Object.entries(inputs)) {
    pyodide.globals.set(k, v);
  }
  const stdoutChunks: string[] = [];
  pyodide.setStdout({ batched: (s: string) => stdoutChunks.push(s) });
  try {
    pyodide.runPython(code);
  } finally {
    pyodide.setStdout({});
  }
  const drained = pyodide
    .runPython("_drain_outputs()")
    .toJs({ dict_converter: Object.fromEntries });
  const outs: Output[] = drained.map((d: any) => ({ kind: d.kind, payload: d.payload }));
  if (stdoutChunks.length > 0) {
    outs.unshift({ kind: "text", payload: stdoutChunks.join("") });
  }
  return outs;
}

self.addEventListener("message", async (ev: MessageEvent<Msg>) => {
  const msg = ev.data;
  try {
    if (msg.type === "init") {
      await init(msg.packages);
      (self as any).postMessage({ id: msg.id, ok: true, type: "ready" });
    } else if (msg.type === "setup") {
      await setup(msg.code);
      (self as any).postMessage({ id: msg.id, ok: true, type: "setup-ok" });
    } else if (msg.type === "run") {
      const outputs = await run(msg.code, msg.inputs);
      (self as any).postMessage({ id: msg.id, ok: true, type: "outputs", outputs });
    }
  } catch (err: any) {
    (self as any).postMessage({
      id: msg.id,
      ok: false,
      type: "error",
      message: err?.message ?? String(err),
      stack: err?.stack ?? null,
    });
  }
});
