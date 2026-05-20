/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { REALM_MASTER_NAME } from '@authup/core-kit';
import type { OptionsInput } from '@routup/rate-limit';
import { rateLimit } from '@routup/rate-limit';
import type { App, IAppEvent } from 'routup';
import { useRequestIdentity } from '../request';

export function mountRateLimiterMiddleware(app: App) {
    const options : OptionsInput = {
        skip(event: IAppEvent) {
            const identity = useRequestIdentity(event);

            return identity &&
                identity.type === 'robot' &&
                identity.realmName === REALM_MASTER_NAME;
        },
        max(event: IAppEvent) {
            const identity = useRequestIdentity(event);
            if (identity && identity.type === 'user') {
                return 60 * 100; // 100 req p. sec
            }

            if (
                identity &&
                (identity.type === 'robot' || identity.type === 'client')
            ) {
                return 60 * 1000; // 1000 req p. sec
            }

            return 60 * 20; // 20 req p. sec
        },
        windowMs: 60 * 1000, // 60 sec
    };

    app.use(rateLimit(options));
}
