/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { swaggerUI } from '@routup/swagger-ui';
import { readSync } from 'locter';
import process from 'node:process';
import type { App } from 'routup';
import type { MiddlewareSwaggerOptions } from './types';

export function mountSwaggerMiddleware(app: App, options: MiddlewareSwaggerOptions = {}) {
    let document : any;
    if (options.cwd) {
        document = readSync(path.join(options.cwd, 'swagger.json'));
    } else {
        document = readSync(path.join(process.cwd(), 'writable', 'swagger.json'));
    }

    app.use('/docs', swaggerUI(document, { baseURL: options.baseURL }));
}
