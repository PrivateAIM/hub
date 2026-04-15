/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage } from '@privateaim/core-kit';
import { MasterImageCommand } from '@privateaim/core-kit';
import { PermissionName, ProcessStatus } from '@privateaim/kit';
import { BadRequestError, NotFoundError } from '@ebec/http';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult } from '../types.ts';
import { AbstractEntityService } from '../service.ts';
import type {
    IMasterImageBuilderCaller,
    IMasterImageRepository,
    IMasterImageService,
    IMasterImageSynchronizerCaller,
} from './types.ts';

type MasterImageServiceContext = {
    repository: IMasterImageRepository;
    synchronizerCaller: IMasterImageSynchronizerCaller;
    builderCaller: IMasterImageBuilderCaller;
    masterImagesConfig: {
        owner: string;
        repository: string;
        branch: string;
    };
};

export class MasterImageService extends AbstractEntityService implements IMasterImageService {
    protected repository: IMasterImageRepository;

    protected synchronizerCaller: IMasterImageSynchronizerCaller;

    protected builderCaller: IMasterImageBuilderCaller;

    protected masterImagesConfig: {
        owner: string; 
        repository: string; 
        branch: string 
    };

    constructor(ctx: MasterImageServiceContext) {
        super();
        this.repository = ctx.repository;
        this.synchronizerCaller = ctx.synchronizerCaller;
        this.builderCaller = ctx.builderCaller;
        this.masterImagesConfig = ctx.masterImagesConfig;
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<MasterImage>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string): Promise<MasterImage> {
        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async executeCommand(
        command: `${MasterImageCommand}`,
        data: Record<string, any>,
        actor: ActorContext,
    ): Promise<MasterImage | undefined> {
        await actor.permissionChecker.preCheck({ name: PermissionName.MASTER_IMAGE_MANAGE });

        switch (command) {
            case MasterImageCommand.SYNC: {
                await this.synchronizerCaller.callExecute({
                    owner: this.masterImagesConfig.owner,
                    repository: this.masterImagesConfig.repository,
                    branch: this.masterImagesConfig.branch,
                });
                return undefined;
            }
            case MasterImageCommand.BUILD: {
                const id = data.id as string;
                if (typeof id !== 'string' || id.length === 0) {
                    throw new BadRequestError('A valid master image id is required.');
                }

                const entity = await this.repository.findOneBy({ id });
                if (!entity) {
                    throw new NotFoundError();
                }

                entity.build_status = ProcessStatus.STARTING;
                await this.builderCaller.callExecute({ id: entity.id });
                await this.repository.save(entity);

                return entity;
            }
            default: {
                throw new BadRequestError(`Unknown command: ${command}`);
            }
        }
    }

    async delete(id: string, actor: ActorContext): Promise<MasterImage> {
        await actor.permissionChecker.preCheck({ name: PermissionName.MASTER_IMAGE_MANAGE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }
}
