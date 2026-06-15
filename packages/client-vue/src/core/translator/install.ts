/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    MemoryStore,
    defineCatalog,
    defineLocale,
    defineNamespace,
    defineTranslations,
} from 'ilingo';
import { install as installIlingoVue } from '@ilingo/vue';
import { install as installIlingoValidup } from '@ilingo/validup-vue';
import type { App } from 'vue';
import type { TranslatorInstallOptions } from './types';

export function installTranslator(app: App, options: TranslatorInstallOptions = {}) {
    const catalog = defineCatalog([
        defineLocale('en', [
            defineNamespace('app', [defineTranslations({})]),
        ]),
        defineLocale('de', [
            defineNamespace('app', [defineTranslations({})]),
        ]),
    ]);

    installIlingoVue(app, {
        store: new MemoryStore({ data: catalog }),
        locale: options.locale,
    });
    installIlingoValidup(app);
}
