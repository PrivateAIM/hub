# design-sync notes — privateaim/hub

## The one thing to know first

**This repo is outside the design-sync converter's envelope** — the component
kit (`@privateaim/client-vue` + `@vuecs/*`) is Vue 3; Claude Design renders
React only. Same situation as authup/authup (see its `.design-sync/NOTES.md`):
no converter runs here, only hand-authored, surgical syncs.

## Target project — additive contract (IMPORTANT)

`projectId` (pinned in config.json) is the user's **pre-existing, hand-built**
"PrivateAIM / FLAME Design System" project, built for a presentation. It
covers the whole ecosystem — the FLAME platform ember system (from node-ui's
PrimeVue flame preset), the PrivateAIM consortium identity, the medelium
brand, ui_kits for flame-node and the website, slides, and brand assets.
**Hub is one voice in that project, not its owner.** Never wholesale-replace;
every write is a reviewed, additive edit.

Files hub syncs touch:

- `colors_and_type.css` — **shared, hand-authored**; hub edits are surgical
  and user-approved. 2026-08-09: added the `hub` source-of-truth line, fixed
  the stale `--aim-blue-600` annotation, added the `--hub-*` accent block.
- `preview/color-hub.html` — **owned by hub syncs** (Colors-group card
  rendering the `--hub-*` tokens); safe to rewrite on re-sync.

Everything else (ember/slate/stone ramps, medelium, ui_kits/**, assets/**,
slides/**, the other preview cards) is hand-authored or belongs to other
sources — hands off.

## Decision record — 2026-08-09 palette review

Compared the project's ember system against hub's shipped theme
(side-by-side artifact with rendered mocks + WCAG contrast). Outcome:

- **Hub keeps its coral-primary local theme** (`--privateaim-brand-coral`
  #FF5B5B, warm-dark chrome #40434E, oklch semantic surfaces). The ember
  system stays the FLAME platform/node-ui identity.
- **Hub adopted `--aim-blue` #1e90ff as `--privateaim-brand-blue`**,
  replacing #2776dc. Historical note: #2776dc lives on in the project as
  `--aim-blue-600` — it was originally sampled *from* hub.
- Hub-side edits: `packages/client-vue-theme/src/index.css` (token),
  `apps/client-ui/components/auth/NetworkBackground.vue` (RGB fallbacks
  `[39,118,220]` → `[30,144,255]`),
  `docs/src/reference/frontend/client-vue-theme.md` (token table).
- Companion hues available but unused in hub so far: `--aim-blue-deep`
  #0055b3 (pressed) and #5aacff (dark-mode link) — the natural picks if the
  blue ever becomes interactive rather than decorative.

## Re-sync procedure

1. Source of truth for hub tokens: `packages/client-vue-theme/src/index.css`
   (+ `src/styles/`). If tokens change, update the `--hub-*` block in the
   project's `colors_and_type.css` and `preview/color-hub.html` to match.
2. Stage files into the session scratchpad (or a gitignored `ds-bundle/`),
   `finalize_plan` with the exact owned paths and `deletes: []`, then
   `write_files` via `localPath`.
3. Update `lastSync` / `lastSyncCommit` in `config.json`.

## Gotchas learned

- **This project's `@dsCard` marker sits on line 1** (before
  `<!DOCTYPE html>`) — unlike the authup project, which puts it on line 2.
  Match line 1 here; the Design System pane builds its card index from it,
  so no `register_assets` call is needed.
- Preview cards have **no shared `_base.css`** (unlike authup's project) —
  each card links `../colors_and_type.css` and carries its own small
  `<style>`. New color cards should reuse the existing chip pattern
  (`.lbl` header + `.row` grid + `.chip` with `.top`/`.bot`).
- Light chips need dark label text when the fill is light (the identity
  card does this for signal-yellow; `color-hub.html` does it for teal).
