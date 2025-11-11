/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler } from '@privateaim/server-kit';
import { EventValidator } from '@privateaim/telemetry-kit';
import { useDataSource } from 'typeorm-extension';
import type {
    EventCreateCommandPayload,
} from '@privateaim/server-telemetry-kit';
import { EventEntity } from '../../../../database';

export class EventComponentCreateHandler implements ComponentHandler {
    protected validator : EventValidator;

    constructor() {
        this.validator = new EventValidator();
    }

    async handle(
        input: EventCreateCommandPayload,
    ): Promise<void> {
        const data = await this.validator.run(input);

        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(EventEntity);

        const entity = repository.create(data);

        await repository.save(entity);
    }
}
