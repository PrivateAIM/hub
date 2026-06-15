# @privateaim/client-vue-theme

Tailwind CSS v4 theme for PrivateAIM client applications. A single stylesheet that composes the full UI cascade — Tailwind, the vuecs design system, the authup kit theme — and layers hub's design tokens, component chrome, and a Bootstrap-shaped compat layer on top.

## Installation

```bash
npm install @privateaim/client-vue-theme
```

## Usage

Import the stylesheet as the application's single CSS entry point (it transitively provides Tailwind and all vuecs/authup styles):

```css
/* app entry CSS */
@import "@privateaim/client-vue-theme/index.css";
```

The package also ships a JS vuecs theme (element class-string overrides on top of the authup kit theme). Register both — kit theme first so the app theme's overrides win:

```typescript
import clientWebKitTheme from '@authup/client-web-kit-theme';
import clientVueTheme from '@privateaim/client-vue-theme';

app.use(vuecs, {
    themes: [clientWebKitTheme(), clientVueTheme()],
});
```

## Cascade

The stylesheet establishes this order (consumers get all of it from the one import):

1. `tailwindcss` — Tailwind v4 base/utilities
2. `@vuecs/design` — vuecs design system (semantic `--vc-color-*` tokens, light + dark)
3. `@vuecs/theme-tailwind` — vuecs component styling bridged onto Tailwind
4. PrivateAIM tokens — brand palette, chrome, typography
5. PrivateAIM compat layer — Bootstrap-shaped class shims (`@layer components`), phased out as templates migrate to `<VC*>` components

## Design Tokens

All tokens are CSS custom properties; overriding them reskins the UI without touching component class strings.

### Brand accents (fixed across modes)

| Token | Value |
|---|---|
| `--privateaim-brand-coral` | `#FF5B5B` — primary; the vuecs `primary` scale is color-mixed from it |
| `--privateaim-brand-teal` | `#4ECDC4` |
| `--privateaim-brand-purple` | `#6259ca` |
| `--privateaim-brand-blue` | `#2776dc` |
| `--privateaim-brand-rust` | `#a6592d` |

### Chrome (header, navbar, sidebar, footer — flips with mode)

| Token | Purpose |
|---|---|
| `--privateaim-chrome-bg` / `-bg-elevated` | Chrome surfaces (light: aliases `--vc-color-*`; dark: hub's warm dark grey) |
| `--privateaim-chrome-fg` / `-fg-muted` | Chrome text |
| `--privateaim-chrome-border` | Chrome borders |
| `--privateaim-chrome-edge-shadow-bottom` / `-top` / `-right` | Edge where chrome meets content (header/sidebar-header, footer, sidebar). Light: soft drop shadows; dark: recessed bands |

### Cards

One variable-driven `.card` base; variants only override `--card-*` tokens:

| Class | Use |
|---|---|
| `.card` | Base — structure, header/body/footer, title chevron |
| `.card-grey` | Muted surface — the default content card |
| `.card-panel` | Elevated surface, larger radius (settings / profile) |
| `.card-event` | Clickable tile (service catalog) |
| `.card-file` | Compact single-line file row |

The themable contract: `--card-bg`, `--card-fg`, `--card-border-color`, `--card-border-width`, `--card-radius`, `--card-shadow`, `--card-pad-x/y`, `--card-cursor`, `--card-header-fg`, `--card-footer-border`, `--card-accent`, `--card-accent-icon`. New variants are a handful of variable overrides:

```css
.card-custom {
    --card-bg: var(--vc-color-bg-elevated);
    --card-radius: 1rem;
}
```

All card colors resolve to vuecs semantic tokens, so cards adapt to light/dark automatically.

## Dark Mode

Dark mode is class-based (`.dark` on a root element; toggled in client-ui via `@vuecs/nuxt` `useColorMode`). The theme overrides the chrome tokens and softens the content surface under `.dark`; everything that consumes semantic tokens flips automatically. A `dark:` Tailwind variant is registered via `@custom-variant`.

## Notes

- The package currently vendors two kit-component stylesheets (`styles/kit-list.css`, `styles/kit-form-validation.css`) to work around an `@authup/client-web-kit-theme` packaging bug (its published tarball omits CSS files that `src/index.css` imports). Revert once a fixed authup beta ships.
- Icons are SVG via Iconify (`@vuecs/icon`); no icon webfont is shipped. CSS-only glyphs (e.g. the card header chevron) inline the iconify SVG via `mask-image`.
