/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';
import { buildDomainEventFullName } from '@privateaim/kit';
import { isLoggerUsable, useLogger } from '../logger';
import type {
    EntityEventDestination, EntityEventHandleOptions,
    EntityEventPublishOptions,
    IEntityEventHandler,
    IEntityEventPublisher,
} from './types';

export class EntityEventPublisher implements IEntityEventPublisher {
    protected handlers : Set<IEntityEventHandler>;

    constructor() {
        this.handlers = new Set<IEntityEventHandler>();
    }

    register(consumer: IEntityEventHandler) {
        this.handlers.add(consumer);
    }

    async safePublish<T extends ObjectLiteral = ObjectLiteral>(
        ctx: EntityEventPublishOptions<T>,
    ) : Promise<void> {
        try {
            await this.publish(ctx);
        } catch (e) {
            if (isLoggerUsable()) {
                useLogger().error(`Publishing event ${buildDomainEventFullName(ctx.metadata.ref_type, ctx.metadata.event)} failed`);
                useLogger().error(e);
            }
        }
    }

    async publish<T extends ObjectLiteral = ObjectLiteral>(
        ctx: EntityEventPublishOptions<T>,
    ) : Promise<void> {
        if (isLoggerUsable()) {
            useLogger()
                .debug(
                    `Publishing event ${buildDomainEventFullName(ctx.metadata.ref_type, ctx.metadata.event)}`,
                );
        }

        let destinations : EntityEventDestination[] = [];
        if (typeof ctx.destinations === 'function') {
            destinations = ctx.destinations(ctx.data);
        } else {
            destinations = ctx.destinations;
        }

        const consumeContext : EntityEventHandleOptions = {
            ...ctx,
            destinations,
        };

        const consumers = this.handlers.values();
        while (true) {
            const it = consumers.next();
            if (it.done) {
                return;
            }

            await it.value.consume(consumeContext);
        }
    }
}
