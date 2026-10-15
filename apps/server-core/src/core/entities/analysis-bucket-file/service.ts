/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { eq } from '@rapiq/core';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import type { Analysis, AnalysisBucket, AnalysisBucketFile } from '@privateaim/core-kit';
import { AnalysisBucketFileValidator, AnalysisBucketType, AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { PermissionName, ValidatorGroup, isRealmResourceWritable } from '@privateaim/kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
import type { IAnalysisBucketFileRepository, IAnalysisBucketFileService, IAnalysisFileMetadataRecalculator } from './types.ts';
import { appendQueryConditions, decodeQuery } from '../../query/index.ts';
import { analysisBucketFileSchema } from './schema.ts';
import type { IAnalysisRepository } from '../analysis/types.ts';
import type { IAnalysisBucketRepository } from '../analysis-bucket/types.ts';
import type { IAnalysisNodeRepository } from '../analysis-node/types.ts';

type AnalysisBucketFileServiceContext = {
    repository: IAnalysisBucketFileRepository;
    recalculator: IAnalysisFileMetadataRecalculator;
    analysisRepository: IAnalysisRepository;
    analysisBucketRepository: IAnalysisBucketRepository;
    analysisNodeRepository: IAnalysisNodeRepository;
};

export class AnalysisBucketFileService extends AbstractEntityService implements IAnalysisBucketFileService {
    protected repository: IAnalysisBucketFileRepository;

    protected recalculator: IAnalysisFileMetadataRecalculator;

    protected analysisRepository: IAnalysisRepository;

    protected analysisBucketRepository: IAnalysisBucketRepository;

    protected analysisNodeRepository: IAnalysisNodeRepository;

    protected validator: AnalysisBucketFileValidator;

    constructor(ctx: AnalysisBucketFileServiceContext) {
        super();
        this.repository = ctx.repository;
        this.recalculator = ctx.recalculator;
        this.analysisRepository = ctx.analysisRepository;
        this.analysisBucketRepository = ctx.analysisBucketRepository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.validator = new AnalysisBucketFileValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisBucketFile>> {
        return this.repository.findMany(decodeQuery(query, { schema: analysisBucketFileSchema }));
    }

    /**
     * `findOneById` takes no query, so an actor-supplied `fields`/`relations`
     * selection has to go through `findMany` with an `id` condition appended.
     */
    async getOne(id: string, query?: Record<string, any>): Promise<AnalysisBucketFile> {
        const entity = query ?
            await this.repository.findMany(appendQueryConditions(decodeQuery(query, { schema: analysisBucketFileSchema, parameters: ['fields', 'relations'] }), eq('id', id))).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-bucket-file' });
        }

        return entity;
    }

    async create(data: Partial<AnalysisBucketFile>, actor: ActorContext): Promise<AnalysisBucketFile> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        if (!actor.identity) {
            throw new BadRequestError('An identity is required.');
        }

        await this.repository.validateJoinColumns(validated);

        const { bucket, analysis } = await this.resolveScope(validated.analysisBucketId);
        validated.realmId = bucket.realmId;
        validated.analysisId = bucket.analysisId;

        if (bucket.type === AnalysisBucketType.CODE) {
            await this.assertOwner(actor, analysis);
            this.assertUnlocked(analysis);
        } else if (!this.isMaster(actor)) {
            // interim participation rule until plan 021: the realm of an approved analysis node.
            const realmId = this.getActorRealmId(actor);
            const participant = realmId && await this.analysisNodeRepository.findOneBy({
                analysisId: analysis.id,
                nodeRealmId: realmId,
                approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
            });
            if (!participant) {
                throw new PermissionDeniedError();
            }
        }

        if (validated.root && bucket.type !== AnalysisBucketType.CODE) {
            throw new BadRequestError('Only a code file can be the root file.');
        }

        // ponytail: bucketFileId can only be bound to the bucket by asking storage.
        if (validated.bucketId !== bucket.bucketId) {
            throw new BadRequestError('The storage bucket does not belong to the analysis bucket.');
        }

        switch (actor.identity.type) {
            case 'user': {
                validated.userId = actor.identity.id;
                break;
            }
            case 'client': {
                validated.clientId = actor.identity.id;
                break;
            }
            default: {
                throw new BadRequestError('Only client- or user-accounts are permitted.');
            }
        }

        const entity = this.repository.create(validated);

        const saved = await this.repository.save(entity, { data: actor.metadata });

        if (saved.root) {
            await this.recalculator.recalc(saved.analysisId);
        }

        return saved;
    }

    async update(id: string, data: Partial<AnalysisBucketFile>, actor: ActorContext): Promise<AnalysisBucketFile> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-bucket-file' });
        }

        const { bucket, analysis } = await this.resolveScope(entity.analysisBucketId);
        await this.assertOwner(actor, analysis);
        this.assertBucketWritable(actor, bucket, analysis);

        if (validated.root && bucket.type !== AnalysisBucketType.CODE) {
            throw new BadRequestError('Only a code file can be the root file.');
        }

        const merged = this.repository.merge(entity, validated);

        const saved = await this.repository.save(merged, { data: actor.metadata });

        await this.recalculator.recalcDebounced(saved.analysisId);

        return saved;
    }

    async delete(id: string, actor: ActorContext): Promise<AnalysisBucketFile> {
        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-bucket-file' });
        }

        // ponytail: a node deleting its OWN result upload needs the plan-021 client binding.
        const { bucket, analysis } = await this.resolveScope(entity.analysisBucketId);
        await this.assertOwner(actor, analysis);
        this.assertBucketWritable(actor, bucket, analysis);

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        if (entity.root) {
            await this.recalculator.recalc(entity.analysisId);
        }

        return entity;
    }

    protected async resolveScope(analysisBucketId: string): Promise<{ bucket: AnalysisBucket, analysis: Analysis }> {
        const bucket = await this.analysisBucketRepository.findOneById(analysisBucketId);
        const analysis = bucket ? await this.analysisRepository.findOneById(bucket.analysisId) : null;
        if (!bucket || !analysis) {
            throw new EntityNotFoundError({ entity: 'analysis-bucket' });
        }

        return { bucket, analysis };
    }

    protected isMaster(actor: ActorContext): boolean {
        return actor.realm?.name === REALM_MASTER_NAME;
    }

    protected async assertOwner(actor: ActorContext, analysis: Analysis): Promise<void> {
        if (!isRealmResourceWritable(actor.realm, analysis.realmId)) {
            throw new PermissionDeniedError();
        }

        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.ANALYSIS_UPDATE });
    }

    protected assertUnlocked(analysis: Analysis): void {
        if (analysis.configurationLocked) {
            throw new BadRequestError('The analysis has already been locked and can therefore no longer be modified.');
        }
    }

    /**
     * Code files are frozen with the configuration; temp files belong to the
     * system (master realm) alone.
     */
    protected assertBucketWritable(actor: ActorContext, bucket: AnalysisBucket, analysis: Analysis): void {
        if (bucket.type === AnalysisBucketType.CODE) {
            this.assertUnlocked(analysis);
        }

        if (bucket.type === AnalysisBucketType.TEMP && !this.isMaster(actor)) {
            throw new PermissionDeniedError();
        }
    }
}
