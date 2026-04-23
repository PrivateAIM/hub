/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNode } from '@privateaim/core-kit';
import { AnalysisNodeApprovalStatus, NodeType } from '@privateaim/core-kit';
import {
    PermissionName,
    isRealmResourceWritable,
} from '@privateaim/kit';
import { isPropertySet } from '@authup/kit';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult } from '../types.ts';
import { ValidatorGroup } from '../constants.ts';
import { AbstractEntityService } from '../service.ts';
import type { IProjectNodeRepository } from '../project-node/types.ts';
import type { IAnalysisNodeMetadataRecalculator, IAnalysisNodeRepository, IAnalysisNodeService } from './types.ts';
import { AnalysisNodeValidator } from './validator.ts';

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
        return this.repository.findMany(query);
    }

    async getOne(id: string): Promise<AnalysisNode> {
        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async create(data: Partial<AnalysisNode>, actor: ActorContext): Promise<AnalysisNode> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

        await this.repository.validateJoinColumns(validated);

        validated.analysis_realm_id = validated.analysis.realm_id;
        validated.node_realm_id = validated.node.realm_id;

        if (validated.analysis.configuration_locked) {
            throw new BadRequestError('The analysis has already been locked and can therefore no longer be modified.');
        }

        const projectNode = await this.projectNodeRepository.findOneBy({
            project_id: validated.analysis.project_id,
            node_id: validated.node_id,
        });

        if (!projectNode) {
            throw new NotFoundError('The referenced node is not part of the analysis project.');
        }

        const entity = this.repository.create(validated);

        if (
            this.skipAnalysisApproval ||
            entity.node.type === NodeType.AGGREGATOR
        ) {
            entity.approval_status = AnalysisNodeApprovalStatus.APPROVED;
        }

        const saved = await this.repository.save(entity, { data: actor.metadata });

        await this.recalculator.recalc(saved.analysis_id);

        return saved;
    }

    async update(id: string, data: Partial<AnalysisNode>, actor: ActorContext): Promise<AnalysisNode> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        const isAuthorityOfNode = isRealmResourceWritable(actor.realm, entity.node_realm_id);
        const isAuthorityOfAnalysis = isRealmResourceWritable(actor.realm, entity.analysis_realm_id);

        if (!isAuthorityOfNode && !isAuthorityOfAnalysis) {
            throw new ForbiddenError('You are neither part of the node nor analysis realm.');
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
            throw new ForbiddenError();
        }

        if (
            isPropertySet(validated, 'approval_status') ||
            isPropertySet(validated, 'comment')
        ) {
            if (!isAuthorityOfNode || !canApprove) {
                throw new BadRequestError(
                    'You are either no authority of the node or you don\'t have the required permissions.',
                );
            }
        }

        if (isPropertySet(validated, 'execution_status')) {
            if (!isAuthorityOfNode || !canUpdate) {
                throw new BadRequestError(
                    'You are either no authority of the node or you don\'t have the required permissions.',
                );
            }
        }

        const merged = this.repository.merge(entity, validated);

        const saved = await this.repository.save(merged, { data: actor.metadata });

        await this.recalculator.recalcDebounced(saved.analysis_id);

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
            throw new NotFoundError();
        }

        if (
            !isRealmResourceWritable(actor.realm, entity.node_realm_id) &&
            !isRealmResourceWritable(actor.realm, entity.analysis_realm_id)
        ) {
            throw new ForbiddenError();
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        await this.recalculator.recalc(entity.analysis_id);

        return entity;
    }
}
