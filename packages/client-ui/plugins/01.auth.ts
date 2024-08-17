/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { install } from '@authup/client-web-kit';
import type { Pinia } from 'pinia';
import { tryUseNuxtApp, useCookie } from '#imports';

export default defineNuxtPlugin({
    setup(ctx) {
        const runtimeConfig = useRuntimeConfig();
        let baseURL : string | undefined;
        if (runtimeConfig.authupUrl) {
            baseURL = runtimeConfig.authupUrl as string;
        } else {
            baseURL = runtimeConfig.public.authupUrl;
        }

        const cookieOptions : { domain?: string } = {};
        if (typeof runtimeConfig.public.cookieDomain === 'string') {
            cookieOptions.domain = runtimeConfig.public.cookieDomain;
        }

        ctx.vueApp.use(install, {
            pinia: ctx.$pinia as Pinia,
            baseURL,
            cookieSet: (key, value) => {
                const app = tryUseNuxtApp();
                if (app) {
                    const cookie = useCookie(key, cookieOptions);
                    cookie.value = value;
                }
            },
            cookieUnset: (key) => {
                const app = tryUseNuxtApp();
                if (app) {
                    const cookie = useCookie(key, cookieOptions);
                    cookie.value = null;
                }
            },
            cookieGet: (key) => {
                const app = tryUseNuxtApp();
                if (app) {
                    const cookie = useCookie(key, cookieOptions);
                    return cookie.value;
                }

                return null;
            },
        });
    },
});
