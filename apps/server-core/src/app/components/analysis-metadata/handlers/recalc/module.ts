/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { AnalysisBucketType, AnalysisNodeApprovalStatus, NodeType } from '@privateaim/core-kit';
import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import { isEqual } from 'smob';
import { EnvironmentName } from '@privateaim/kit';
import type { DataSource, EntityManager } from 'typeorm';
import {
    AnalysisBucketFileEntity,
    AnalysisEntity,
    AnalysisNodeEntity,
} from '../../../../../adapters/database/index.ts';
import type { AnalysisMetadataCommand } from '../../constants.ts';
import { AnalysisMetadataEvent } from '../../constants.ts';
import type { AnalysisMetadataEventMap, AnalysisMetadataRecalcPayload } from '../../types.ts';
import { useEnv } from '../../../../../app/modules/config/index.ts';

export class AnalysisMetadataRecalcHandler implements ComponentHandler<
    AnalysisMetadataEventMap
> {
    protected dataSource: DataSource;

    constructor(ctx: { dataSource: DataSource }) {
        this.dataSource = ctx.dataSource;
    }
    async handle(
        value: AnalysisMetadataRecalcPayload,
        context: ComponentHandlerContext<AnalysisMetadataEventMap, AnalysisMetadataCommand.RECALC>,
    ): Promise<void> {
        try {
            await this.handleInternal(value, context);
        } catch (e) {
            context.handle(AnalysisMetadataEvent.RECALC_FAILED, {
                id: value.analysisId,
                error: e as Error,
            });
        }
    }

    async handleInternal(
        value: AnalysisMetadataRecalcPayload,
        context: ComponentHandlerContext<AnalysisMetadataEventMap, AnalysisMetadataCommand.RECALC>,
    ): Promise<void> {
        let entityManger : EntityManager;
        if (context.metadata.entityManager) {
            entityManger = context.metadata.entityManager;
        } else {
            entityManger = this.dataSource.manager;
        }

        const analysisRepository = entityManger.getRepository(AnalysisEntity);

        const entity = await analysisRepository.findOneBy({ id: value.analysisId });

        if (!entity) {
            return;
        }

        const cloned = { ...entity };

        const querySelf = value.querySelf ?? true;
        if (querySelf) {
            await this.querySelf(entity);
        }

        const queryFiles = value.queryFiles ?? true;
        if (queryFiles) {
            await this.queryAnalysisFiles(entity, entityManger);
        }

        const queryNodes = value.queryNodes ?? true;
        if (queryNodes) {
            await this.queryAnalysisNodes(entity, entityManger);
        }

        if (this.hasChanged(cloned, entity)) {
            await analysisRepository.save(entity);
        }

        context.handle(AnalysisMetadataEvent.RECALC_FINISHED, entity);
    }

    async querySelf(entity: AnalysisEntity) : Promise<void> {
        entity.configuration_image_valid = !!entity.master_image_id;
    }

    async queryAnalysisFiles(entity: AnalysisEntity, entityManger: EntityManager) : Promise<void> {
        const analysisBuckerFileRepository = entityManger.getRepository(AnalysisBucketFileEntity);
        const rootFile = await analysisBuckerFileRepository.findOne({
            where: {
                analysis_id: entity.id,
                root: true,
                analysis_bucket: { type: AnalysisBucketType.CODE },
            },
            relations: ['analysis_bucket'],
        });

        entity.configuration_entrypoint_valid = !!rootFile;
    }

    async queryAnalysisNodes(entity: AnalysisEntity, entityManger: EntityManager) : Promise<void> {
        const analysisNodesRepository = entityManger.getRepository(AnalysisNodeEntity);
        const analysisNodes = await analysisNodesRepository.find({
            where: { analysis_id: entity.id },
            relations: ['node'],
            cache: false,
        });

        let nodes : number = 0;
        let nodesApproved : number = 0;
        let executionProgress : number = 0;

        let hasAggregator : boolean = false;
        let hasDefault : boolean = false;

        for (const analysisNode of analysisNodes) {
            nodes++;
            if (analysisNode.approval_status === AnalysisNodeApprovalStatus.APPROVED) {
                nodesApproved += 1;
            }

            executionProgress += analysisNode.execution_progress || 0;

            if (analysisNode.node.type === NodeType.AGGREGATOR) {
                hasAggregator = true;
                continue;
            }

            if (analysisNode.node.type === NodeType.DEFAULT) {
                hasDefault = true;
            }
        }

        entity.nodes = nodes;
        entity.nodes_approved = nodesApproved;

        const ignoreApproval = useEnv('skipAnalysisApproval') ||
            useEnv('env') === EnvironmentName.TEST;

        entity.build_nodes_valid = ignoreApproval ? true : entity.nodes === entity.nodes_approved;

        entity.execution_progress = executionProgress > 0 && nodes > 0 ?
            Math.floor(executionProgress / nodes) : 0;

        entity.configuration_node_aggregator_valid = hasAggregator;
        entity.configuration_node_default_valid = hasDefault;
        entity.configuration_nodes_valid = hasAggregator && hasDefault;
    }

    private hasChanged(a: Analysis, b: Analysis) {
        const excludeKeys : (keyof Analysis)[] = [
            'updated_at',
            'created_at',
        ];

        const keys = Object.keys(a);
        let index : number;

        for (const key of keys) {
            index = excludeKeys.indexOf(key as keyof Analysis);
            if (index !== -1) {
                continue;
            }

            if (!isEqual(a[key], b[key])) {
                return true;
            }
        }

        return false;
    }
}
