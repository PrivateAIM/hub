/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import cron from 'node-cron';
import type { Component } from '@privateaim/server-kit';
import { LessThan } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { EventEntity } from '../../database/domains/event';

export function createEventCleanerComponent() : Component {
    return {
        async start() {
            const dataSource = await useDataSource();
            const repository = dataSource.getRepository(EventEntity);

            const execute = async () => {
                const isoDate = new Date().toISOString();

                const entities = await repository.find({
                    where: {
                        expiring: true,
                        expires_at: LessThan(isoDate),
                    },
                });

                await repository
                    .remove(entities);
            };

            await execute();

            cron.schedule('0 1 * * *', async () => {
                await execute();
            });
        },
    };
}
