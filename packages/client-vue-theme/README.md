<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/client-vue-theme 🌈</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/client-vue-theme)](https://www.npmjs.com/package/@privateaim/client-vue-theme)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Tailwind CSS v4 theme for FLAME Hub clients: design tokens, light and dark chrome, cards and a vuecs theme.**

One stylesheet import brings Tailwind, the vuecs design system and the Authup kit theme in the right cascade order, with FLAME
Hub's brand palette and chrome on top; reskinning means overriding CSS variables, not class strings. Part of the
[FLAME Hub](https://github.com/PrivateAIM/hub) monorepo, built on [vuecs](https://github.com/tada5hi/vuecs) and
[Tailwind CSS](https://tailwindcss.com).

[Installation](#installation) · [Usage](#usage) · [Cascade](#cascade) · [Design tokens](#design-tokens) · [Cards](#cards) · [Dark mode](#dark-mode) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/frontend/client-vue-theme.html)

---

## Installation

```bash
npm install @privateaim/client-vue-theme
```

Peer dependencies: `tailwindcss` 4, `@vuecs/core`, `@vuecs/design` and `@vuecs/theme-tailwind`. The package depends on
`@authup/client-web-kit-theme`, whose stylesheet it imports. The JavaScript theme ships as ESM; Node.js `>=26.0.0`.

## Usage

Import the stylesheet as your application's Tailwind entry. It brings Tailwind and all vuecs and Authup styles with it:

```css
/* app entry CSS */
@import "@privateaim/client-vue-theme/index.css";

/* the class strings of your app and of the component packages (paths relative to this file) */
@source "./src";
@source "../node_modules/@privateaim/client-vue/dist";
@source "../node_modules/@vuecs";
@source "../node_modules/@authup/client-web-kit/dist";
```

The bare specifier `@import "@privateaim/client-vue-theme";` resolves to the same file through the `style` export condition.

Register the JavaScript vuecs theme (element class-string overrides) after the Authup kit theme, so its overrides win:

```typescript
import clientWebKitTheme from '@authup/client-web-kit-theme';
import clientVueTheme from '@privateaim/client-vue-theme';
import vuecs from '@vuecs/core';

app.use(vuecs, {
    themes: [clientWebKitTheme(), clientVueTheme()],
});
```

`clientVueTheme()` pads table header cells and makes a hovered or focused pagination button preview the active-page colours.

## Cascade

The stylesheet declares `@layer theme, vuecs, authup, base, components, utilities;` and builds this order:

1. `tailwindcss`: Tailwind v4 base and utilities (through the Authup kit theme)
2. `@vuecs/design`: semantic `--vc-color-*` tokens, light and dark (through the Authup kit theme)
3. `@vuecs/theme-tailwind`: vuecs component styling bridged onto Tailwind (through the Authup kit theme)
4. FLAME Hub tokens: brand palette, primary scale, chrome, typography
5. FLAME Hub structure and app styles: progress bars, joined pagination, modal inner chrome, cards, header, navbar, sidebar

## Design tokens

All tokens are CSS custom properties; overriding them reskins the UI without touching component class strings.

### Brand accents

Fixed across modes:

| Token | Value |
|---|---|
| `--privateaim-brand-coral` | `#FF5B5B`: the primary colour |
| `--privateaim-brand-teal` | `#4ECDC4` |
| `--privateaim-brand-purple` | `#6259ca`: entity icons and card accents |
| `--privateaim-brand-blue` | `#1e90ff` |
| `--privateaim-brand-rust` | `#a6592d` |

The vuecs primary scale (`--vc-color-primary-50` to `-950`) is colour-mixed from `--privateaim-brand-coral`, with the pure brand
colour at `600`, the shade buttons and active states use. Override the coral token and every `primary` utility follows.

### Chrome

Header, navbar, sidebar and footer flip with the mode:

| Token | Purpose |
|---|---|
| `--privateaim-chrome-bg` / `-bg-elevated` | Chrome surfaces (light: aliases of `--vc-color-*`; dark: warm dark grey) |
| `--privateaim-chrome-fg` / `-fg-muted` | Chrome text |
| `--privateaim-chrome-border` | Chrome borders |
| `--privateaim-chrome-edge-shadow-bottom` / `-top` / `-right` | Edge where chrome meets content. Light: soft drop shadows; dark: recessed bands, no right edge |

## Cards

One variable-driven `.card` base; variants override only `--card-*` tokens:

| Class | Use |
|---|---|
| `.card` | Base: structure, header, body, footer, title chevron |
| `.card-grey` | Muted surface, the default content card |
| `.card-panel` | Elevated surface with a larger radius (settings, profile) |
| `.card-event` | Clickable tile |
| `.card-file` | Compact single-line file row |

The themable contract: `--card-bg`, `--card-fg`, `--card-border-color`, `--card-border-width`, `--card-radius`, `--card-shadow`,
`--card-pad-x`, `--card-pad-y`, `--card-cursor`, `--card-header-fg`, `--card-header-border`, `--card-header-shadow`,
`--card-footer-border`, `--card-body-font-size`, `--card-accent`, `--card-accent-icon`. A new variant is a handful of overrides:

```css
.card-custom {
    --card-bg: var(--vc-color-bg-elevated);
    --card-radius: 1rem;
}
```

Card colours resolve to vuecs semantic tokens, so cards follow light and dark mode.

## Dark mode

Dark mode is class-based: `.dark` on a root element, with a `dark:` Tailwind variant (registered by the Authup kit theme). Under
`.dark` the theme:

- restores the warm dark-grey chrome palette;
- lifts the content surface (`--vc-color-bg`, `-bg-muted`, `-bg-elevated`, `--vc-color-border`) so it pairs with the chrome and
  elevated cards stay lighter than the page;
- sets tinted surfaces and readable text colours for warnings, dangers and info
  (`--privateaim-{warning,danger,info}-surface`, `-surface-border`, `-surface-fg`, `-text`).

Everything that consumes semantic tokens flips with it. Palette swaps also work through `setColorPalette()` from
`@vuecs/theme-tailwind`, without any configuration here.

## Notes

- **Declare `@source` in your app.** The theme scans only its own directory. Tailwind finds the class strings of `@vuecs/*`,
  `@authup/client-web-kit` and `@privateaim/client-vue` only through your app's `@source` entries; a missing one leaves those
  components unstyled without an error.
- **`@vuecs/forms` styles are separate.** Its plugin registers components only; import `@vuecs/forms/style.css` yourself, or
  checkboxes render without a checkmark.
- **Two kit stylesheets are vendored.** `styles/kit-list.css` and `styles/kit-form-validation.css` are copies, because the
  upstream Authup theme no longer ships them, adjusted to the current `vc-*` class names.
- **Icons are SVG.** No icon webfont ships; icons come from Iconify through `@vuecs/icon`. CSS-only glyphs (the card header
  chevron) inline an SVG through `mask-image`.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
