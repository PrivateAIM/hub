/*
 * Copyright (c) 2024-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { basic } from '@routup/basic';
import type { App } from 'routup';

/**
 * JSON bodies without a size limit: nodes push large payloads to the hub.
 * Form bodies stay unparsed: no endpoint takes one, and parsing them would let
 * a cross-site form POST reach a cookie-authenticated route.
 */
export function mountBasicMiddleware(app: App) {
    // basic() enables cookie and query parsing only when given no options
    // at all, so both are named once body options are passed.
    app.use(basic({
        body: {
            json: true,
            urlEncoded: false,
        },
        cookie: true,
        query: true,
    }));
}
