/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { Cache } from './module';

export const CACHE_MODULE_NAME = 'cache';

export const CacheInjectionKey = new TypedToken<Cache>('Cache');
