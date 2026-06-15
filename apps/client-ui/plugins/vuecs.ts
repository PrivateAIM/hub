/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { injectTranslatorLocale } from '@authup/client-web-kit';
import { createValidup } from '@validup/vue';
import { OptionalValue } from 'validup';
import { de } from 'date-fns/locale/de';

import vuecs from '@vuecs/core';
import clientWebKitTheme from '@authup/client-web-kit-theme';
import clientVueTheme from '@privateaim/client-vue-theme';
import fontAwesome from '@vuecs/icons-font-awesome';
import { addCollection } from '@iconify/vue';
import faBrands from '@iconify-json/fa6-brands/icons.json';
import faSolid from '@iconify-json/fa6-solid/icons.json';
import installButton from '@vuecs/button';
import installCountdown from '@vuecs/countdown';
import installElements from '@vuecs/elements';
import installForms, { type SubmitButtonDefaults } from '@vuecs/forms';
import installIcon from '@vuecs/icon';
import installList from '@vuecs/list';
import installNavigation from '@vuecs/navigation';
import installOverlays from '@vuecs/overlays';
import installPagination from '@vuecs/pagination';
import installTable from '@vuecs/table';
import installTimeago from '@vuecs/timeago';

import { defineNuxtPlugin } from '#app';

addCollection(faSolid);
addCollection(faBrands);

export default defineNuxtPlugin({
    name: 'vuecs',
    // Runs AFTER `authup` (which itself dependsOn `authup:kit`) because
    // `injectTranslatorLocale()` below requires the ilingo locale provider
    // that `@authup/client-web-nuxt`'s kit plugin sets up via
    // `installTranslator()`. Using `enforce: 'pre'` here would invert the
    // order and throw "An ilingo locale is not present in the vue context.".
    dependsOn: ['authup'],
    setup: (ctx) => {
        // The ilingo locale provider is installed by the `authup` plugin
        // chain that this plugin `dependsOn`. Bridge the active ilingo locale
        // into vuecs's `Config['locale']` as a reactive ref; @vuecs/timeago
        // 2.1+ reads the active locale via `useLocale()` — its per-package
        // `injectLocale()` ref was removed.
        const locale = injectTranslatorLocale();

        // TODO(i18n): @authup/client-web-kit@1.0.0-beta.45 ships a broken
        // buildSubmitButtonDefaults() — its bundled translator namespace omits
        // the @authup/i18n constants, so `TranslatorTranslationNamespace` is
        // undefined and the call throws at runtime. Static placeholder labels
        // until we provide our own i18n package (see i18n placeholder plan).
        const submitButton = {
            createText: 'Create',
            updateText: 'Update',
            createIcon: 'fa6-solid:plus',
            updateIcon: 'fa6-solid:floppy-disk',
            createColor: 'primary',
            updateColor: 'primary',
        } satisfies SubmitButtonDefaults;

        ctx.vueApp.use(vuecs, {
            themes: [clientWebKitTheme(), clientVueTheme()],
            icons: [fontAwesome()],
            config: { locale },
            defaults: { submitButton },
        });

        ctx.vueApp.use(createValidup({
            optionalValue: [OptionalValue.UNDEFINED, OptionalValue.NULL, OptionalValue.EMPTY_STRING],
            optionalAs: null,
        }));

        ctx.vueApp.use(installButton);
        ctx.vueApp.use(installElements);
        ctx.vueApp.use(installForms);
        ctx.vueApp.use(installList);
        // Registry-only install (@vuecs/navigation 4.x): no item list and no
        // NavigationManager — each `<VCNavItems>` owns its items via `:data`.
        // Installed after `app.use(vuecs)` so the theme manager already carries
        // the configured themes before navigation's own theme-manager call runs.
        ctx.vueApp.use(installNavigation);
        ctx.vueApp.use(installOverlays);
        ctx.vueApp.use(installPagination);
        ctx.vueApp.use(installTable);
        ctx.vueApp.use(installIcon);

        ctx.vueApp.use(installCountdown);
        // Register the date-fns German locale so timeago can format relative
        // times in German when the active locale (driven by `config.locale`
        // above) is `de`.
        ctx.vueApp.use(installTimeago, { locales: { de } });
    },
});
