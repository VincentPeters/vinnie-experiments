# vinnie-experiments

Public space for experiments and a blog by Vincent Peters — Studio Vinnie.

Hands-on, demo-driven write-ups about data science, AI, IoT, web platforms, and the occasional cultural side-project.

- Portfolio: <https://vinnie.studio>
- Blog: <https://blog.vinnie.studio>

## Repo layout

```
.
├── public/         ← static assets (fonts, favicon, OG image)
├── src/
│   ├── components/ ← Layout, PostList (PyDemo arrives in Slice 2)
│   ├── content/    ← markdown posts under posts/
│   ├── lib/        ← site metadata, build-context helper
│   ├── pages/      ← routes: home, about, posts/[...slug], rss.xml
│   └── styles/     ← global.css with OKLCH tokens
├── .github/        ← deploy workflow
├── docs/           ← private working notes (submodule, not publicly accessible)
├── .claude/        ← project-level Claude Code settings
└── astro.config.mjs
```

The `docs/` folder is a git submodule pointing to a private repository. Cloning this repo without access to the private one will leave `docs/` empty — that is intentional.

## Clone

```sh
git clone https://github.com/VincentPeters/vinnie-experiments.git
```

If you have access to the private docs repo, also run:

```sh
git submodule update --init --recursive
```

## Stack

Astro 6 (static output) + MDX, deployed on Cloudflare Pages. JetBrains Mono self-hosted. Brutalist-minimal CSS in OKLCH. Pyodide-powered interactive demos arrive in Slice 2 of the [implementation plan](https://github.com/VincentPeters/vinnie-experiments) (private docs).

## Develop locally

```sh
pnpm install
pnpm astro dev
```

Posts live in `src/content/posts/YYYY-MM-DD-slug.md`. Set `draft: true` in frontmatter to keep a post out of the production build (it stays visible on `draft/*` branch previews).

## License

Content TBD. Code in this repo will be MIT unless otherwise noted in a subdirectory.
