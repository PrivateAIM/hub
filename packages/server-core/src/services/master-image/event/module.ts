/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import { hasOwnProperty, isObject } from '@privateaim/kit';
import type { MasterImagesEventContext } from '@privateaim/server-analysis-manager-kit';
import { MasterImagesEvent } from '@privateaim/server-analysis-manager-kit';
import { useDataSource } from 'typeorm-extension';
import { EventEntity } from '../../../database';

export class MasterImageEventService {
    async store(input: MasterImagesEventContext) {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(EventEntity);

        // expires in 3 Days
        const expiresAtMs = Date.now() + (1000 * 60 * 60 * 24 * 3);

        // todo: add data if error

        const entity = repository.create({
            expiring: true,
            expires_at: new Date(expiresAtMs).toISOString(),
            name: `${input.event}`,
            ref_type: DomainType.MASTER_IMAGE,
            data: this.buildEventData(input),
        });

        if (
            isObject(input.data) &&
            hasOwnProperty(input.data, 'id') &&
            typeof input.data.id === 'string'
        ) {
            entity.ref_id = input.data.id;
        }

        await repository.save(entity);
    }

    protected buildEventData(input: MasterImagesEventContext) {
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
