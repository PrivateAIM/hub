/*
 * Copyright (c) 2024-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { basic } from '@routup/basic';
import type { App } from 'routup';

/**
 * JSON bodies only, bounded: no hub endpoint takes a form body, and parsing
 * one would let a cross-site form POST reach a cookie-authenticated route.
 * Uploads read the raw request stream and are not affected.
 */
export const BODY_JSON_LIMIT = '10mb';

export function mountBasicMiddleware(app: App) {
    // basic() enables cookie and query parsing only when given no options
    // at all, so both are named once body options are passed.
    app.use(basic({
        body: {
            json: { limit: BODY_JSON_LIMIT },
            urlEncoded: false,
        },
        cookie: true,
        query: true,
    }));
}
