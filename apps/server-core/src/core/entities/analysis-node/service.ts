/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { eq } from '@rapiq/core';
import type { Analysis, AnalysisNode } from '@privateaim/core-kit';
import { AnalysisNodeApprovalStatus, AnalysisNodeValidator, NodeType  } from '@privateaim/core-kit';
import {
    PermissionName,
    ProcessStatus,
    ValidatorGroup, 
    isRealmResourceWritable, 
} from '@privateaim/kit';
import { isPropertySet } from '@authup/kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
import { holdsPermission } from '../../utils/index.ts';
import { appendQueryConditions, decodeQuery } from '../../query/index.ts';
import { analysisNodeSchema } from './schema.ts';
import type { IProjectNodeRepository } from '../project-node/types.ts';
import type { AnalysisReachTarget, IAnalysisReachService } from '../../services/analysis-reach/index.ts';
import type { IAnalysisNodeMetadataRecalculator, IAnalysisNodeRepository, IAnalysisNodeService } from './types.ts';

type AnalysisNodeServiceContext = {
    repository: IAnalysisNodeRepository;
    analysisRepository: IEntityRepository<Analysis>;
    projectNodeRepository: IProjectNodeRepository;
    recalculator: IAnalysisNodeMetadataRecalculator;
    reach: IAnalysisReachService;
    skipAnalysisApproval?: boolean;
};

/**
 * Every row of an analysis is visible to whoever reaches the analysis (D2),
 * other nodes' rows included.
 */
const REACH_TARGET: AnalysisReachTarget = {
    analysisPath: 'analysis',
    analysisIdAttributeName: 'analysisId',
};

export class AnalysisNodeService extends AbstractEntityService implements IAnalysisNodeService {
    protected repository: IAnalysisNodeRepository;

    protected analysisRepository: IEntityRepository<Analysis>;

    protected projectNodeRepository: IProjectNodeRepository;

    protected recalculator: IAnalysisNodeMetadataRecalculator;

    protected reach: IAnalysisReachService;

    protected skipAnalysisApproval: boolean;

    protected validator: AnalysisNodeValidator;

    constructor(ctx: AnalysisNodeServiceContext) {
        super();
        this.repository = ctx.repository;
        this.analysisRepository = ctx.analysisRepository;
        this.projectNodeRepository = ctx.projectNodeRepository;
        this.recalculator = ctx.recalculator;
        this.reach = ctx.reach;
        this.skipAnalysisApproval = ctx.skipAnalysisApproval ?? false;
        this.validator = new AnalysisNodeValidator();
    }

    async getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<AnalysisNode>> {
        const decoded = decodeQuery(query, { schema: analysisNodeSchema });
        const condition = await this.reach.resolve(actor, REACH_TARGET);

        return this.repository.findMany(condition ? appendQueryConditions(decoded, condition) : decoded);
    }

    /** Reads through the same reach as {@link getMany}; out of reach answers 404. */
    async getOne(id: string, actor: ActorContext, query?: Record<string, any>): Promise<AnalysisNode> {
        const decoded = decodeQuery(query, { schema: analysisNodeSchema, parameters: ['fields', 'relations'] });
        const condition = await this.reach.resolve(actor, REACH_TARGET);

        const scoped = condition ? appendQueryConditions(decoded, condition) : decoded;
        const { data: [entity] } = await this.repository.findMany(appendQueryConditions(scoped, eq('id', id)));
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-node' });
        }

