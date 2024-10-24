/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { StoreDispatcherEventName, injectStoreDispatcher, useStore } from '@authup/client-web-kit';
import type { StoreManagerOptions } from '@vuecs/core';
import bootstrap from '@vuecs/preset-bootstrap-v5';
import fontAwesome from '@vuecs/preset-font-awesome';

import { applyStoreManagerOptions, installStoreManager } from '@vuecs/form-controls/core';
import installCountdown from '@vuecs/countdown';
import installFormControl from '@vuecs/form-controls';
import { injectNavigationManager, install as installNavigation } from '@vuecs/navigation';
import installPagination from '@vuecs/pagination';
import installTimeago from '@vuecs/timeago';

import { defineNuxtPlugin } from '#app';
import { Navigation } from '../config/layout';

export default defineNuxtPlugin((ctx) => {
    const storeManagerOptions : StoreManagerOptions = {
        presets: {
            bootstrap,
            fontAwesome,
        },
        defaults: {
            list: {
                class: 'list',
            },
            listBody: {
                class: 'list-body',
            },
            listItem: {
                class: 'list-item',
            },
            pagination: {
                class: 'pagination',
                itemClass: 'page-item',
            },
        },
    };

    const storeManager = installStoreManager(ctx.vueApp);
    applyStoreManagerOptions(storeManager, storeManagerOptions);

    ctx.vueApp.use(installCountdown);
    ctx.vueApp.use(installFormControl);

    const store = useStore();
    const navigation = new Navigation(store);

    ctx.vueApp.use(installNavigation, {
        items: ({
            level,
            parent,
        }) => navigation.getItems(level, parent),
    });

    const navigationManager = injectNavigationManager(ctx.vueApp);
    const storeDispatcher = injectStoreDispatcher(ctx.vueApp);
    storeDispatcher.on(
        StoreDispatcherEventName.ACCESS_TOKEN_UPDATED,
        () => navigationManager.build({
            reset: true,
            path: ctx._route.fullPath,
        }),
    );

    ctx.vueApp.use(installPagination);
    ctx.vueApp.use(installTimeago);
});
