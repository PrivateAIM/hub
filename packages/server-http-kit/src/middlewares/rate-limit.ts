/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName } from '@privateaim/kit';
import { hasUnboundedReach } from '@privateaim/server-kit';
import type { OptionsInput } from '@routup/rate-limit';
import { rateLimit } from '@routup/rate-limit';
import type { App, IAppEvent } from 'routup';
import { useRequestEnv, useRequestIdentity } from '../request';

const PERMISSION_NAMES = Object.values(PermissionName);

export function mountRateLimiterMiddleware(app: App) {
    const options : OptionsInput = {
        async skip(event: IAppEvent) {
            const identity = useRequestIdentity(event);
            const permissionEvaluator = useRequestEnv(event, 'permissionEvaluator');
            if (!identity || identity.type !== 'client' || !permissionEvaluator) {
                return false;
            }

            // Never throttle hub's own service clients, e.g. the worker's `system` client:
            // a client whose grants reach every realm (`realm_scope: any`, no policy) for
            // EVERY hub permission. One name per call: several names compile as any-of.
            const verdicts = await Promise.all(PERMISSION_NAMES.map(
                (name) => hasUnboundedReach({ permissionEvaluator }, name),
            ));
            return verdicts.every(Boolean);
        },
        max(event: IAppEvent) {
            const identity = useRequestIdentity(event);
            if (identity && identity.type === 'user') {
                return 60 * 100; // 100 req p. sec
            }

            if (identity && identity.type === 'client') {
                return 60 * 1000; // 1000 req p. sec
            }

            return 60 * 20; // 20 req p. sec
        },
        windowMs: 60 * 1000, // 60 sec
    };

    app.use(rateLimit(options));
}
