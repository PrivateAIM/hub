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
import { useDataSource } from 'typeorm-extension';
import { EnvironmentName } from '@privateaim/kit';
import { AnalysisBucketFileEntity, AnalysisEntity, AnalysisNodeEntity } from '../../../../database/index.ts';
import type { AnalysisMetadataCommand } from '../../constants.ts';
import { AnalysisMetadataEvent } from '../../constants.ts';
import type { AnalysisMetadataEventMap, AnalysisMetadataRecalcPayload } from '../../types.ts';
import { useEnv } from '../../../../config/index.ts';

export class AnalysisMetadataRecalcHandler implements ComponentHandler<
AnalysisMetadataEventMap
> {
    async handle(
        value: AnalysisMetadataRecalcPayload,
        context: ComponentHandlerContext<AnalysisMetadataEventMap, AnalysisMetadataCommand.RECALC>,
    ): Promise<void> {
        const dataSource = await useDataSource();
        const analysisRepository = dataSource.getRepository(AnalysisEntity);
        const entity = await analysisRepository.findOneBy({
            id: value.analysisId,
        });

        if (!entity) {
            return;
        }

        const cloned = {
            ...entity,
        };

        const querySelf = value.querySelf ?? true;
        if (querySelf) {
            await this.querySelf(entity);
        }

        const queryFiles = value.queryFiles ?? true;
        if (queryFiles) {
            await this.queryAnalysisFiles(entity);
        }

        const queryNodes = value.queryNodes ?? true;
        if (queryNodes) {
            await this.queryAnalysisNodes(entity);
        }

        if (this.hasChanged(cloned, entity)) {
            await analysisRepository.save(entity);
        }

        context.handle(AnalysisMetadataEvent.RECALC_FINISHED, entity);
    }

    async querySelf(entity: AnalysisEntity) : Promise<void> {
        entity.configuration_image_valid = !!entity.master_image_id;
    }

    async queryAnalysisFiles(entity: AnalysisEntity) : Promise<void> {
        const dataSource = await useDataSource();
        const analysisBuckerFileRepository = dataSource.getRepository(AnalysisBucketFileEntity);
        const rootFile = await analysisBuckerFileRepository.findOne({
            where: {
                analysis_id: entity.id,
                root: true,
                analysis_bucket: {
                    type: AnalysisBucketType.CODE,
                },
            },
            relations: ['analysis_bucket'],
        });

        entity.configuration_entrypoint_valid = !!rootFile;
    }

    async queryAnalysisNodes(entity: AnalysisEntity) : Promise<void> {
        const dataSource = await useDataSource();
        const analysisNodesRepository = dataSource.getRepository(AnalysisNodeEntity);
        const analysisNodes = await analysisNodesRepository.find({
            where: {
                analysis_id: entity.id,
            },
            relations: ['node'],
            cache: false,
        });

        let nodes : number = 0;
        let nodesApproved : number = 0;
        let executionProgress : number = 0;

        let hasAggregator : boolean = false;
        let hasDefault : boolean = false;

        for (let i = 0; i < analysisNodes.length; i++) {
            const analysisNode = analysisNodes[i];

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

        for (let i = 0; i < keys.length; i++) {
            index = excludeKeys.indexOf(keys[i] as keyof Analysis);
            if (index !== -1) {
                continue;
            }

            if (!isEqual(a[keys[i]], b[keys[i]])) {
                return true;
            }
        }

        return false;
    }
}
