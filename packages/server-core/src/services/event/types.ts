/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityManager } from 'typeorm';
import type { EventEntity } from '../../database';

export type EventServiceHookContext = {
    entityManager: EntityManager
};

export interface EventServiceHook {
    pre(input: EventEntity, context: EventServiceHookContext): Promise<void>;

    post(input: EventEntity, context: EventServiceHookContext): Promise<void>;
}
