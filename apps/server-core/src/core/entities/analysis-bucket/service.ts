/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { eq } from '@rapiq/core';
import type { AnalysisBucket } from '@privateaim/core-kit';
import { AnalysisBucketType, AnalysisBucketValidator } from '@privateaim/core-kit';
import { PermissionName, ValidatorGroup, isRealmResourceWritable } from '@privateaim/kit';
import {
    BadRequestError,
    EntityConflictError,
    EntityNotFoundError,
    PermissionDeniedError,
} from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
import { appendQueryConditions, decodeQuery } from '../../query/index.ts';
import { analysisBucketSchema } from './schema.ts';
import type { IAnalysisBucketRepository, IAnalysisBucketService } from './types.ts';
import type { IAnalysisRepository } from '../analysis/types.ts';

type AnalysisBucketServiceContext = {
    repository: IAnalysisBucketRepository;
    analysisRepository: IAnalysisRepository;
};

export class AnalysisBucketService extends AbstractEntityService implements IAnalysisBucketService {
    protected repository: IAnalysisBucketRepository;

    protected analysisRepository: IAnalysisRepository;

    protected validator: AnalysisBucketValidator;

    constructor(ctx: AnalysisBucketServiceContext) {
        super();
        this.repository = ctx.repository;
        this.analysisRepository = ctx.analysisRepository;
        this.validator = new AnalysisBucketValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisBucket>> {
        return this.repository.findMany(decodeQuery(query, { schema: analysisBucketSchema }));
    }

    /**
     * `findOneById` takes no query, so an actor-supplied `fields`/`relations`
     * selection has to go through `findMany` with an `id` condition appended.
     */
    async getOne(id: string, query?: Record<string, any>): Promise<AnalysisBucket> {
        const entity = query ?
            await this.repository.findMany(appendQueryConditions(decodeQuery(query, { schema: analysisBucketSchema, parameters: ['fields', 'relations'] }), eq('id', id))).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-bucket' });
        }

        return entity;
    }

    async create(data: Partial<AnalysisBucket>, actor: ActorContext): Promise<AnalysisBucket> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await this.repository.validateJoinColumns(validated);

        validated.realmId = validated.analysis.realmId;

        await this.assertOwner(actor, validated.realmId);

        // one bucket per type and analysis, and a storage bucket bound to one analysis bucket:
        // consumers resolve a bucket by (analysisId, type) or by bucketId.
        if (
            await this.repository.findOneBy({ analysisId: validated.analysisId, type: validated.type }) ||
            await this.repository.findOneBy({ bucketId: validated.bucketId })
        ) {
            throw new EntityConflictError({ entity: 'analysis-bucket' });
        }

        const entity = this.repository.create(validated);

        return this.repository.save(entity, { data: actor.metadata });
    }

    async update(id: string, data: Partial<AnalysisBucket>, actor: ActorContext): Promise<AnalysisBucket> {
        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-bucket' });
        }

        await this.assertOwner(actor, entity.realmId);

        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        const merged = this.repository.merge(entity, validated);

        return this.repository.save(merged, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<AnalysisBucket> {
        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-bucket' });
        }

        await this.assertOwner(actor, entity.realmId);

        if (entity.type === AnalysisBucketType.CODE) {
            const analysis = await this.analysisRepository.findOneById(entity.analysisId);
            if (analysis?.configurationLocked) {
                throw new BadRequestError('The analysis has already been locked and can therefore no longer be modified.');
            }
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }

    protected async assertOwner(actor: ActorContext, realmId: string): Promise<void> {
        if (!isRealmResourceWritable(actor.realm, realmId)) {
            throw new PermissionDeniedError();
        }

        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.ANALYSIS_UPDATE });
    }
}
