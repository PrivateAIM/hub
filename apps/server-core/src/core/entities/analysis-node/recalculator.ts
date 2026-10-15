/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import {
    AnalysisBucketType,
    AnalysisNodeApprovalStatus,
    DomainType,
    NodeType,
} from '@privateaim/core-kit';
import { EnvironmentName, ProcessStatus, getMinProcessStatus } from '@privateaim/kit';
import type { Logger } from '@privateaim/server-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type { IAnalysisStorageManager } from '../../services/analysis-storage-manager/types.ts';
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
    storageManager?: IAnalysisStorageManager;
    logger?: Logger;
};

const IDLE_EXECUTION_STATUSES: (`${ProcessStatus}` | null)[] = [
    ProcessStatus.EXECUTED,
    ProcessStatus.FAILED,
    ProcessStatus.STOPPED,
];

export class AnalysisNodeMetadataRecalculator implements IAnalysisNodeMetadataRecalculator {
    protected analysisRepository: IAnalysisRepository;

    protected analysisNodeRepository: IAnalysisNodeRepository;

    protected config: AnalysisNodeMetadataRecalculatorConfig;

    protected storageManager?: IAnalysisStorageManager;

    protected logger?: Logger;

    private queue: AnalysisRecalcQueue;

    constructor(ctx: AnalysisNodeMetadataRecalculatorContext) {
        this.analysisRepository = ctx.analysisRepository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.config = ctx.config;
        this.storageManager = ctx.storageManager;
        this.logger = ctx.logger;
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
            if (analysisNode.approvalStatus === AnalysisNodeApprovalStatus.APPROVED) {
                nodesApproved += 1;
            }

            executionProgress += analysisNode.executionProgress || 0;
            executionStatuses.push(analysisNode.executionStatus);

            if (analysisNode.node.type === NodeType.AGGREGATOR) {
                hasAggregator = true;
                continue;
            }

            if (analysisNode.node.type === NodeType.DEFAULT) {
                hasDefault = true;
            }
        }

        entity.nodes = nodes;
        entity.nodesApproved = nodesApproved;

        const ignoreApproval = this.config.skipAnalysisApproval ||
            this.config.env === EnvironmentName.TEST;

        entity.buildNodesValid = entity.nodes > 0 &&
            (ignoreApproval || entity.nodes === entity.nodesApproved);

        entity.executionStatus = getMinProcessStatus(executionStatuses);
        entity.executionProgress = executionProgress > 0 && nodes > 0 ?
            Math.floor(executionProgress / nodes) :
            0;

        entity.configurationNodeAggregatorValid = hasAggregator;
        entity.configurationNodeDefaultValid = hasDefault;
        entity.configurationNodesValid = hasAggregator && hasDefault;

        if (hasAnalysisChanged(cloned, entity)) {
            await this.analysisRepository.save(entity);
        }

        // Every node idle (none pending, none running) -> intermediate files are no longer needed.
        // Deliberately not getMinProcessStatus(): it skips null and short-circuits on FAILED.
        if (
            this.storageManager &&
            executionStatuses.length > 0 &&
            executionStatuses.every((status) => IDLE_EXECUTION_STATUSES.includes(status))
        ) {
            // ponytail: one bus message per idle recalc (clear is idempotent);
            // gate on the transition into idle if that volume ever matters.
            try {
                await this.storageManager.clear(entity, { type: AnalysisBucketType.TEMP });
            } catch (e) {
                // never rethrow: the node writes that triggered this recalc are already committed.
                this.logger?.error('Temp bucket of analysis could not be cleared', {
                    [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
                    [LogFlag.REF_ID]: entity.id,
                    error: e instanceof Error ? e.message : String(e),
                });
            }
        }

        return entity;
    }

    recalcDebounced(analysisId: string): Promise<void> {
        return this.queue.enqueue(analysisId);
    }
}
