/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IEntityAPI } from '../types-base';
import type { Event } from './entity';

export interface IEventAPI extends IEntityAPI<Event, Partial<Event>, Partial<Event>> {}
