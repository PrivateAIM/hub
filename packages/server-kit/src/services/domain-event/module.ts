/*
 * Copyright (c) 2024-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';
import { buildDomainEventFullName } from '@privateaim/kit';
import { isLoggerUsable, useLogger } from '../logger';
import type {
    DomainEventConsumeOptions, DomainEventDestination,
    DomainEventPublishOptions,
    IDomainEventConsumer,
    IDomainEventPublisher,
} from './types';

export class DomainEventPublisher implements IDomainEventPublisher {
    protected consumers : Set<IDomainEventConsumer>;

    constructor() {
        this.consumers = new Set<IDomainEventConsumer>();
    }

    addConsumer(consumer: IDomainEventConsumer) {
        this.consumers.add(consumer);
    }

    async safePublish<T extends ObjectLiteral = ObjectLiteral>(
        ctx: DomainEventPublishOptions<T>,
    ) : Promise<void> {
        try {
            await this.publish(ctx);
        } catch (e) {
            if (isLoggerUsable()) {
                useLogger().error(`Publishing event ${buildDomainEventFullName(ctx.metadata.domain, ctx.metadata.event)} failed`);
                useLogger().error(e);
            }
        }
    }

    async publish<T extends ObjectLiteral = ObjectLiteral>(
        ctx: DomainEventPublishOptions<T>,
    ) : Promise<void> {
        if (isLoggerUsable()) {
            useLogger().info(`Publishing event ${buildDomainEventFullName(ctx.metadata.domain, ctx.metadata.event)}`);
        }

        let destinations : DomainEventDestination[] = [];
        if (typeof ctx.destinations === 'function') {
            destinations = ctx.destinations(ctx.data);
        } else {
            destinations = ctx.destinations;
        }

        const consumeContext : DomainEventConsumeOptions = {
            ...ctx,
            destinations,
        };

        const consumers = this.consumers.values();
        while (true) {
            const it = consumers.next();
            if (it.done) {
                return;
            }

            await it.value.consume(consumeContext);
        }
    }
}
