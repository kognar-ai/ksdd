# KSDD — Kognar Spec-Driven Design & Development

A slash command system for **Claude Code**, **[OpenAI Codex](https://developers.openai.com/codex)**, **[opencode](https://opencode.ai)** and **[Google Antigravity](https://antigravity.google)** that guides products from **raw brainstorm to an implementable design system**, in four stages with mandatory human approval between each one — plus feature-level workflows for breaking specs into tasks and shipping code through quality gates and PRs.

## Codex, opencode and Google Antigravity (CLI / IDE)

After `ksdd install --codex` (or `KSDD_WITH_CODEX=1` on `npm install`), `ksdd install --opencode` (or `KSDD_WITH_OPENCODE=1`) and/or `ksdd install --antigravity` (or `KSDD_WITH_ANTIGRAVITY=1`):

| Claude Code | Codex (prompts in `~/.codex/prompts/`) | opencode (`~/.config/opencode/`) | Antigravity (`~/.gemini/commands/ksdd/`) |
|-------------|----------------------------------------|----------------------------------|------------------------------------------|
| `/ksdd:start` | `/prompts:ksdd-start` | `/ksdd-start` | `/ksdd:start` |
| `/ksdd:spec` | `/prompts:ksdd-spec` | `/ksdd-spec` | `/ksdd:spec` |
| `/ksdd:tech` | `/prompts:ksdd-tech` | `/ksdd-tech` | `/ksdd:tech` |
| `/ksdd:design` | `/prompts:ksdd-design` | `/ksdd-design` | `/ksdd:design` |
| `/ksdd:new:feature` | `/prompts:ksdd-new-feature` | `/ksdd-new-feature` | `/ksdd:new:feature` |
| `/ksdd:build:feature` | `/prompts:ksdd-build-feature` | `/ksdd-build-feature` | `/ksdd:build:feature` |
| `/ksdd:build:all` | `/prompts:ksdd-build-all` | `/ksdd-build-all` | `/ksdd:build:all` |
| `/ksdd:setup` | `/prompts:ksdd-setup` | `/ksdd-setup` | `/ksdd:setup` |
| `/ksdd:archive` | `/prompts:ksdd-archive` | `/ksdd-archive` | `/ksdd:archive` |

The `ksdd` skill is also installed in `~/.agents/skills/ksdd/` (references + agents + `SKILL.md`) for Codex — use `$ksdd` or mention the skill in your prompt. Codex prompts are the same content as the files in `commands/`; [custom prompts](https://developers.openai.com/codex/custom-prompts) are flagged as *deprecated* in favor of skills, but still work for explicit `/prompts:…` invocation.

For opencode the same content is distributed as commands in `~/.config/opencode/commands/ksdd-*.md` plus a bundle in `~/.config/opencode/ksdd/` (references, agents, and `AGENTS.md` adapted from `references/opencode-AGENTS.md`).

For Google Antigravity the 9 commands are registered as native **TOML commands** in `~/.gemini/commands/ksdd/` (the same folder Antigravity CLI/TUI and IDE read — shared with `gemini-cli`), each pulling its body from a bundle in `~/.gemini/ksdd/` via an `@$HOME/...` include. Nested subdirs reproduce the Claude invocation (`commands/ksdd/new/feature.toml` → `/ksdd:new:feature`). This mirrors how [GSD](https://github.com/open-gsd/gsd-core) registers `~/.gemini/commands/gsd/*.toml`.

Restart your agent after installing. `CODEX_HOME` (default `~/.codex`) changes the Codex prompts folder; `OPENCODE_HOME` (default `~/.config/opencode`) changes the opencode base folder; `ANTIGRAVITY_HOME` (default `~/.gemini`) changes the Gemini/Antigravity base folder.

```
/ksdd:start          →  .ksdd/specs/brainstorm.md         (raw idea → refined concept)
/ksdd:spec           →  .ksdd/specs/SPEC.md               (concept → product + design spec)
/ksdd:tech           →  .ksdd/specs/architecture.md       (spec → technical architecture)
/ksdd:design         →  .ksdd/specs/DESIGN.md             (spec → Stitch-compatible design system)
/ksdd:new:feature    →  .ksdd/features/FEATURE-[slug].md  (new feature → spec + implementable tasks)
/ksdd:build:feature  →  task by task                       (feature → implementation with issue, branch, PR)
/ksdd:build:all      →  .ksdd/build/BUILD-PLAN.md         (entire SPEC → features + tasks + full implementation)
/ksdd:setup          →  .ksdd/specs/{brainstorm,SPEC,architecture,DESIGN}.md  (existing project → reverse-engineered artifacts)
/ksdd:archive        →  .ksdd/archive/{ARCHIVE.md, raw/[slug]/}  (delivered features → cronological summary + raw preservation)
```

### Archiving delivered features

Once a feature is shipped (all tasks `concluída` or `cancelada`), use `/ksdd:archive` to move it out of the active workspace and into a cronological log:

```
/ksdd:archive [slug]                   # archive one
/ksdd:archive slug-a slug-b slug-c     # archive a batch
/ksdd:archive --all-eligible           # archive every feature that passes elegibility
/ksdd:archive --restore [slug]         # bring a feature back from the archive
/ksdd:archive [slug] --dry-run         # preview without applying changes (combinable)
```

`.ksdd/archive/` is created on demand. `ARCHIVE.md` is a cronological index (latest at the top); `raw/[slug]/` preserves the original `FEATURE-[slug].md` + tasks for audit or restore. All other commands (`new:feature`, `build:feature`, `build:all`) detect archived slugs and refuse to overwrite them — restore is always explicit.

> **Migrating from v0.5.x?** Starting in v0.6.0, KSDD uses the `.ksdd/` layout instead of scattering artifacts across the project root and `docs/`. Legacy projects keep working — each command reads from the old path if the new one doesn't exist and shows how to migrate via `git mv`. See [CHANGELOG](CHANGELOG.md#060---2026-05-19) for details.

## Philosophy

Inspired by the **SPEC Development model** with mandatory approval checkpoints. Each command reads the previous output, asks structured questions to fill gaps, generates the artifact in canonical format, and **stops before advancing** to the next one. The human validates, adjusts, and only then runs the next command.

Artifacts are cumulative: `SPEC.md` references `brainstorm.md`; `architecture.md` and `DESIGN.md` reference both. Each document is a "contract" the next one respects.

## Installation

### npm (recommended)

```bash
npm install -g @kognar/ksdd
```

By default this installs only **Claude Code** (`~/.claude/`). To also install **Codex**, **opencode** and/or **Google Antigravity**:

```bash
ksdd install --codex                            # Claude + Codex
ksdd install --opencode                         # Claude + opencode
ksdd install --antigravity                      # Claude + Google Antigravity
ksdd install --codex --opencode --antigravity   # Claude + Codex + opencode + Antigravity (4 targets)
```

Or in an npm install:

```bash
KSDD_WITH_CODEX=1 npm install -g @kognar/ksdd
KSDD_WITH_OPENCODE=1 npm install -g @kognar/ksdd
KSDD_WITH_ANTIGRAVITY=1 npm install -g @kognar/ksdd
KSDD_WITH_CODEX=1 KSDD_WITH_OPENCODE=1 KSDD_WITH_ANTIGRAVITY=1 npm install -g @kognar/ksdd
```

CLI commands:

```bash
ksdd install                      # reinstalls / updates (Claude Code only)
ksdd install --codex              # Claude + Codex (prompts + skill)
ksdd install --opencode           # Claude + opencode (commands + bundle)
ksdd install --antigravity        # Claude + Antigravity (TOML commands em ~/.gemini/commands/ksdd/ + bundle)
ksdd status                       # shows installation state
ksdd uninstall                    # removes copied files (all targets)
```

To uninstall everything:

```bash
npm uninstall -g @kognar/ksdd
```

### Manual (Claude Code)

Place the `ksdd/` folder in `~/.claude/skills/ksdd/` or at the project root in `.claude/skills/ksdd/`.

Commands live in `ksdd/commands/`. Claude Code discovers slash commands with the `/ksdd:*` prefix when the files are in `~/.claude/commands/` with the `ksdd:` prefix.

## Typical usage flow

```
You    : /ksdd:start
         "I want to build a retro games marketplace with prices crawled from livestreams"
Claude : [asks 5-8 structured questions about scope, audience, differentiator]
         [generates .ksdd/specs/brainstorm.md with refined concept]
         [STOPS — requests approval]

You    : "looks great, tweak the audience to include shop owners too"
Claude : [edits .ksdd/specs/brainstorm.md]
         [STOPS again]

You    : /ksdd:spec
Claude : [reads .ksdd/specs/brainstorm.md]
         [asks about personas, critical flows, business model]
         [generates .ksdd/specs/SPEC.md covering product + design]
         [STOPS]

You    : /ksdd:tech     # optional, can skip straight to /ksdd:design
Claude : [reads .ksdd/specs/SPEC.md]
         [generates .ksdd/specs/architecture.md with stack, data model, integrations]
         [STOPS]

You    : /ksdd:design
Claude : [reads .ksdd/specs/SPEC.md (+ .ksdd/specs/architecture.md if it exists)]
         [generates .ksdd/specs/DESIGN.md in Google Stitch format — YAML tokens + 8 sections]
         [STOPS]

You    : /ksdd:new:feature push notifications
Claude : [reads .ksdd/specs/{SPEC,architecture,DESIGN}.md]
         [asks about scope, affected personas, priority]
         [generates .ksdd/features/FEATURE-push-notifications.md with impact on screens, data, API and design]
         [STOPS]

You    : /ksdd:build:feature push-notifications
Claude : [reads .ksdd/features/FEATURE-push-notifications.md + tasks + all artifacts]
         [per task: issue → branch → context.md → implement → quality gates → PR]
         [STOPS — checkpoint per feature]

--- OR, to build the entire project: ---

You    : /ksdd:build:all
Claude : [reads .ksdd/specs/{SPEC,architecture,DESIGN}.md]
         [decomposes delivery phases into features]
         [breaks each feature into implementable tasks]
         [generates .ksdd/build/BUILD-PLAN.md with the full plan]
         [STOPS — requests plan approval]

You    : "approved"
Claude : [implements feature by feature, task by task]
         [issue → branch → context.md → code → quality gates → PR]
         [STOPS — checkpoint per feature and per phase]
         [validates SPEC criteria at the end]

--- For existing projects (reverse-engineering): ---

You    : /ksdd:setup
Claude : [pre-flight: detects KSDD artifacts in .ksdd/ or legacy locations]
         [Phase 1: discovery of structure, git history, manifests in parallel]
         [Phase 2: 4 parallel agents analyze product, stack, code, git]
         [Phase 3: synthesizes findings, asks only about real gaps (max 6 questions)]
         [Phase 4: generates .ksdd/specs/{brainstorm,SPEC,architecture,DESIGN}.md with reverse-engineered header]
         [STOPS — review checklist with priority]
```

## System structure

```
ksdd/
├── README.md                          ← this file
├── bin/
│   └── ksdd.js                        ← CLI installer (zero runtime deps)
├── commands/
│   ├── start.md                       ← /ksdd:start
│   ├── spec.md                        ← /ksdd:spec
│   ├── tech.md                        ← /ksdd:tech
│   ├── design.md                      ← /ksdd:design
│   ├── new:feature.md                 ← /ksdd:new:feature
│   ├── build:feature.md               ← /ksdd:build:feature
│   ├── build:all.md                   ← /ksdd:build:all
│   └── setup.md                       ← /ksdd:setup
├── references/
│   ├── brainstorm-template.md         ← template for brainstorm.md
│   ├── spec-template.md               ← template for SPEC.md
│   ├── architecture-template.md       ← template for architecture.md
│   ├── feature-template.md            ← template for .ksdd/features/FEATURE-[slug].md
│   ├── build-plan-template.md         ← task frontmatter format (build:feature / build:all)
│   ├── codex-SKILL.md                 ← body of the Codex skill (~/.agents/skills/ksdd/SKILL.md)
│   ├── design-md-spec.md              ← Google Stitch DESIGN.md specification
│   ├── personas-guide.md              ← how to build useful personas
│   └── approval-gates.md              ← checkpoint rules
└── agents/
    ├── interviewer.md                 ← agent that asks structured questions
    ├── consolidator.md                ← agent that synthesizes responses into the artifact
    ├── critic.md                      ← agent that reviews the artifact before delivery
    └── setup-analyst.md               ← agent for reverse-engineering (4 parallel variants)
```

KSDD is **distributed content, not runtime**. The `ksdd` CLI exists only to copy these markdown files into the conventional folders that Claude Code and Codex read. There are no runtime dependencies — `bin/ksdd.js` uses Node built-ins only (`fs`, `path`, `os`).

## Principles

1. **Mandatory approval** between each stage. Never run `/ksdd:spec` without `.ksdd/specs/brainstorm.md` approved. Never run `/ksdd:design` without `.ksdd/specs/SPEC.md` approved.
2. **Batch questions**, not one by one. Each command asks everything it needs in one round (max 8 questions), preferably using `ask_user_input_v0` when available.
3. **Flexible language**. Commands are maintained in Portuguese, but artifacts, questions, and checkpoints follow the **conversation language** (or an explicit `$ARGUMENTS` locale). See `references/language-policy.md` — pt-BR is not the implicit default.
4. **Canonical format**. `DESIGN.md` follows the Google Stitch spec 100%. `SPEC.md` has a fixed structure. `brainstorm.md` is freer but with mandatory sections.
5. **Artifact reuse**. If the user already has a `brainstorm.md` or `SPEC.md` drafted, commands read and iterate on top of it rather than starting from scratch.
6. **Backward-compatible reads (v0.6.0+).** Commands read artifacts from the new `.ksdd/` layout first and fall back to legacy paths (project root and `docs/`). Legacy projects keep working without forced migration.

## Skills and tools used

The commands leverage native Claude Code tools and may invoke auxiliary skills:

| Tool/Skill | Use |
|------------|-----|
| `view`, `create_file`, `str_replace` | Reading and writing artifacts |
| `ask_user_input_v0` | Structured multi-option questions (mobile-friendly) |
| `web_search`, `web_fetch` | Market research, reference validation (e.g. the DESIGN.md spec) |
| `image_search` | Mood board and visual references during `/ksdd:design` |
| `conversation_search` | Recover context from previous conversations about the same project |
| `Agent` | Parallel sub-agents for reverse-engineering (`/ksdd:setup`) and feature implementation (`/ksdd:build:feature`) |
| `skill-creator` | Package the KSDD project itself as an installable skill |
| `frontend-design` (Anthropic) | Token and pattern reference during `/ksdd:design` |

## Expected output

After the full flow, the user has the `.ksdd/` folder at the project root:

```
project/
├── (project code, README, configs, etc. — clean root)
└── .ksdd/
    ├── specs/
    │   ├── brainstorm.md          (~500-1500 words)
    │   ├── SPEC.md                (~3000-8000 words)
    │   ├── architecture.md        (~2000-5000 words, optional)
    │   └── DESIGN.md              (YAML frontmatter + ~1500-3500 words)
    ├── features/
    │   └── FEATURE-[slug].md      (~1500-4000 words, one per feature)
    ├── tasks/
    │   └── feature-[slug]/
    │       ├── README.md          (index of feature tasks)
    │       ├── NNN-slug.md        (individual task with frontmatter)
    │       └── .context/
    │           └── NNN-context.md (compiled context for implementation)
    └── build/
        └── BUILD-PLAN.md          (master plan for the full build)
```

> Pre-v0.6.0 legacy projects may have artifacts at the project root (`SPEC.md`, etc.) and in `docs/` (FEATURE/tasks) — commands keep reading from there with a migration warning, without breaking anything.

Ready to be consumed by design tools (Stitch, v0, Lovable, Pencil) and coding agents (Claude Code, Cursor) with persistent context.

The full flow: `/ksdd:build:all` decomposes the SPEC into features and tasks, generates `.ksdd/build/BUILD-PLAN.md` as the execution map, and implements task by task with issues, branches, quality gates and PRs. For individual features outside the full flow, use `/ksdd:new:feature` + `/ksdd:build:feature`. For pre-existing projects, `/ksdd:setup` reverse-engineers the four canonical artifacts from your codebase and git history.

## License and contributing

This project is licensed under [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0). To contribute, see [CONTRIBUTING.md](CONTRIBUTING.md).
