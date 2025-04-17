/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty, isObject } from '@privateaim/kit';
import type { MasterImagesEventContext } from '@privateaim/server-analysis-manager-kit';
import { MasterImagesEvent } from '@privateaim/server-analysis-manager-kit';
import { useDataSource } from 'typeorm-extension';
import { MasterImageEntity, MasterImageEventLogEntity } from '../../../domains';

export class MasterImageLoggerService {
    async logEvent(input: MasterImagesEventContext) {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(MasterImageEventLogEntity);

        // expires in 3 Days
        const expiresAtMs = Date.now() + (1000 * 60 * 60 * 24 * 3);

        // todo: add data if error

        const entity = repository.create({
            expiring: true,
            expires_at: new Date(expiresAtMs).toISOString(),
            name: `${input.event}`,
            data: this.buildEventData(input),
        });

        if (
            isObject(input.data) &&
            hasOwnProperty(input.data, 'id') &&
            typeof input.data.id === 'string'
        ) {
            entity.master_image_id = input.data.id;

            const masterImageRepository = dataSource.getRepository(MasterImageEntity);
            entity.master_image = await masterImageRepository.findOne({
                where: {
                    id: entity.master_image_id,
                },
            });
        }

        await repository.save(entity);
    }

    buildEventData(input: MasterImagesEventContext) {
        if (
            input.event === MasterImagesEvent.BUILD_FAILED ||
            input.event === MasterImagesEvent.PUSH_FAILED ||
            input.event === MasterImagesEvent.SYNCHRONIZATION_FAILED
        ) {
            return {
                error: input.data.error,
            };
        }

        if (
            input.event === MasterImagesEvent.BUILT ||
            input.event === MasterImagesEvent.PUSHING ||
            input.event === MasterImagesEvent.PUSHED
        ) {
            return {
                tags: input.data.tags,
            };
        }

        return undefined;
    }
}
