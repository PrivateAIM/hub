/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { App, defineCoreHandler } from 'routup';

export function createHttpApp() : App {
    const app = new App();
    app.get('/', defineCoreHandler(() => ({ timestamp: Date.now() })));

    return app;
}
