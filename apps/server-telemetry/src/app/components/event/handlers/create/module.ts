/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler, ComponentHandlerContext, Logger } from '@privateaim/server-kit';
import { DAY_IN_MS } from '@privateaim/kit';
import { DomainType, EventValidator, LogFlag } from '@privateaim/telemetry-kit';
import { useDataSource } from 'typeorm-extension';
import type {
    EventComponentEventMap,
    EventCreateCommandPayload,
} from '@privateaim/server-telemetry-kit';
import {
    EventCommand,
    EventEvent,
} from '@privateaim/server-telemetry-kit';
import { EventEntity } from '../../../../../adapters/database/index.ts';
import { EVENT_RETENTION_DAYS_DEFAULT } from '../../../../../core/entities/event/constants.ts';

export class EventComponentCreateHandler implements ComponentHandler<
    EventComponentEventMap,
    EventCommand.CREATE
> {
    protected validator : EventValidator;

    protected logger: Logger | undefined;

    protected retentionDays: number;

    constructor(ctx?: { logger?: Logger, retentionDays?: number }) {
        this.validator = new EventValidator();
        this.logger = ctx?.logger;
        this.retentionDays = ctx?.retentionDays ?? EVENT_RETENTION_DAYS_DEFAULT;
    }

    async handle(
        value: EventCreateCommandPayload,
        context: ComponentHandlerContext<EventComponentEventMap, EventCommand.CREATE>,
    ): Promise<void> {
        try {
            await this.process(value, context);
        } catch (e) {
            this.logger?.error({
                message: e,
                command: EventCommand.CREATE,
                eventId: value.id,
                [LogFlag.REF_ID]: value.id,
                [LogFlag.REF_TYPE]: DomainType.EVENT,
            });

            await context.handle(
                EventEvent.CREATION_FAILED,
                {
                    id: value.id,
                    error: e,
                },
            );
        }
    }

    async process(
        value: EventCreateCommandPayload,
        context: ComponentHandlerContext<EventComponentEventMap, EventCommand.CREATE>,
    ) {
        await context.handle(
            EventEvent.CREATION_STARTED,
            value,
        );

        const data = await this.validator.run(value);

        // Retention belongs to the service that owns the table and runs the
        // sweep, not to the three producers publishing onto the bus. An explicit
        // `expiresAt` — or an explicit `expiring: false` — from the caller wins;
        // 0 days keeps rows forever. Stamped AFTER validation, so the trust
        // boundary stays intact.
        if (data.expiring !== false && (data.expiresAt || this.retentionDays > 0)) {
            // `expiring` is what the sweep predicate matches on, so it must be set
            // whenever an expiry exists — a publisher-supplied `expiresAt` with no
            // `expiring` would otherwise fall back to the column default `false`
            // and produce a row the cleaner can never delete.
            data.expiring = true;

            if (!data.expiresAt) {
                data.expiresAt = new Date(Date.now() + (this.retentionDays * DAY_IN_MS)).toISOString();
            }
        }

        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(EventEntity);

        const entity = repository.create(data);

        await repository.save(entity);

        await context.handle(
            EventEvent.CREATION_FINISHED,
            entity,
        );
    }
}
