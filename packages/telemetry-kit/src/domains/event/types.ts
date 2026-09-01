/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IEntityAPISlim } from '../types-base';
import type { Event } from './entity';

/**
 * Append-only: events are an audit trail, so there is no `update`. The server
 * exposes no PATCH/POST `/events/:id` route and no EVENT_UPDATE permission —
 * `IEntityAPI` would have promised a method that always 404s.
 */
export interface IEventAPI extends IEntityAPISlim<Event, Partial<Event>> {}
