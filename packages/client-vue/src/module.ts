/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { App, Component } from 'vue';
import * as components from './components';
import {
    installCoreHTTPClient,
    installSocketManager,
    installStorageHTTPClient,
    installTelemetryHTTPClient,
    installTranslator,
} from './core';
import type { Options } from './type';

export function install(app: App, options: Options): void {
    installCoreHTTPClient(app, { baseURL: options.coreURL, client: options.coreHTTPClient });

    installStorageHTTPClient(app, { baseURL: options.storageURL, client: options.storageHTTPClient });

    installTelemetryHTTPClient(app, { baseURL: options.telemetryURL, client: options.telemetryHTTPClient });

    // Opt-in: the socket manager needs a live authup store and opens a
    // websocket. `apps/client-ui` passes `realtime: true` to keep it on.
    if (options.realtime) {
        installSocketManager(app, { baseURL: options.coreURL, pinia: options.pinia });
    }

    installTranslator(app, { locale: options.translatorLocale });

    if (options.components) {
        let componentsSelected: undefined | string[];
        if (typeof options.components !== 'boolean') {
            componentsSelected = options.components;
        }

        Object.entries(components)
            .forEach(([componentName, component]) => {
                if (
                    !Array.isArray(componentsSelected) ||
                    componentsSelected.includes(componentName)
                ) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    app.component(componentName, component as Component);
                }
            });
    }
}
