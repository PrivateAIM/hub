/*
 * Copyright (c) 2024-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EventRecord } from '@privateaim/core-kit';
import { isLoggerUsable, useLogger } from '../logger';
import type { DomainEventPublishContext, IDomainEventPublisher } from './type';

export class DomainEventPublisher implements IDomainEventPublisher {
    protected publishers : Set<IDomainEventPublisher>;

    constructor() {
        this.publishers = new Set<IDomainEventPublisher>();
    }

    addPublisher(publisher: IDomainEventPublisher) {
        this.publishers.add(publisher);
    }

    async publish<T extends EventRecord>(
        ctx: DomainEventPublishContext<T>,
    ) : Promise<void> {
        if (isLoggerUsable()) {
            useLogger().info(`Publishing event ${ctx.data.event} for ${ctx.data.type}`);
        }

        const publishers = this.publishers.values();
        while (true) {
            const it = publishers.next();
            if (it.done) {
                return;
            }

            await it.value.publish(ctx);
        }
    }
}
