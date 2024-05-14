/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { applyStoreManagerOptions, installStoreManager } from '@vuecs/list-controls/core';
import type { App, Component } from 'vue';
import * as components from './components';
import { installSocketManager, provideCoreAPIClient, provideStorageAPIClient } from './core';
import type { Options } from './type';

export function install(app: App, options: Options): void {
    if (options.coreAPIClient) {
        provideCoreAPIClient(options.coreAPIClient, app);
    }

    if (options.storageAPIClient) {
        provideStorageAPIClient(options.storageAPIClient, app);
    }

    if (options.realtimeURL) {
        installSocketManager(app, {
            baseURL: options.realtimeURL,
        });
    }

    const storeManager = installStoreManager(app);
    if (options.storeManager) {
        applyStoreManagerOptions(storeManager, options.storeManager);
    }

    if (options.components) {
        let componentsSelected: undefined | string[];
        if (typeof options.components !== 'boolean') {
            componentsSelected = options.components;
        }

        Object.entries(components)
            .forEach(([componentName, component]) => {
                if (
                    !Array.isArray(componentsSelected) ||
                    componentsSelected.indexOf(componentName) !== -1
                ) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    app.component(componentName, component as Component);
                }
            });
    }
}
