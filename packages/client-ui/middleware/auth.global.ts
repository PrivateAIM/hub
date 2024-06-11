/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useStore } from '@authup/client-web-kit';
import { hasOwnProperty } from '@privateaim/kit';
import { storeToRefs } from 'pinia';
import type { RouteLocationNormalized } from 'vue-router';
import {
    navigateTo,
} from '#app';
import { LayoutKey } from '../config/layout';

function checkPermission(route: RouteLocationNormalized, has: (name: string) => boolean) {
    let isAllowed : undefined | boolean;

    const layoutKey = LayoutKey.REQUIRED_PERMISSIONS;

    for (let j = 0; j < route.matched.length; j++) {
        const matchedRecord = route.matched[j];

        if (!hasOwnProperty(matchedRecord.meta, layoutKey)) {
            continue;
        }

        const value = matchedRecord.meta[layoutKey];
        if (Array.isArray(value)) {
            isAllowed = value.some((val) => has(val));
        }

        if (isAllowed) {
            return true;
        }
    }

    if (typeof isAllowed === 'undefined') {
        return true;
    }

    return isAllowed;
}

export default defineNuxtRouteMiddleware(async (to, from) => {
    const store = useStore();
    const { loggedIn } = storeToRefs(store);

    let redirectPath = '/login';

    if (
        typeof from !== 'undefined' &&
        from.fullPath !== to.fullPath
    ) {
        redirectPath = from.fullPath;
    }

    try {
        await store.resolve();
    } catch (e) {
        store.logout();

        if (
            !to.fullPath.startsWith('/logout') &&
            !to.fullPath.startsWith('/login')
        ) {
            return navigateTo({
                path: '/logout',
                query: {
                    redirect: redirectPath,
                },
            });
        }

        return undefined;
    }

    if (
        to.matched.some((matched) => !!matched.meta[LayoutKey.REQUIRED_LOGGED_IN])
    ) {
        if (!loggedIn.value) {
            const query : Record<string, any> = {};

            if (
                !to.fullPath.startsWith('/logout') &&
                !to.fullPath.startsWith('/login')
            ) {
                query.redirect = to.fullPath;
            }

            return navigateTo({
                path: '/login',
                query,
            });
        }
    }

    if (
        to.matched.some((matched) => !!matched.meta[LayoutKey.REQUIRED_PERMISSIONS])
    ) {
        const permitted = checkPermission(to, (name) => store.abilities.has(name));
        if (!permitted) {
            return navigateTo({
                path: redirectPath,
            });
        }
    }

    if (
        !to.fullPath.startsWith('/logout') &&
        to.matched.some((matched) => matched.meta[LayoutKey.REQUIRED_LOGGED_OUT])
    ) {
        const query : Record<string, any> = {};
        if (!redirectPath.includes('logout')) {
            query.redirect = redirectPath;
        }

        if (loggedIn.value) {
            return navigateTo({
                path: '/logout',
                query,
            });
        }
    }

    return undefined;
});
