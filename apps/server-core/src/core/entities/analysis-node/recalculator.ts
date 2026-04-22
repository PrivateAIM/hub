/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { AnalysisNodeApprovalStatus, NodeType } from '@privateaim/core-kit';
import type { ProcessStatus } from '@privateaim/kit';
import { EnvironmentName, getMinProcessStatus } from '@privateaim/kit';
import type { IAnalysisRepository } from '../analysis/types.ts';
import { AnalysisRecalcQueue, hasAnalysisChanged } from '../utils.ts';
import type { IAnalysisNodeMetadataRecalculator, IAnalysisNodeRepository } from './types.ts';

type AnalysisNodeMetadataRecalculatorConfig = {
    env: string;
    skipAnalysisApproval: boolean;
};

type AnalysisNodeMetadataRecalculatorContext = {
    analysisRepository: IAnalysisRepository;
    analysisNodeRepository: IAnalysisNodeRepository;
    config: AnalysisNodeMetadataRecalculatorConfig;
};

export class AnalysisNodeMetadataRecalculator implements IAnalysisNodeMetadataRecalculator {
    protected analysisRepository: IAnalysisRepository;

    protected analysisNodeRepository: IAnalysisNodeRepository;

    protected config: AnalysisNodeMetadataRecalculatorConfig;

    private queue: AnalysisRecalcQueue;

    constructor(ctx: AnalysisNodeMetadataRecalculatorContext) {
        this.analysisRepository = ctx.analysisRepository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.config = ctx.config;
        this.queue = new AnalysisRecalcQueue((id) => this.recalc(id));
    }

    async recalc(analysisId: string): Promise<Analysis> {
        const entity = await this.analysisRepository.findOneById(analysisId);
        if (!entity) {
            throw new Error(`Analysis ${analysisId} not found`);
        }

        const cloned = { ...entity };

        const analysisNodes = await this.analysisNodeRepository.findManyWithNodeByAnalysis(entity.id);

        let nodes = 0;
        let nodesApproved = 0;
        let executionProgress = 0;
        let hasAggregator = false;
        let hasDefault = false;

        const executionStatuses: (`${ProcessStatus}` | null)[] = [];

        for (const analysisNode of analysisNodes) {
            nodes++;
            if (analysisNode.approval_status === AnalysisNodeApprovalStatus.APPROVED) {
                nodesApproved += 1;
            }

            executionProgress += analysisNode.execution_progress || 0;
            executionStatuses.push(analysisNode.execution_status);

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

        entity.build_nodes_valid = entity.nodes > 0 &&
            (ignoreApproval || entity.nodes === entity.nodes_approved);

        entity.execution_status = getMinProcessStatus(executionStatuses);
        entity.execution_progress = executionProgress > 0 && nodes > 0 ?
            Math.floor(executionProgress / nodes) :
            0;

        entity.configuration_node_aggregator_valid = hasAggregator;
        entity.configuration_node_default_valid = hasDefault;
        entity.configuration_nodes_valid = hasAggregator && hasDefault;

        if (hasAnalysisChanged(cloned, entity)) {
            await this.analysisRepository.save(entity);
        }

        return entity;
    }

    recalcDebounced(analysisId: string): Promise<void> {
        return this.queue.enqueue(analysisId);
    }
}
