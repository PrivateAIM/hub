/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import {
    MasterImagesCommand,
    MasterImagesEvent,
    buildMasterImagesTaskQueueRouterPayload,
} from '@privateaim/server-analysis-manager-kit';
import type { Cache } from '@privateaim/server-kit';
import {
    isQueueRouterUsable, useCache, useQueueRouter,
} from '@privateaim/server-kit';
import { useDataSource } from 'typeorm-extension';
import { useEnv } from '../../config';
import { MasterImageEventLogEntity } from '../../domains';
import type { MasterImageServiceSynchronizeOptions } from './types';

export class MasterImageService {
    protected cache : Cache;

    protected cacheKey : string;

    // -------------------------------------------------

    constructor() {
        this.cache = useCache();
        this.cacheKey = 'master-images-synchronizing';
    }

    // -------------------------------------------------

    async synchronize(options: MasterImageServiceSynchronizeOptions = {}) {
        if (!isQueueRouterUsable()) {
            throw new BadRequestError('The master-images synchronize command could not be executed.');
        }

        const isActive = await this.cache.get(this.cacheKey);
        if (isActive) {
            throw new BadRequestError('A master images synchronization process is already in progress.');
        }

        const message = buildMasterImagesTaskQueueRouterPayload({
            command: MasterImagesCommand.SYNCHRONIZE,
            data: {
                owner: options.owner || useEnv('masterImagesOwner'),
                repository: options.repository || useEnv('masterImagesRepository'),
                branch: options.branch || useEnv('masterImagesBranch'),
            },
        });

        try {
            const client = useQueueRouter();
            await client.publish(message);

            await this.setIsSynchronizing(true);
        } catch (e) {
            await this.setIsSynchronizing(false);

            throw e;
        }
    }

    // -------------------------------------------------

    protected async setIsSynchronizing(state: boolean) {
        if (state) {
            await this.cache.set(this.cacheKey, true, {
                ttl: 1000 * 120,
            });
        } else {
            await this.cache.drop(this.cacheKey);
        }
    }

    // -------------------------------------------------

    async handleEvent(
        name: `${MasterImagesEvent}`,
        description?: string,
    ) {
        if (
            name === MasterImagesEvent.BUILD_FAILED ||
            name === MasterImagesEvent.PUSH_FAILED ||
            name === MasterImagesEvent.SYNCHRONIZED ||
            name === MasterImagesEvent.SYNCHRONIZATION_FAILED
        ) {
            await this.setIsSynchronizing(false);
        } else {
            await this.setIsSynchronizing(true);
        }

        await this.logEvent(name, description);
    }

    protected async logEvent(
        name: `${MasterImagesEvent}`,
        description?: string,
    ) {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(MasterImageEventLogEntity);

        // expires in 1 Week
        const expiresAtMs = Date.now() + (1000 * 60 * 60 * 24 * 7);

        const entity = repository.create({
            expiring: true,
            expires_at: new Date(expiresAtMs).toISOString(),
            name,
            description,
        });

        await repository.save(entity);
    }
}
