/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MasterImagesEventContext,
} from '@privateaim/server-analysis-manager-kit';
import { useDataSource } from 'typeorm-extension';
import { MasterImageEventLogEntity } from '../../../domains';

export class MasterImageLoggerService {
    async logEvent(ctx: MasterImagesEventContext) {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(MasterImageEventLogEntity);

        // expires in 1 Week
        const expiresAtMs = Date.now() + (1000 * 60 * 60 * 24 * 7);

        const entity = repository.create({
            expiring: true,
            expires_at: new Date(expiresAtMs).toISOString(),
            name: `${ctx.event}`,
            data: ctx.data,
        });

        await repository.save(entity);
    }
}
