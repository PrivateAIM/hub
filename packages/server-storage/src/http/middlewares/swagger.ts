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
import { useEnv } from '../../config';

export function mountSwaggerMiddleware(router: Router) {
    const document = loadSync(path.join(process.cwd(), 'writable', 'swagger.json'));
    router.use('/docs', swaggerUI(document, {
        baseURL: useEnv('publicURL'),
    }));
}
