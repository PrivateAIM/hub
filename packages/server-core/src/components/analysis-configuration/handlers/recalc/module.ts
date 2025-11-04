/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AnalysisBucketType, NodeType } from '@privateaim/core-kit';
import type { ComponentHandler } from '@privateaim/server-kit';
import type { DataSource, Repository } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { AnalysisBucketFileEntity, AnalysisEntity, AnalysisNodeEntity } from '../../../../database';
import type { AnalysisConfigurationCommand } from '../../constants';
import type { AnalysisConfigurationRecalcPayload } from '../../types';

export class AnalysisConfigurationRecalcHandler implements ComponentHandler<
AnalysisConfigurationCommand.RECALC,
AnalysisConfigurationRecalcPayload> {
    protected dataSource!: DataSource;

    protected analysisRepository!: Repository<AnalysisEntity>;

    protected analysisBucketFileRepository!: Repository<AnalysisBucketFileEntity>;

    protected analysisNodesRepository!: Repository<AnalysisNodeEntity>;

    async initialize(): Promise<void> {
        this.dataSource = await useDataSource();
        this.analysisRepository = this.dataSource.getRepository(AnalysisEntity);
        this.analysisBucketFileRepository = this.dataSource.getRepository(AnalysisBucketFileEntity);
        this.analysisNodesRepository = this.dataSource.getRepository(AnalysisNodeEntity);
    }

    async handle(
        value: AnalysisConfigurationRecalcPayload,
    ): Promise<void> {
        const entity = await this.analysisRepository.findOneBy({
            id: value.analysisId,
        });

        await this.querySelf(entity);
        await this.queryAnalysisFiles(entity);
        await this.queryAnalysisNodes(entity);

        await this.analysisRepository.save(entity);
    }

    async querySelf(entity: AnalysisEntity) : Promise<void> {
        entity.configuration_image_valid = !!entity.master_image_id;
    }

    async queryAnalysisFiles(entity: AnalysisEntity) : Promise<void> {
        const rootFile = await this.analysisBucketFileRepository.findOne({
            where: {
                analysis_id: entity.id,
                root: true,
                bucket: {
                    type: AnalysisBucketType.CODE,
                },
            },
            relations: ['bucket'],
        });

        entity.configuration_entrypoint_valid = !!rootFile;
    }

    async queryAnalysisNodes(entity: AnalysisEntity) : Promise<void> {
        const analysisNodes = await this.analysisNodesRepository.find({
            where: {
                analysis_id: entity.id,
            },
            relations: ['node'],
        });

        let nodes : number = 0;
        let executionProgress : number = 0;

        let hasAggregator : boolean = false;
        let hasDefault : boolean = false;

        for (let i = 0; i < analysisNodes.length; i++) {
            const analysisNode = analysisNodes[i];

            nodes++;

            executionProgress += analysisNode.execution_progress || 0;

            /**
             * todo: check on build
             * const ignoreApproval = useEnv('skipAnalysisApproval') ||
             *             useEnv('env') === EnvironmentName.TEST;
             *
            if (
                !ignoreApproval &&
                analysisNodes[i].approval_status !== AnalysisNodeApprovalStatus.APPROVED
            ) {
                continue;
            }
                */

            switch (analysisNode.node.type) {
                case NodeType.AGGREGATOR: {
                    hasAggregator = true;
                    break;
                }
                default: {
                    hasDefault = true;
                    break;
                }
            }

            if (analysisNode.node.type === NodeType.AGGREGATOR) {
                hasAggregator = true;
                continue;
            }

            if (analysisNode.node.type === NodeType.DEFAULT) {
                hasDefault = true;
            }
        }

        entity.nodes = nodes;
        entity.execution_progress = executionProgress > 0 && nodes > 0 ?
            Math.floor(executionProgress / nodes) : 0;

        entity.configuration_node_aggregator_valid = hasAggregator;
        entity.configuration_node_default_valid = hasDefault;
        entity.configuration_nodes_valid = hasAggregator && hasDefault;
    }
}
