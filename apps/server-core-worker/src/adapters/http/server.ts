/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Router, defineCoreHandler } from 'routup';

export function createHttpRouter() : Router {
    const router = new Router();
    router.get('/', defineCoreHandler(() => ({ timestamp: Date.now() })));

    return router;
}
