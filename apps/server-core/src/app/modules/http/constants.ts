/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { Router, serve } from 'routup';

export type HTTPServer = ReturnType<typeof serve>;

export const HTTPInjectionKey = {
    Server: new TypedToken<HTTPServer>('Server'),
    Router: new TypedToken<Router>('Router'),
} as const;
