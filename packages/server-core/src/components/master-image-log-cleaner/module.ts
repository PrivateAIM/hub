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
import { MasterImageEventLogEntity } from '../../domains';

export function createMasterImageLogCleanerComponent() : Component {
    return {
        async start() {
            const dataSource = await useDataSource();
            const repository = dataSource.getRepository(MasterImageEventLogEntity);

            const execute = async () => {
                const isoDate = new Date().toISOString();

                await repository
                    .delete({
                        expires_at: LessThan(isoDate),
                    });
            };

            await execute();

            cron.schedule('0 1 * * *', async () => {
                await execute();
            });
        },
    };
}
