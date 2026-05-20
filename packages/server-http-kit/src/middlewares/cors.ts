/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Options as CorsOptions } from '@routup/cors';
import { cors } from '@routup/cors';
import type { App } from 'routup';

export function mountCorsMiddleware(app: App, input?: CorsOptions) {
    app.use(cors({
        origin: true,
        credentials: true,
        // `credentials: true` is incompatible with the `*` wildcard for
        // exposeHeaders, so enumerate the response headers JS clients need.
        exposeHeaders: [
            'ratelimit-limit',
            'ratelimit-remaining',
            'ratelimit-reset',
            'retry-after',
            'etag',
            'content-disposition',
            'content-range',
            'accept-ranges',
            'location',
            'www-authenticate',
        ],
        ...(input ?? {}),
    }));
}
