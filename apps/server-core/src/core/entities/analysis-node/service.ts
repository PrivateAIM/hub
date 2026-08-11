/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { eq } from '@rapiq/core';
import type { AnalysisNode } from '@privateaim/core-kit';
import { AnalysisNodeApprovalStatus, AnalysisNodeValidator, NodeType  } from '@privateaim/core-kit';
import {
    PermissionName,
    ValidatorGroup, 
    isRealmResourceWritable, 
} from '@privateaim/kit';
import { isPropertySet } from '@authup/kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
import { appendQueryConditions, decodeQuery } from '../../query/index.ts';
import { analysisNodeSchema } from './schema.ts';
import type { IProjectNodeRepository } from '../project-node/types.ts';
import type { IAnalysisNodeMetadataRecalculator, IAnalysisNodeRepository, IAnalysisNodeService } from './types.ts';

type AnalysisNodeServiceContext = {
    repository: IAnalysisNodeRepository;
    projectNodeRepository: IProjectNodeRepository;
    recalculator: IAnalysisNodeMetadataRecalculator;
    skipAnalysisApproval?: boolean;
};

export class AnalysisNodeService extends AbstractEntityService implements IAnalysisNodeService {
    protected repository: IAnalysisNodeRepository;

    protected projectNodeRepository: IProjectNodeRepository;

    protected recalculator: IAnalysisNodeMetadataRecalculator;

    protected skipAnalysisApproval: boolean;

    protected validator: AnalysisNodeValidator;

    constructor(ctx: AnalysisNodeServiceContext) {
        super();
        this.repository = ctx.repository;
        this.projectNodeRepository = ctx.projectNodeRepository;
        this.recalculator = ctx.recalculator;
        this.skipAnalysisApproval = ctx.skipAnalysisApproval ?? false;
        this.validator = new AnalysisNodeValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisNode>> {
        return this.repository.findMany(decodeQuery(query, { schema: analysisNodeSchema }));
    }

    /**
     * `findOneById` takes no query, so an actor-supplied `fields`/`relations`
     * selection has to go through `findMany` with an `id` condition appended.
     */
    async getOne(id: string, query?: Record<string, any>): Promise<AnalysisNode> {
        const entity = query ?
            await this.repository.findMany(appendQueryConditions(decodeQuery(query, { schema: analysisNodeSchema, parameters: ['fields', 'relations'] }), eq('id', id))).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-node' });
        }

        return entity;
    }

    async create(data: Partial<AnalysisNode>, actor: ActorContext): Promise<AnalysisNode> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

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

        let canUpdate = false;
        try {
            await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });
            canUpdate = true;
        } catch {
            // do nothing
        }
        let canApprove = false;
        try {
            await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_APPROVE });
            canApprove = true;
        } catch {
            // do nothing
        }

        if (!canUpdate && !canApprove) {
            throw new PermissionDeniedError();
        }

        if (
            isPropertySet(validated, 'approvalStatus') ||
            isPropertySet(validated, 'comment')
        ) {
            if (!isAuthorityOfNode || !canApprove) {
                throw new BadRequestError(
                    'You are either no authority of the node or you don\'t have the required permissions.',
                );
            }
        }

        if (isPropertySet(validated, 'executionStatus')) {
            if (!isAuthorityOfNode || !canUpdate) {
                throw new BadRequestError(
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
        await actor.permissionChecker.preCheckOneOf({
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
