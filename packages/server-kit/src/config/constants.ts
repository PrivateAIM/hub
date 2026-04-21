/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { BaseServerConfig } from './types';

export const CONFIG_MODULE_NAME = 'config';

export const ConfigInjectionKey = new TypedToken<BaseServerConfig>('Config');
