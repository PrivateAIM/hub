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

type RedirectPathBuildContext = {
    location?: RouteLocationNormalized,
    excluded?: string[]
};
function buildRedirectPath(
    context: RedirectPathBuildContext = {},
) : string | undefined {
    if (!context.location || context.location.query.redirect) {
        return undefined;
    }

    if (context.excluded) {
        for (let i = 0; i < context.excluded.length; i++) {
            if (context.location.fullPath.startsWith(context.excluded[i])) {
                return undefined;
            }
        }
    }

    return context.location.fullPath;
}

export default defineNuxtRouteMiddleware(async (to, from) => {
    const store = useStore();
    const { loggedIn } = storeToRefs(store);

    try {
        await store.resolve();
    } catch (e) {
        store.logout();

        const redirect = buildRedirectPath({
            location: to,
            excluded: [
                '/logout',
                '/login',
            ],
        });

        if (redirect) {
            console.log(`Resolving failed, redirecting to /logout?redirect=${redirect}`);

            return navigateTo({
                path: '/logout',
                query: {
                    redirect,
                },
            });
        }

        return undefined;
    }

    if (
        to.matched.some((matched) => !!matched.meta[LayoutKey.REQUIRED_LOGGED_IN])
    ) {
        if (!loggedIn.value) {
            const query : Record<string, string> = {};
            const redirect = buildRedirectPath({
                location: to,
                excluded: [
                    '/logout',
                    '/login',
                    '/',
                ],
            });
            if (redirect) {
                query.redirect = redirect;
            }

            console.log(`Not loggedIn, redirecting to /login${redirect ? `?redirect=${redirect}` : ''}`);

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
            const path = from ? from.fullPath : '/';
            console.log(`Not permitted, redirecting to ${path}`);
            // go back to the previous path if defined.
            return navigateTo({
                path,
            });
        }
    }

    if (to.matched.some((matched) => matched.meta[LayoutKey.REQUIRED_LOGGED_OUT])) {
        if (loggedIn.value) {
            const query : Record<string, string> = {};
            const redirect = buildRedirectPath({
                location: from,
                excluded: [
                    '/logout',
                    '/login',
                ],
            });

            if (redirect) {
                query.redirect = redirect;
            }

            console.log(`Not loggedOut, redirecting to /logout${redirect ? `?redirect=${redirect}` : ''}`);

            // logout and then go to the desired path.
            return navigateTo({
                path: '/logout',
                query: {
                    redirect,
                },
            });
        }
    }

    return undefined;
});
