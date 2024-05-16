/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { swaggerUI } from '@routup/swagger';
import { loadSync } from 'locter';
import process from 'node:process';
import type { Router } from 'routup';
import type { MiddlewareSwaggerOptions } from './types';

export function mountSwaggerMiddleware(router: Router, options: MiddlewareSwaggerOptions) {
    const document = loadSync(path.join(options.cwd || process.cwd(), 'swagger.json'));
    router.use('/docs', swaggerUI(document, {
        baseURL: options.baseURL,
    }));
}
