/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { IHealth } from './types';

export const HEALTH_LIVENESS_PATH = '/livez';

export const HEALTH_READINESS_PATH = '/readyz';

export const DATABASE_HEALTH_CHECK_TIMEOUT = 1_000;

export const DATABASE_HEALTH_CHECK_TTL = 1_000;

/** Registered by each service's HTTP module, read by the shutdown hook. */
export const HealthInjectionKey = new TypedToken<IHealth>('Health');
