/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';
import { buildDomainEventFullName } from '@privateaim/kit';
import type { Logger } from '../logger';
import type {
    EntityEventDestination,
    EntityEventHandleOptions,
    EntityEventPublishOptions,
    IEntityEventHandler,
    IEntityEventPublisher,
} from './types';

export type EntityEventPublisherContext = {
    logger?: Logger;
};

export class EntityEventPublisher implements IEntityEventPublisher {
    protected handlers : Set<IEntityEventHandler>;

    protected logger?: Logger;

    constructor(ctx: EntityEventPublisherContext = {}) {
        this.handlers = new Set<IEntityEventHandler>();
        this.logger = ctx.logger;
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
            if (this.logger) {
                this.logger.error(`Publishing event ${buildDomainEventFullName(ctx.metadata.ref_type, ctx.metadata.event)} failed`);
                this.logger.error(e);
            }
        }
    }

    async publish<T extends ObjectLiteral = ObjectLiteral>(
        ctx: EntityEventPublishOptions<T>,
    ) : Promise<void> {
        if (this.logger) {
            this.logger
                .debug(
                    `Publishing event ${buildDomainEventFullName(ctx.metadata.ref_type, ctx.metadata.event)}`,
                );
        }

        const destinations : EntityEventDestination[] = typeof ctx.destinations === 'function' ?
            ctx.destinations(ctx.data) :
            ctx.destinations;

        const consumeContext : EntityEventHandleOptions = {
            ...ctx,
            destinations,
        };

        const handlers = this.handlers.values();
        while (true) {
            const handler = handlers.next();
            if (handler.done) {
                return;
            }

            await (handler.value as IEntityEventHandler).handle(consumeContext);
        }
    }
}
