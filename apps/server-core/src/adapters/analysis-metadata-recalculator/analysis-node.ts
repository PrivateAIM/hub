/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { AnalysisNodeApprovalStatus, NodeType } from '@privateaim/core-kit';
import { EnvironmentName } from '@privateaim/kit';
import type { DataSource } from 'typeorm';
import type { IAnalysisNodeMetadataRecalculator } from '../../core/entities/analysis-node/types.ts';
import { AnalysisEntity, AnalysisNodeEntity } from '../database/index.ts';
import type { AnalysisMetadataRecalculatorConfig, AnalysisMetadataRecalculatorContext } from './types.ts';
import { RecalcQueue, hasChanged } from './utils.ts';

export class AnalysisNodeMetadataRecalculator implements IAnalysisNodeMetadataRecalculator {
    protected dataSource: DataSource;

    protected config: AnalysisMetadataRecalculatorConfig;

    private queue: RecalcQueue;

    constructor(ctx: AnalysisMetadataRecalculatorContext) {
        this.dataSource = ctx.dataSource;
        this.config = ctx.config;
        this.queue = new RecalcQueue((id) => this.recalc(id));
    }

    async recalc(analysisId: string): Promise<Analysis> {
        const repository = this.dataSource.manager.getRepository(AnalysisEntity);
        const entity = await repository.findOneBy({ id: analysisId });
        if (!entity) {
            throw new Error(`Analysis ${analysisId} not found`);
        }

        const cloned = { ...entity };

        const analysisNodesRepository = this.dataSource.manager.getRepository(AnalysisNodeEntity);
        const analysisNodes = await analysisNodesRepository.find({
            where: { analysis_id: entity.id },
            relations: ['node'],
            cache: false,
        });

        let nodes = 0;
        let nodesApproved = 0;
        let executionProgress = 0;
        let hasAggregator = false;
        let hasDefault = false;

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

        const ignoreApproval = this.config.skipAnalysisApproval ||
            this.config.env === EnvironmentName.TEST;

        entity.build_nodes_valid = ignoreApproval ? true : entity.nodes === entity.nodes_approved;

        entity.execution_progress = executionProgress > 0 && nodes > 0 ?
            Math.floor(executionProgress / nodes) :
            0;

        entity.configuration_node_aggregator_valid = hasAggregator;
        entity.configuration_node_default_valid = hasDefault;
        entity.configuration_nodes_valid = hasAggregator && hasDefault;

        if (hasChanged(cloned, entity)) {
            await repository.save(entity);
        }

        return entity;
    }

    recalcDebounced(analysisId: string): Promise<void> {
        this.queue.enqueue(analysisId);
    }
}
