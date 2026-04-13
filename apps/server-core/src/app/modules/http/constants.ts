/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { Server } from 'node:http';
import type { Router } from 'routup';

export const HTTPInjectionKey = {
    Server: new TypedToken<Server>('Server'),
    Router: new TypedToken<Router>('Router'),
} as const;
