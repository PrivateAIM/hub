/*
 * Copyright (c) 2024-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';
import { buildDomainEventFullName } from '@privateaim/kit';
import { isLoggerUsable, useLogger } from '../logger';
import type { DomainEventPublishOptions, IDomainEventPublisher } from './types';

export class DomainEventPublisher implements IDomainEventPublisher {
    protected publishers : Set<IDomainEventPublisher>;

    constructor() {
        this.publishers = new Set<IDomainEventPublisher>();
    }

    addPublisher(publisher: IDomainEventPublisher) {
        this.publishers.add(publisher);
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
