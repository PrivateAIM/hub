/*
 * Copyright (c) 2024-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { injectNavigationManager } from '@vuecs/navigation';
import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin({
    dependsOn: ['vuecs'],
    setup(ctx) {
        const navigationManager = injectNavigationManager(ctx.vueApp);

        ctx.hook(
            'authup:middleware:end',
            async ({ to }) => {
                navigationManager.reset();

                await navigationManager.build({
                    path: to.fullPath,
                });
            },
        );

        // todo: listen for access token caches, when changed: clear navigationManager cache
    },
});
