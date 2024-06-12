/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryStore } from '@ilingo/vuelidate/core';
import { install } from '@ilingo/vuelidate';
import type { App } from 'vue';
import type { TranslatorInstallOptions } from './types';

export function installTranslator(app: App, options: TranslatorInstallOptions = {}) {
    const store = new MemoryStore({
        data: {},
    });

    install(app, {
        store,
        locale: options.locale,
    });
}
