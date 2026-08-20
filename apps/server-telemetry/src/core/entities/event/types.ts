/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Event } from '@privateaim/telemetry-kit';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';

export type EventDeleteExpiredOptions = {
    /**
     * Rows removed per statement. Defaults to
     * EVENT_RETENTION_SWEEP_BATCH_SIZE, which anything that is not a positive
     * safe integer also falls back to.
     */
    batchSize?: number,
};

export interface IEventRepository extends IEntityRepository<Event> {
    /**
     * Retention sweep: drop every expiring row whose expiresAt lies before the
     * given instant (non-expiring rows are kept forever). Returns the number of
     * removed rows. Removal is batched (see EVENT_RETENTION_SWEEP_BATCH_SIZE).
     */
    deleteExpired(now: string, options?: EventDeleteExpiredOptions): Promise<number>;
}

export interface IEventService {
    getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<Event>>;
    getOne(id: string, actor: ActorContext): Promise<Event>;
    create(data: Partial<Event>, actor: ActorContext): Promise<Event>;
    delete(id: string, actor: ActorContext): Promise<Event>;
}
