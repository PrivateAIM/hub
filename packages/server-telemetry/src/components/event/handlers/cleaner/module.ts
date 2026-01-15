/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler } from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import cron from 'node-cron';
import { LessThan } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import type { EventCommand, EventComponentEventMap } from '@privateaim/server-telemetry-kit';
import { EventEntity } from '../../../../database/index.ts';

export class EventComponentCleanerHandler implements ComponentHandler<
EventComponentEventMap,
EventCommand.CLEAN
> {
    async initialize() : Promise<void> {
        await this.handle();

        cron.schedule('0 1 * * *', async () => {
            await this.handle();
        });
    }

    async handle(): Promise<void> {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(EventEntity);

        const isoDate = new Date().toISOString();

        useLogger().info(`Removing expired event entities before ${isoDate}`);

        const handleBatch = async (
            limit: number,
            offset: number = 0,
        ) : Promise<void> => {
            const [entities, total] = await repository.findAndCount({
                where: {
                    expiring: true,
                    expires_at: LessThan(isoDate),
                },
                take: limit,
                skip: offset,
            });

            await repository
                .remove(entities);

            const currentTotal = limit + offset;

            if (total > currentTotal) {
                return handleBatch(limit, currentTotal);
            }

            return Promise.resolve();
        };

        return handleBatch(100);
    }
}
