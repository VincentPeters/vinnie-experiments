# vinnie-experiments

Public space for experiments and a blog by Vincent Peters — Studio Vinnie.

Hands-on, demo-driven write-ups about data science, AI, IoT, web platforms, and the occasional cultural side-project.

- Portfolio: <https://vinnie.studio>
- Blog: _coming soon_

## Repo layout

```
.
├── docs/        ← private working notes (submodule, not publicly accessible)
├── .claude/     ← project-level Claude Code settings
└── README.md
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

## License

Content TBD. Code in this repo will be MIT unless otherwise noted in a subdirectory.
