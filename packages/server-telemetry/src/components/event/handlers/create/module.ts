/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import { DomainType, EventValidator, LogFlag } from '@privateaim/telemetry-kit';
import { useDataSource } from 'typeorm-extension';
import type {
    EventComponentEventMap,
    EventCreateCommandPayload,
} from '@privateaim/server-telemetry-kit';
import {
    EventCommand, EventEvent,
} from '@privateaim/server-telemetry-kit';
import { EventEntity } from '../../../../database/index.ts';

export class EventComponentCreateHandler implements ComponentHandler<
EventComponentEventMap,
EventCommand.CREATE
> {
    protected validator : EventValidator;

    constructor() {
        this.validator = new EventValidator();
    }

    async handle(
        value: EventCreateCommandPayload,
        context: ComponentHandlerContext<EventComponentEventMap, EventCommand.CREATE>,
    ): Promise<void> {
        try {
            await this.process(value, context);
        } catch (e) {
            useLogger().error({
                message: e,
                command: EventCommand.CREATE,
                event_id: value.id,
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
