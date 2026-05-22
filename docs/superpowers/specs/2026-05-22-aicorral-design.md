# AICorral — Design Spec (v1)

**Date:** 2026-05-22
**Status:** Approved for planning

## Summary

AICorral is a cross-platform (Windows / macOS / Linux) desktop app for managing the
AI coding CLIs installed on the local machine — Claude Code, Codex CLI, Gemini CLI,
Kimi CLI, Aider, Cline, Goose, and similar tools. It lists installed tools, discovers
installable ones from a curated catalog, and runs install / upgrade / uninstall / launch
operations against the real package managers on the machine.

The visual design and interaction model come from an existing, fully-realized static
React prototype (`_ref_extracted/`, originally distributed as `AI Corral.zip`). This
project ports that prototype into a real React + Tauri application and replaces its
mocked backend with real, cross-platform package-manager integration.

## Goals

- Faithfully reproduce the prototype's clean light-minimal UI (Notion/Vercel-style, Geist fonts).
- Real detection of installed CLIs and their versions.
- Real install / upgrade / uninstall via npm / pip(x) / brew.
- Launch a CLI in the user's system terminal.
- Honest data: surface only what can be reliably obtained; drop fabricated metadata.

## Non-Goals (v1)

- Multiple profiles (Personal/Work switcher) — removed.
- Auth scaffolding / pre-provisioning — each CLI handles its own auth on first launch.
- Managing CLIs not present in the curated catalog — only catalog tools are detected/managed.
- Embedded interactive terminal (xterm + PTY) — launch uses the external system terminal.
- Remote/updatable catalog — catalog is bundled and ships with the app.

## Decisions (from brainstorming)

| Decision | Choice |
|----------|--------|
| Backend reality | Full real integration (detect, version, install/upgrade/uninstall) |
| Launch behavior | Open the system terminal and run the CLI |
| Window appearance | Native OS window decorations |
| Catalog source | Bundled curated catalog |
| Screens in v1 | Core four (Dashboard, Installed, Discover, Doctor) + minimal Settings |
| Profiles / auth scaffolding | Removed |
| Unknown installed CLIs | Out of scope — catalog only |
| State management | TanStack Query for async/server state + local React state for UI |
| pip strategy | Prefer `pipx` when available, fall back to `pip --user` |

## Architecture

```
React + TypeScript (Vite)            Rust (Tauri 2.x)
  screens / components       invoke   commands.rs ──► catalog.rs
  hooks (TanStack Query)  ──────────►            ├─► detect.rs
  api/tauri.ts (typed)    ◄──────────            ├─► pm/{npm,pip,brew}.rs
        ▲   listen(events)   emit                ├─► launch.rs
        └───────────────────────────             ├─► doctor.rs
          streamed install progress              └─► settings.rs
```

Data flow: React calls `invoke()` → Rust command → package-manager abstraction / detection /
registry → returns result, or streams progress via Tauri events for long-running operations.

### Tech stack

