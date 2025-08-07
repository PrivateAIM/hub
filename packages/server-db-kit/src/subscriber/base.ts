/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';
import { DomainEventName } from '@privateaim/kit';
import type {
    DomainEventDestinations, DomainEventDestinationsFn,
    DomainEventPublisher,
} from '@privateaim/server-kit';
import { useDomainEventPublisher } from '@privateaim/server-kit';
import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import type { BaseSubscriberContext, SubscriberPublishPayload } from './types';

export class BaseSubscriber<
    RECORD extends ObjectLiteral,
> implements EntitySubscriberInterface<RECORD> {
    protected publisher: DomainEventPublisher;

    protected destinations : DomainEventDestinations | DomainEventDestinationsFn<RECORD>;

    protected domain: string;

    constructor(ctx: BaseSubscriberContext<RECORD>) {
        this.domain = ctx.domain;
        this.publisher = useDomainEventPublisher();
        this.destinations = ctx.destinations;
    }

    async afterInsert(event: InsertEvent<RECORD>): Promise<any> {
        await this.publish({
            data: event.entity,
            type: DomainEventName.CREATED,
            metadata: event.queryRunner.data,
        });
    }

    async afterUpdate(event: UpdateEvent<RECORD>): Promise<any> {
        await this.publish({
            type: DomainEventName.UPDATED,
            data: event.entity as RECORD,
            dataPrevious: event.databaseEntity,
            metadata: event.queryRunner.data,
        });
    }

    async beforeRemove(event: RemoveEvent<RECORD>): Promise<any> {
        if (event.entity) {
            await this.publish({
                type: DomainEventName.DELETED,
                data: event.entity as RECORD,
                metadata: event.queryRunner.data,
            });
        }
    }

    async publish(payload: SubscriberPublishPayload<RECORD>) {
        await this.publisher.safePublish({
            data: payload.data,
            dataPrevious: payload.dataPrevious,
            metadata: {
                domain: this.domain,
                event: payload.type,
                ...(payload.metadata ? payload.metadata : {}),
            },
            destinations: this.destinations,
        });
    }
}
