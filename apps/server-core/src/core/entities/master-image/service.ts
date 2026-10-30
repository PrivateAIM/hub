/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { eq } from '@rapiq/core';
import type { MasterImage } from '@privateaim/core-kit';
import { MasterImageCommand } from '@privateaim/core-kit';
import { PermissionName, ProcessStatus } from '@privateaim/kit';
import { BadRequestError, EntityNotFoundError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService, appendQueryConditions, scopeReadQuery  } from '@privateaim/server-kit';
import { decodeQuery } from '../../query/index.ts';
import { masterImageSchema } from './schema.ts';
import type {
    IMasterImageBuilderDispatcher,
    IMasterImageRepository,
    IMasterImageService,
    IMasterImageSynchronizerDispatcher,
} from './types.ts';

/**
 * Master images are a global catalog: any one of these grants reads every
 * image. The grant is checked, but results are not narrowed by realm.
 */
export const MASTER_IMAGE_READ_PERMISSIONS = [
    PermissionName.MASTER_IMAGE_READ,
    PermissionName.MASTER_IMAGE_MANAGE,
];

const MASTER_IMAGE_BUILD_CLAIM_STALE_MS = 15 * 60 * 1000;

type MasterImageServiceContext = {
    repository: IMasterImageRepository;
    synchronizerDispatcher: IMasterImageSynchronizerDispatcher;
    builderDispatcher: IMasterImageBuilderDispatcher;
    masterImagesConfig: {
        owner: string;
        repository: string;
        branch: string;
    };
};

export class MasterImageService extends AbstractEntityService implements IMasterImageService {
    protected repository: IMasterImageRepository;

    protected synchronizerDispatcher: IMasterImageSynchronizerDispatcher;

    protected builderDispatcher: IMasterImageBuilderDispatcher;

    protected masterImagesConfig: {
        owner: string;
        repository: string;
        branch: string
    };

    constructor(ctx: MasterImageServiceContext) {
        super();
        this.repository = ctx.repository;
        this.synchronizerDispatcher = ctx.synchronizerDispatcher;
        this.builderDispatcher = ctx.builderDispatcher;
        this.masterImagesConfig = ctx.masterImagesConfig;
    }

    async getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<MasterImage>> {
        const scoped = await scopeReadQuery(
            decodeQuery(query, { schema: masterImageSchema }),
            actor,
            { names: MASTER_IMAGE_READ_PERMISSIONS, compile: false },
        );

        return this.repository.findMany(scoped);
    }

    /**
     * `findOneById` takes no query, so an actor-supplied `fields`/`relations`
     * selection has to go through `findMany` with an `id` condition appended.
     */
    async getOne(id: string, actor: ActorContext, query?: Record<string, any>): Promise<MasterImage> {
        await actor.permissionEvaluator.preEvaluateOneOf({ name: MASTER_IMAGE_READ_PERMISSIONS });

        const entity = query ?
            await this.repository.findMany(appendQueryConditions(decodeQuery(query, { schema: masterImageSchema, parameters: ['fields', 'relations'] }), eq('id', id))).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'master-image' });
        }

        return entity;
    }

    async executeCommand(
        command: `${MasterImageCommand}`,
        data: Record<string, any>,
        actor: ActorContext,
    ): Promise<MasterImage | undefined> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.MASTER_IMAGE_MANAGE });

        switch (command) {
            case MasterImageCommand.SYNC: {
                await this.synchronizerDispatcher.dispatchExecute({
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

                // persist STARTING before dispatching, or a fast worker event
                // could be overwritten by this save.
                let previous: MasterImage['buildStatus'] = null;
                const entity = await this.repository.updateLocked(id, (locked) => {
                    // one STARTING owner at a time, so the rollback below can
                    // only revert its own claim. A claim older than the
                    // threshold is presumed dead (no worker event moved it on)
                    // and may be taken over — master images have no check
                    // command to recover it otherwise.
                    // ponytail: age-based, until the reconciler (plan 018 F14) exists.
                    if (
                        locked.buildStatus === ProcessStatus.STARTING &&
                        Date.now() - new Date(locked.updatedAt).getTime() < MASTER_IMAGE_BUILD_CLAIM_STALE_MS
                    ) {
                        throw new BadRequestError('The master image build is already starting.');
                    }

                    previous = locked.buildStatus;
                    locked.buildStatus = ProcessStatus.STARTING;

                    return true;
                });

                if (!entity) {
                    throw new EntityNotFoundError({ entity: 'master-image' });
                }

                try {
                    await this.builderDispatcher.dispatchExecute({ id: entity.id });
                } catch (e) {
                    // presumably nothing was dispatched, so no worker event will
                    // move STARTING on — but a publish can fail after the broker
                    // took the message, so revert only a row still STARTING.
                    await this.repository.updateLocked(id, (locked) => {
                        if (locked.buildStatus !== ProcessStatus.STARTING) {
                            return false;
                        }

                        locked.buildStatus = previous;

                        return true;
                    });

                    throw e;
                }

                return entity;
            }
            default: {
                throw new BadRequestError(`Unknown command: ${command}`);
            }
        }
    }

    async delete(id: string, actor: ActorContext): Promise<MasterImage> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.MASTER_IMAGE_MANAGE });

        const entity = await this.repository.findOneBy({ id });

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'master-image' });
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }
}