- **Tauri 2.x**, Rust backend.
- **React 18 + TypeScript + Vite** frontend.
- **Native OS window decorations** (the prototype's faked mac/win/linux titlebar switcher is dropped).
- **TanStack Query** for server-state (detection results, latest-version lookups, install/upgrade/uninstall
  mutations with caching and refetch). Local React state for routing, selection, modals, toasts (mirrors the prototype).
- **Geist / Geist Mono fonts bundled locally** (no online Google Fonts dependency — must work offline).
- Long-running install/upgrade tasks stream child-process stdout to the UI via **Tauri events**.

## Data Model & Bundled Catalog

A curated `catalog.json` is bundled into the binary. Structure is based on the prototype's
`data.js` but the install source is reworked to support cross-platform package managers:

```jsonc
{
  "id": "claude-code",
  "name": "Claude Code",
  "vendor": "Anthropic",
  "mono": "CC", "hue": 28,
  "description": "Agentic coding in your terminal...",
  "tags": ["agent", "terminal"],
  "launchCmd": "claude",
  "runtime": "Node ≥ 18",
  "sources": [
    { "manager": "npm", "package": "@anthropic-ai/claude-code", "os": ["windows", "macos", "linux"] }
  ]
}
```

Key change: the single `source` string becomes a `sources[]` array. Each source declares its
`manager` (npm | pip | brew) and the `os` values it applies to. Example: Goose's brew source is
tagged macos/linux only; on Windows that tool shows "Unavailable on this platform" instead of an
Install button. When multiple sources apply to the current OS, the first applicable one is used.

### Catalog entries (v1)

claude-code (npm), codex (npm), gemini-cli (npm), kimi-cli (npm), aider (pip/pipx),
cline (npm), goose (brew, macos/linux), antigravity (npm). Monograms/hues carry over from the prototype.

## Rust Backend Modules (`src-tauri/src/`)

| Module | Responsibility |
|--------|----------------|
| `catalog.rs` | Load the bundled catalog; type definitions. |
| `pm/mod.rs` + `pm/{npm,pip,brew}.rs` | `PackageManager` trait: `is_available`, `latest_version`, `install`, `upgrade`, `uninstall`. Each impl encapsulates platform differences. |
| `detect.rs` | Resolve `launchCmd` on PATH (which/where logic), run `--version`, parse current version, capture the real binary path. |
| `launch.rs` | Open the system terminal per OS to run the launch command. |
| `doctor.rs` | Real environment checks: Node / Python / brew versions, PATH, disk space (best-effort), outbound connectivity to registries. |
| `settings.rs` | Persist npm/pip mirror, proxy, etc. to a JSON file. |
| `commands.rs` | Tauri command wrappers; emit streamed progress events during install/upgrade. |
| `lib.rs` / `main.rs` | Tauri builder; register commands. |

**Process execution is behind a trait** so pure logic (version parsing, command assembly,
catalog/platform filtering, registry-response parsing) can be unit-tested with a fake executor.

### Tauri commands (provisional surface)

- `list_catalog() -> Catalog`
- `detect_installed() -> Vec<InstalledState>` (binary path + current version per catalog id)
- `check_latest(ids) -> Map<id, Version>` (registry lookups)
- `install(id)` / `upgrade(id)` / `uninstall(id)` — long-running; emit `op-progress` events keyed by id
- `launch(id)` — spawn the system terminal
- `doctor() -> Vec<DoctorCheck>`
- `get_settings()` / `set_settings(settings)`

## Frontend Structure (`src/`)

- `api/tauri.ts` — typed wrappers over `invoke` and event listeners.
- `types.ts` — CLI / Catalog / DoctorCheck / Settings types aligned with Rust.
- `hooks/` — `useCatalog`, `useInstalled`, `useLatest`, `useInstallMutation` (install/upgrade/uninstall), `useDoctor`, `useSettings`.
- `screens/` — Dashboard, Installed, Discover, Doctor, Settings.
- `components/` — Sidebar, MainHeader, ListRow, DetailDrawer, InstallProgress, Modal, Toast, Monogram, Sparkline.
- `styles/app.css` — ported design system.
- `assets/fonts/` — bundled Geist / Geist Mono.

### Dropped from the prototype

- `chrome.jsx` (replaced by native window decorations).
- `tweaks-panel.jsx` (demo-only debug panel).
- `TerminalPopover` (replaced by launching the external terminal).
- Detail Drawer **Logs tab** (reliable per-CLI logs aren't available in v1).
- Profile switcher and auth scaffolding.

### InstallProgress rework

Keep the prototype's card visuals, but drive them from real child-process output: a live scrolling
log + spinner, then a success/fail terminal state. Show a determinate progress bar when output is
parseable; otherwise an indeterminate state.

## Honesty Boundary (no fabricated data)

| Field | v1 handling |
|-------|-------------|
| Current version / latest version / binary path | **Real** (`--version` + registry query). |
| runtime / source / tags / description | From the bundled catalog (static). |
| installedAt | Best-effort from binary file mtime; hidden if unavailable. |
| lastUsed / sizeMB | **Removed** (cannot be obtained reliably). |
| Versions tab | Registry's available-version list with current/latest markers; no hand-written changelog notes. |
| Config tab | Real binary path + "Reveal in file manager"; the fake TOML is removed. |

**Dashboard's four stat cards** become: Installed count / Updates available / Package managers
available (npm·pip·brew status) / Doctor health. The sessions sparkline (no data source) is removed.

## Cross-Platform Specifics

- **Package-manager availability**: probe npm/pip/brew on PATH at startup; when a manager is missing,
  tools using that source show "Requires Node/Python/Homebrew" (linking to Doctor).
- **brew is macOS/Linux only**; brew-only tools are marked unavailable on Windows.
- **pip**: prefer `pipx` (cleaner, avoids polluting the global environment); fall back to `pip --user`.
- **Latest-version lookup**: npm `npm view <pkg> version`; pip via the PyPI JSON API; brew via the
  formulae.brew.sh API.
- **Terminal launch**: probe per-OS terminals (Windows: Windows Terminal → cmd fallback; macOS:
  osascript / open Terminal; Linux: x-terminal-emulator → gnome-terminal / konsole). If all fail,
  fall back to a "copy command" prompt.

## Testing Strategy

- **Rust**: pure logic (version parsing, command assembly, catalog/platform filtering, registry-response
  parsing) via TDD unit tests. Process execution is injected through a trait, so command handlers are
  integration-tested against a fake package manager.
- **Frontend**: Vitest + Testing Library, mocking the `api/tauri.ts` layer to test components and hooks
  (list rendering, button states, progress streaming, empty/error states).

## Open Questions / Risks

- pipx detection vs pip fallback adds branching in `pm/pip.rs`; covered by unit tests over both paths.
- Disk space and binary mtime are best-effort and platform-variable; treated as optional fields that
  degrade gracefully when unavailable.
- Terminal-launch detection across Linux desktop environments is heuristic; the copy-command fallback
  guarantees the action never silently fails.
