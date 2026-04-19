/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { Logger } from './types';

export const LOGGER_MODULE_NAME = 'logger';

export const LoggerInjectionKey = new TypedToken<Logger>('Logger');
