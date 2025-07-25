/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Event } from '@privateaim/core-kit';
import type { DeepPartial } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { EventEntity } from '../../database';
import type { EventServiceHook, EventServiceHookContext } from './types';

export class EventService {
    protected hooks : Record<string, EventServiceHook>;

    constructor(hooks : Record<string, EventServiceHook>) {
        this.hooks = hooks;
    }

    async store(
        input: DeepPartial<Event>,
        context?: EventServiceHookContext,
    ) : Promise<EventEntity> {
        if (context) {
            return this.storeWithContext(input, context);
        }

        const dataSource = await useDataSource();
        return dataSource.transaction(
            async (entityManager) => {
                const context : EventServiceHookContext = {
                    entityManager,
                };

                return this.storeWithContext(input, context);
            },
        );
    }

    protected async storeWithContext(
        input: DeepPartial<EventEntity>,
        context: EventServiceHookContext,
    ): Promise<EventEntity> {
        const repository = context.entityManager.getRepository(EventEntity);

        let entity = repository.create(input);

        if (
            entity.expiring &&
            !entity.expires_at
        ) {
            entity.expires_at = new Date(
                Date.now() + (1000 * 60 * 60 * 24),
            ).toISOString();
        }

        if (this.hooks[input.ref_type]) {
            await this.hooks[input.ref_type].pre(entity, context);
        }

        entity = await repository.save(entity);

        if (this.hooks[input.ref_type]) {
            await this.hooks[input.ref_type].post(entity, context);
        }

        return entity;
    }
}