        return entity;
    }

    async create(data: Partial<AnalysisNode>, actor: ActorContext): Promise<AnalysisNode> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.ANALYSIS_UPDATE });

        await this.repository.validateJoinColumns(validated);

        validated.analysisRealmId = validated.analysis.realmId;
        validated.nodeRealmId = validated.node.realmId;

        if (validated.analysis.configurationLocked) {
            throw new BadRequestError('The analysis has already been locked and can therefore no longer be modified.');
        }

        const projectNode = await this.projectNodeRepository.findOneBy({
            projectId: validated.analysis.projectId,
            nodeId: validated.nodeId,
        });

        if (!projectNode) {
            throw new EntityNotFoundError('The referenced node is not part of the analysis project.');
        }

        // The node may already be assigned to the analysis — e.g. every approved project
        // node is auto-assigned when the analysis is created. Treat a repeated assignment
        // as an idempotent no-op instead of a unique-constraint conflict. The existing
        // relation (and its approval decision) is left untouched: field changes such as
        // approvalStatus or executionStatus must go through update(), which enforces the
        // node-authority permission checks. A recalc keeps the analysis metadata consistent.
        const existing = await this.repository.findOneBy({
            analysisId: validated.analysisId,
            nodeId: validated.nodeId,
        });

        if (existing) {
            await this.recalculator.recalc(existing.analysisId);

            return existing;
        }

        const entity = this.repository.create(validated);

        if (
            this.skipAnalysisApproval ||
            entity.node.type === NodeType.AGGREGATOR
        ) {
            entity.approvalStatus = AnalysisNodeApprovalStatus.APPROVED;
        }

        const saved = await this.repository.save(entity, { data: actor.metadata });

        await this.recalculator.recalc(saved.analysisId);

        return saved;
    }

    async update(id: string, data: Partial<AnalysisNode>, actor: ActorContext): Promise<AnalysisNode> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-node' });
        }

        const isAuthorityOfNode = isRealmResourceWritable(actor.realm, entity.nodeRealmId);
        const isAuthorityOfAnalysis = isRealmResourceWritable(actor.realm, entity.analysisRealmId);

        if (!isAuthorityOfNode && !isAuthorityOfAnalysis) {
            throw new PermissionDeniedError('You are neither part of the node nor analysis realm.');
        }

        const canUpdate = await holdsPermission(actor, PermissionName.ANALYSIS_UPDATE);
        const canApprove = await holdsPermission(actor, PermissionName.ANALYSIS_APPROVE);

        if (!canUpdate && !canApprove) {
            throw new PermissionDeniedError();
        }

        if (
            isPropertySet(validated, 'approvalStatus') ||
            isPropertySet(validated, 'comment')
        ) {
            if (!isAuthorityOfNode || !canApprove) {
                throw new PermissionDeniedError(
                    'You are either no authority of the node or you don\'t have the required permissions.',
                );
            }
        }

        // A node approves the built image (hash, size, OS), which does not
        // exist before the build has finished; a rejection is possible any time.
        // Only a change to approved is checked: clients re-send the full record.
        if (
            validated.approvalStatus === AnalysisNodeApprovalStatus.APPROVED &&
            entity.approvalStatus !== AnalysisNodeApprovalStatus.APPROVED
        ) {
            const analysis = await this.analysisRepository.findOneById(entity.analysisId);
            if (!analysis || analysis.buildStatus !== ProcessStatus.EXECUTED) {
                throw new BadRequestError('The analysis can only be approved once its image is built.');
            }
        }

        if (isPropertySet(validated, 'executionStatus')) {
            if (!isAuthorityOfNode || !canUpdate) {
                throw new PermissionDeniedError(
                    'You are either no authority of the node or you don\'t have the required permissions.',
                );
            }
        }

        const merged = this.repository.merge(entity, validated);

        const saved = await this.repository.save(merged, { data: actor.metadata });

        await this.recalculator.recalcDebounced(saved.analysisId);

        return saved;
    }

    async delete(id: string, actor: ActorContext): Promise<AnalysisNode> {
        await actor.permissionEvaluator.preEvaluateOneOf({
            name: [
                PermissionName.ANALYSIS_UPDATE,
                PermissionName.ANALYSIS_APPROVE,
            ],
        });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-node' });
        }

        if (
            !isRealmResourceWritable(actor.realm, entity.nodeRealmId) &&
            !isRealmResourceWritable(actor.realm, entity.analysisRealmId)
        ) {
            throw new PermissionDeniedError();
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        await this.recalculator.recalc(entity.analysisId);

        return entity;
    }
}
