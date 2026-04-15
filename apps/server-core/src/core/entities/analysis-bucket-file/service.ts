/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile } from '@privateaim/core-kit';
import { isRealmResourceWritable } from '@privateaim/kit';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult } from '../types.ts';
import { ValidatorGroup } from '../constants.ts';
import { AbstractEntityService } from '../service.ts';
import type { IAnalysisBucketFileRepository, IAnalysisBucketFileService } from './types.ts';
import { AnalysisBucketFileValidator } from './validator.ts';

type AnalysisBucketFileServiceContext = {
    repository: IAnalysisBucketFileRepository;
};

export class AnalysisBucketFileService extends AbstractEntityService implements IAnalysisBucketFileService {
    protected repository: IAnalysisBucketFileRepository;

    protected validator: AnalysisBucketFileValidator;

    constructor(ctx: AnalysisBucketFileServiceContext) {
        super();
        this.repository = ctx.repository;
        this.validator = new AnalysisBucketFileValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisBucketFile>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string): Promise<AnalysisBucketFile> {
        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async create(data: Partial<AnalysisBucketFile>, actor: ActorContext): Promise<AnalysisBucketFile> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        if (!actor.identity) {
            throw new BadRequestError('An identity is required.');
        }

        await this.repository.validateJoinColumns(validated);

        validated.realm_id = this.getActorRealmId(actor);

        if (!isRealmResourceWritable(actor.realm, validated.realm_id)) {
            throw new ForbiddenError();
        }

        // Set analysis_id from the related analysis_bucket
        if ((validated as any).analysis_bucket?.analysis_id) {
            validated.analysis_id = (validated as any).analysis_bucket.analysis_id;
        }

        switch (actor.identity.type) {
            case 'user': {
                validated.user_id = actor.identity.id;
                break;
            }
            case 'robot': {
                validated.robot_id = actor.identity.id;
                break;
            }
            case 'client': {
                validated.client_id = actor.identity.id;
                break;
            }
            default: {
                throw new BadRequestError('Only client-, user- or robot-accounts are permitted.');
            }
        }

        const entity = this.repository.create(validated);

        return this.repository.save(entity, { data: actor.metadata });
    }

    async update(id: string, data: Partial<AnalysisBucketFile>, actor: ActorContext): Promise<AnalysisBucketFile> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new ForbiddenError();
        }

        const merged = this.repository.merge(entity, validated);

        return this.repository.save(merged, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<AnalysisBucketFile> {
        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new ForbiddenError();
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }
}
