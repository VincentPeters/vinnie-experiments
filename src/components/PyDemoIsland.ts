// src/components/PyDemoIsland.ts
// Browser-side orchestrator for <PyDemo> components on a page.
// One worker per page, shared by all demos. Lazy on viewport entry.

declare global {
  interface Window {
    Plotly?: {
      newPlot: (el: HTMLElement, data: unknown, layout?: unknown, config?: unknown) => Promise<void>;
      purge: (el: HTMLElement) => void;
    };
  }
}

type Output = { kind: "text" | "plotly" | "md" | "html" | "error"; payload: string };

let workerPromise: Promise<Worker> | null = null;
let nextId = 0;
const inflight = new Map<string, (msg: any) => void>();

function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = new Promise((resolve) => {
      const w = new Worker(
        new URL("./pyodide-worker.ts", import.meta.url),
        { type: "module" },
      );
      w.addEventListener("message", (ev: MessageEvent<any>) => {
        const handler = inflight.get(ev.data.id);
        if (handler) {
          inflight.delete(ev.data.id);
          handler(ev.data);
        }
      });
      resolve(w);
    });
  }
  return workerPromise;
}

function send(type: "init" | "setup" | "run", payload: any): Promise<any> {
  return getWorker().then(
    (w) =>
      new Promise((resolve, reject) => {
        const id = String(++nextId);
        inflight.set(id, (msg) => (msg.ok ? resolve(msg) : reject(new Error(msg.message))));
        w.postMessage({ id, type, ...payload });
      }),
  );
}

let plotlyPromise: Promise<typeof window.Plotly> | null = null;
async function ensurePlotly(): Promise<NonNullable<typeof window.Plotly>> {
  if (window.Plotly) return window.Plotly;
  if (!plotlyPromise) {
    plotlyPromise = import("plotly.js-basic-dist-min").then((mod) => {
      const Plotly = (mod as any).default ?? mod;
      window.Plotly = Plotly;
      return Plotly;
    });
  }
  return plotlyPromise as Promise<NonNullable<typeof window.Plotly>>;
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let t: number | undefined;
  return ((...args: any[]) => {
    if (t !== undefined) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  }) as T;
}

function readInputs(form: HTMLFormElement): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const el of form.elements) {
    const input = el as HTMLInputElement | HTMLSelectElement;
    if (!input.name) continue;
    if (input instanceof HTMLInputElement && input.type === "number") {
      data[input.name] = input.value === "" ? null : Number(input.value);
    } else if (input instanceof HTMLInputElement && input.type === "range") {
      data[input.name] = Number(input.value);
    } else if (input instanceof HTMLInputElement && input.type === "checkbox") {
      data[input.name] = input.checked;
    } else {
      data[input.name] = input.value;
    }
  }
  return data;
}

async function renderOutputs(target: HTMLElement, outputs: Output[]): Promise<void> {
  target.innerHTML = "";
  for (const out of outputs) {
    const el = document.createElement("div");
    if (out.kind === "text") {
      const pre = document.createElement("pre");
      pre.textContent = out.payload;
      el.appendChild(pre);
    } else if (out.kind === "html") {
      el.innerHTML = out.payload;
    } else if (out.kind === "md") {
      const p = document.createElement("p");
      p.textContent = out.payload;
      el.appendChild(p);
    } else if (out.kind === "plotly") {
      const Plotly = await ensurePlotly();
      const plot = document.createElement("div");
      plot.style.minHeight = "320px";
      el.appendChild(plot);
      target.appendChild(el);
      const fig = JSON.parse(out.payload);
      await Plotly.newPlot(plot, fig.data, fig.layout, { responsive: true, displayModeBar: false });
      continue;
    } else if (out.kind === "error") {
      const pre = document.createElement("pre");
      pre.style.color = "red";
      pre.textContent = out.payload;
      el.appendChild(pre);
    }
    target.appendChild(el);
  }
}

function attach(root: HTMLElement): void {
  const code = root.dataset.pydemoCode ?? "";
  const setup = root.dataset.pydemoSetup ?? "";
  const packages = JSON.parse(root.dataset.pydemoPackages ?? "[]") as string[];
  const form = root.querySelector<HTMLFormElement>("[data-pydemo-form]")!;
  const out = root.querySelector<HTMLElement>("[data-pydemo-out]")!;
  const btn = root.querySelector<HTMLButtonElement>("[data-pydemo-run]")!;
  const status = root.querySelector<HTMLElement>("[data-pydemo-status]")!;

  let initialized = false;

  const setStatus = (s: "idle" | "preheating" | "ready" | "running" | "error") => {
    status.dataset.state = s;
    btn.textContent =
      s === "preheating" ? "loading…" :
      s === "running"    ? "■ stop"   :
      s === "error"      ? "▶ run again" :
                           "▶ run";
    btn.disabled = s === "preheating" || s === "running";
  };

  const preheat = async () => {
    if (initialized) return;
    setStatus("preheating");
    try {
      await send("init", { packages });
      if (setup.trim().length > 0) await send("setup", { code: setup });
      initialized = true;
      setStatus("ready");
    } catch (err: any) {
      setStatus("error");
      out.innerHTML = `<pre style="color:red">${err.message}</pre>`;
    }
  };

  const run = async () => {
    if (!initialized) await preheat();
    if (!initialized) return;
    setStatus("running");
    try {
      const inputs = readInputs(form);
      const res = await send("run", { code, inputs });
      await renderOutputs(out, res.outputs as Output[]);
      setStatus("ready");
    } catch (err: any) {
      setStatus("error");
      out.innerHTML = `<pre style="color:red">${err.message}</pre>`;
    }
  };

  const debouncedRun = debounce(() => run(), 150);

  form.addEventListener("input", () => {
    if (initialized) debouncedRun();
  });
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    run();
  });

  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          preheat();
          obs.disconnect();
        }
      }
    },
    { rootMargin: "200px" },
  );
  obs.observe(root);
  setStatus("idle");
}

document.querySelectorAll<HTMLElement>("[data-pydemo]").forEach(attach);
