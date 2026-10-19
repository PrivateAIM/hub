/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition, IQuery } from '@rapiq/core';
import { and, eq } from '@rapiq/core';
import type { Analysis, AnalysisBucket, AnalysisBucketFile } from '@privateaim/core-kit';
import { AnalysisBucketFileValidator, AnalysisBucketType, AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { PermissionName, ValidatorGroup } from '@privateaim/kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService, appendQueryConditions } from '@privateaim/server-kit';
import {
    evaluateRecord,
    evaluateRecordUpdate,
    hasUnboundedReach,
    isPermissionError,
} from '@authup/access';
import type { BucketFile } from '@privateaim/storage-kit';
import type {
    AnalysisBucketUploadRemoval,
    AnalysisBucketUploadResult,
    IAnalysisBucketFileRepository,
    IAnalysisBucketFileService,
    IAnalysisFileMetadataRecalculator,
} from './types.ts';
import { decodeQuery } from '../../query/index.ts';
import { analysisBucketFileSchema } from './schema.ts';
import type { IAnalysisRepository } from '../analysis/types.ts';
import type { IAnalysisBucketRepository } from '../analysis-bucket/types.ts';
import type { IAnalysisNodeRepository } from '../analysis-node/types.ts';
import type { AnalysisReachTarget, IAnalysisReachService } from '../../services/analysis-reach/index.ts';
import { buildAnalysisBucketTypeReach } from '../../services/analysis-reach/index.ts';

type AnalysisBucketFileServiceContext = {
    repository: IAnalysisBucketFileRepository;
    recalculator: IAnalysisFileMetadataRecalculator;
    analysisRepository: IAnalysisRepository;
    analysisBucketRepository: IAnalysisBucketRepository;
    analysisNodeRepository: IAnalysisNodeRepository;
    reach: IAnalysisReachService;
};

const REACH_TARGET: AnalysisReachTarget = {
    analysisPath: 'analysis',
    analysisIdAttributeName: 'analysisId',
};

export class AnalysisBucketFileService extends AbstractEntityService implements IAnalysisBucketFileService {
    protected repository: IAnalysisBucketFileRepository;

    protected recalculator: IAnalysisFileMetadataRecalculator;

    protected analysisRepository: IAnalysisRepository;

    protected analysisBucketRepository: IAnalysisBucketRepository;

    protected analysisNodeRepository: IAnalysisNodeRepository;

    protected reach: IAnalysisReachService;

    protected validator: AnalysisBucketFileValidator;

    constructor(ctx: AnalysisBucketFileServiceContext) {
        super();
        this.repository = ctx.repository;
        this.recalculator = ctx.recalculator;
        this.analysisRepository = ctx.analysisRepository;
        this.analysisBucketRepository = ctx.analysisBucketRepository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.reach = ctx.reach;
        this.validator = new AnalysisBucketFileValidator();
    }

    async getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<AnalysisBucketFile>> {
        return this.repository.findMany(await this.scopeRead(decodeQuery(query, { schema: analysisBucketFileSchema }), actor));
    }

    /** Reads through the same reach as {@link getMany}; out of reach answers 404. */
    async getOne(id: string, actor: ActorContext, query?: Record<string, any>): Promise<AnalysisBucketFile> {
        const scoped = await this.scopeRead(
            decodeQuery(query, { schema: analysisBucketFileSchema, parameters: ['fields', 'relations'] }),
            actor,
        );

        const { data: [entity] } = await this.repository.findMany(appendQueryConditions(scoped, eq('id', id)));
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-bucket-file' });
        }

        return entity;
    }

    /**
     * D2/D6: CODE files for every participant, TEMP files only through an
     * approved node, RESULT files additionally only with ANALYSIS_RESULT_READ
     * — narrowed further by that grant's own reach. Without it, RESULT files are
     * left out rather than refused, so listings of the other types still work.
     */
    protected async scopeRead(query: IQuery, actor: ActorContext): Promise<IQuery> {
        const code = await this.reach.resolve(actor, REACH_TARGET);
        const temp = await this.reach.resolve(actor, REACH_TARGET, { approvedOnly: true });

        let result: ICondition | undefined | null;
        try {
            result = await this.reach.resolve(actor, REACH_TARGET, {
                names: [PermissionName.ANALYSIS_RESULT_READ],
                approvedOnly: true,
            });
        } catch (e) {
            if (!isPermissionError(e)) {
                throw e;
            }

            result = null;
        }

        // The result read narrows the approved-participant reach, never widens
        // it: a file's analysis must stay readable whenever the file is (D7).
        if (result !== null && temp !== undefined) {
            result = result === undefined ? temp : and(temp, result);
        }

        const condition = buildAnalysisBucketTypeReach('analysisBucket.type', [
            { types: [AnalysisBucketType.CODE], reach: code },
            { types: [AnalysisBucketType.TEMP], reach: temp },
            { types: [AnalysisBucketType.RESULT], reach: result },
        ]);

        return condition ? appendQueryConditions(query, condition) : query;
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
            await this.assertOwner(actor, analysis, validated);
            this.assertUnlocked(analysis);
        } else if (
            !await this.isSystem(actor) &&
            !await this.isParticipantUploader(analysis, {
                realmId: this.getActorRealmId(actor),
                clientId: actor.identity.type === 'client' ? actor.identity.id : undefined,
            })
        ) {
            throw new PermissionDeniedError();
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

        // The analysis' realm writes the file, before and after (D3). The stored
        // row is snapshotted, since typeorm's merge() writes into `entity`.
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.ANALYSIS_UPDATE });
        const current = { realm: analysis.realmId, data: { attributes: { ...entity } } };
        const merged = this.repository.merge(entity, validated);
        await evaluateRecordUpdate(actor.permissionEvaluator, {
            name: PermissionName.ANALYSIS_UPDATE,
            current,
            next: { realm: analysis.realmId, data: { attributes: merged } },
        });

        await this.assertBucketWritable(actor, bucket, analysis);

        if (validated.root && bucket.type !== AnalysisBucketType.CODE) {
            throw new BadRequestError('Only a code file can be the root file.');
        }

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
        await this.assertOwner(actor, analysis, entity);
        await this.assertBucketWritable(actor, bucket, analysis);

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        if (entity.root) {
            await this.recalculator.recalc(entity.analysisId);
        }

        return entity;
    }

    /**
     * Register a file uploaded directly to storage. The upload reached storage
     * unchecked, so the write rules are applied here.
     *
     * ponytail: realm-level only — the uploader's ANALYSIS_UPDATE grant and
     * reach need its token, which the storage event does not carry
     * (plan 012 capability tokens).
     */
    async registerUpload(file: BucketFile): Promise<AnalysisBucketUploadResult | null> {
        const bucket = await this.analysisBucketRepository.findOneBy({ bucketId: file.bucketId });
        if (!bucket) {
            return null;
        }

        const rejection = await this.rejectUpload(file, bucket);
        if (rejection) {
            return { bucket, rejection };
        }

        const entity = this.repository.create({
            path: file.path,
            analysisBucketId: bucket.id,
            analysisId: bucket.analysisId,
            realmId: bucket.realmId,
            bucketFileId: file.id,
            bucketId: file.bucketId,
            ...(file.actorType === 'user' ? { userId: file.actorId } : {}),
            ...(file.actorType === 'client' ? { clientId: file.actorId } : {}),
        });

        return { bucket, entity: await this.repository.save(entity) };
    }

    /**
     * Mirror a storage-side delete. ponytail: storage lets the uploader delete its
     * own object and knows nothing of the lock, so a frozen code file can only be
     * reported, not kept — enforcing it needs a storage-side gate (plan 012).
     */
    async unregisterUpload(bucketId: string, bucketFileId: string): Promise<AnalysisBucketUploadRemoval | null> {
        // bucketFileId alone is caller-supplied on HTTP create, so it is not unique.
        const entity = await this.repository.findOneBy({ bucketId, bucketFileId });
        if (!entity) {
            return null;
        }

        const bucket = await this.analysisBucketRepository.findOneById(entity.analysisBucketId);
        const analysis = bucket?.type === AnalysisBucketType.CODE ?
            await this.analysisRepository.findOneById(entity.analysisId) :
            null;

        await this.repository.remove(entity);

        if (entity.root) {
            await this.recalculator.recalc(entity.analysisId);
        }

        return { entity, frozen: !!analysis?.configurationLocked };
    }

    protected async rejectUpload(file: BucketFile, bucket: AnalysisBucket): Promise<string | undefined> {
        if (bucket.type === AnalysisBucketType.CODE) {
            if (file.realmId !== bucket.realmId) {
                return 'the uploader is not in the analysis realm';
            }

            const analysis = await this.analysisRepository.findOneById(bucket.analysisId);
            return analysis?.configurationLocked ? 'the analysis configuration is locked' : undefined;
        }

        const analysis = await this.analysisRepository.findOneById(bucket.analysisId);
        const participant = analysis && await this.isParticipantUploader(analysis, {
            realmId: file.realmId,
            clientId: file.actorType === 'client' ? file.actorId : undefined,
        });

        return participant ? undefined : 'the uploader is neither an approved analysis node nor the analysis client';
    }

    /**
     * Interim RESULT/TEMP participation rule until plan 021: the analysis' own
     * client (it sits in the owner realm, so it participates by binding — D8),
     * or the realm of an approved analysis node.
     */
    protected async isParticipantUploader(
        analysis: Analysis,
        uploader: { realmId?: string | null, clientId?: string },
    ): Promise<boolean> {
        if (uploader.clientId && analysis.clientId === uploader.clientId) {
            return true;
        }

        // typeorm drops an undefined key, which would match any approved node.
        if (!uploader.realmId) {
            return false;
        }

        const participant = await this.analysisNodeRepository.findOneBy({
            analysisId: analysis.id,
            nodeRealmId: uploader.realmId,
            approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
        });

        return !!participant;
    }

    protected async resolveScope(analysisBucketId: string): Promise<{ bucket: AnalysisBucket, analysis: Analysis }> {
        const bucket = await this.analysisBucketRepository.findOneById(analysisBucketId);
        const analysis = bucket ? await this.analysisRepository.findOneById(bucket.analysisId) : null;
        if (!bucket || !analysis) {
            throw new EntityNotFoundError({ entity: 'analysis-bucket' });
        }

        return { bucket, analysis };
    }

    /** The system: a grant reaching every realm unconditionally (plan 021, Q4). */
    protected async isSystem(actor: ActorContext): Promise<boolean> {
        return hasUnboundedReach(actor.permissionEvaluator, PermissionName.ANALYSIS_UPDATE);
    }

    /** The analysis' realm writes the file, whichever realm uploaded it (D3). */
    protected async assertOwner(actor: ActorContext, analysis: Analysis, file: Partial<AnalysisBucketFile>): Promise<void> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.ANALYSIS_UPDATE });
        await evaluateRecord(actor.permissionEvaluator, {
            name: PermissionName.ANALYSIS_UPDATE,
            realm: analysis.realmId,
            data: { attributes: file },
        });
    }

    protected assertUnlocked(analysis: Analysis): void {
        if (analysis.configurationLocked) {
            throw new BadRequestError('The analysis has already been locked and can therefore no longer be modified.');
        }
    }

    /**
     * Code files are frozen with the configuration; temp files belong to the
     * system alone.
     */
    protected async assertBucketWritable(actor: ActorContext, bucket: AnalysisBucket, analysis: Analysis): Promise<void> {
        if (bucket.type === AnalysisBucketType.CODE) {
            this.assertUnlocked(analysis);
        }

        if (bucket.type === AnalysisBucketType.TEMP && !await this.isSystem(actor)) {
            throw new PermissionDeniedError();
        }
    }
}
