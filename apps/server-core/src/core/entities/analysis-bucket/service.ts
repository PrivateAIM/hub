/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { eq } from '@rapiq/core';
import type { AnalysisBucket } from '@privateaim/core-kit';
import { AnalysisBucketType, AnalysisBucketValidator } from '@privateaim/core-kit';
import { PermissionName, ValidatorGroup } from '@privateaim/kit';
import { BadRequestError, EntityConflictError, EntityNotFoundError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService, appendQueryConditions } from '@privateaim/server-kit';
import { evaluateRecord, evaluateRecordUpdate } from '@authup/access';
import { decodeQuery } from '../../query/index.ts';
import { analysisBucketSchema } from './schema.ts';
import type { IAnalysisBucketRepository, IAnalysisBucketService } from './types.ts';
import type { IAnalysisRepository } from '../analysis/types.ts';
import type { AnalysisReach, AnalysisReachTarget, IAnalysisReachService } from '../../services/analysis-reach/index.ts';
import { buildAnalysisBucketTypeReach } from '../../services/analysis-reach/index.ts';

type AnalysisBucketServiceContext = {
    repository: IAnalysisBucketRepository;
    analysisRepository: IAnalysisRepository;
    reach: IAnalysisReachService;
};

const REACH_TARGET: AnalysisReachTarget = {
    analysisPath: 'analysis',
    analysisIdAttributeName: 'analysisId',
};

export class AnalysisBucketService extends AbstractEntityService implements IAnalysisBucketService {
    protected repository: IAnalysisBucketRepository;

    protected analysisRepository: IAnalysisRepository;

    protected reach: IAnalysisReachService;

    protected validator: AnalysisBucketValidator;

    constructor(ctx: AnalysisBucketServiceContext) {
        super();
        this.repository = ctx.repository;
        this.analysisRepository = ctx.analysisRepository;
        this.reach = ctx.reach;
        this.validator = new AnalysisBucketValidator();
    }

    async getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<AnalysisBucket>> {
        return this.reach.findMany(
            this.repository,
            decodeQuery(query, { schema: analysisBucketSchema }),
            await this.resolveReadReach(actor),
        );
    }

    /** Reads through the same reach as {@link getMany}; out of reach answers 404. */
    async getOne(id: string, actor: ActorContext, query?: Record<string, any>): Promise<AnalysisBucket> {
        const decoded = decodeQuery(query, { schema: analysisBucketSchema, parameters: ['fields', 'relations'] });

        const { data: [entity] } = await this.reach.findMany(
            this.repository,
            appendQueryConditions(decoded, eq('id', id)),
            await this.resolveReadReach(actor),
        );

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-bucket' });
        }

        return entity;
    }

    /** D2: CODE for every participant, RESULT and TEMP only through an approved node. */
    protected async resolveReadReach(actor: ActorContext): Promise<AnalysisReach> {
        return buildAnalysisBucketTypeReach('type', [
            {
                types: [AnalysisBucketType.CODE],
                reach: await this.reach.resolve(actor, REACH_TARGET),
            },
            {
                types: [AnalysisBucketType.RESULT, AnalysisBucketType.TEMP],
                reach: await this.reach.resolve(actor, REACH_TARGET, { approvedOnly: true }),
            },
        ]);
    }

    async create(data: Partial<AnalysisBucket>, actor: ActorContext): Promise<AnalysisBucket> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await this.repository.validateJoinColumns(validated);

        validated.realmId = validated.analysis.realmId;

        await this.assertOwner(actor, validated);

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

        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        const current = { ...entity };
        const merged = this.repository.merge(entity, validated);

        await this.assertOwnerUpdate(actor, current, merged);

        return this.repository.save(merged, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<AnalysisBucket> {
        const entity = await this.repository.findOneBy({ id });

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-bucket' });
        }

        await this.assertOwner(actor, entity);

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

    /** The bucket's realm is its analysis' (stamped on create). */
    protected async assertOwner(actor: ActorContext, bucket: Partial<AnalysisBucket>): Promise<void> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.ANALYSIS_UPDATE });
        await evaluateRecord(actor.permissionEvaluator, {
            name: PermissionName.ANALYSIS_UPDATE,
            realm: bucket.realmId,
            data: { attributes: bucket },
        });
    }

    /**
     * {@link assertOwner} for an update: the owner realm writes the bucket,
     * before and after. `current` must be a copy of the stored row taken
     * before `merge()`, which writes into the entity it merges into.
     */
    protected async assertOwnerUpdate(
        actor: ActorContext,
        current: Partial<AnalysisBucket>,
        next: Partial<AnalysisBucket>,
    ): Promise<void> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.ANALYSIS_UPDATE });
        await evaluateRecordUpdate(actor.permissionEvaluator, {
            name: PermissionName.ANALYSIS_UPDATE,
            current: { realm: current.realmId, data: { attributes: current } },
            next: { realm: next.realmId, data: { attributes: next } },
        });
    }
}
