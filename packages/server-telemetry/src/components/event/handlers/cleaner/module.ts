/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler } from '@privateaim/server-kit';
import cron from 'node-cron';
import { LessThan } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import type { EventCommand } from '@privateaim/server-telemetry-kit';
import { EventEntity } from '../../../../database';

export class EventComponentCleanerHandler implements ComponentHandler<
EventCommand.CLEAN
> {
    async setup() : Promise<void> {
        await this.handle();

        cron.schedule('0 1 * * *', async () => {
            await this.handle();
        });
    }

    async handle(): Promise<void> {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(EventEntity);

        const isoDate = new Date().toISOString();

        const entities = await repository.find({
            where: {
                expiring: true,
                expires_at: LessThan(isoDate),
            },
        });

        await repository
            .remove(entities);
    }
}
