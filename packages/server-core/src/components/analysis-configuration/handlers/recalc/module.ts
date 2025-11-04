/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AnalysisBucketType, AnalysisNodeApprovalStatus, NodeType } from '@privateaim/core-kit';
import { EnvironmentName } from '@privateaim/kit';
import type { ComponentHandler } from '@privateaim/server-kit';
import type { DataSource, Repository } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { useEnv } from '../../../../config';
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

        const entrypointStatusChanged = await this.setConfigurationEntrypointStatus(entity);
        const imageStatusChanged = await this.setConfigurationImageStatus(entity);
        const nodesChanged = await this.setConfigurationNodesStatus(entity);

        if (entrypointStatusChanged || imageStatusChanged || nodesChanged) {
            await this.analysisRepository.save(entity);
        }
    }

    async setConfigurationEntrypointStatus(entity: AnalysisEntity) : Promise<boolean> {
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

        if (this.hasChanged(entity.configuration_entrypoint_valid, !!rootFile)) {
            entity.configuration_entrypoint_valid = !!rootFile;
            return true;
        }

        return false;
    }

    async setConfigurationImageStatus(entity: AnalysisEntity) : Promise<boolean> {
        if (this.hasChanged(entity.configuration_image_valid, !!entity.master_image_id)) {
            entity.configuration_image_valid = !!entity.master_image_id;
            return true;
        }

        return false;
    }

    async setConfigurationNodesStatus(entity: AnalysisEntity) : Promise<boolean> {
        const analysisNodes = await this.analysisNodesRepository.find({
            where: {
                analysis_id: entity.id,
            },
            relations: ['node'],
        });

        const ignoreApproval = useEnv('skipAnalysisApproval') ||
            useEnv('env') === EnvironmentName.TEST;

        let hasAggregator : boolean = false;
        let hasDefault : boolean = false;

        for (let i = 0; i < analysisNodes.length; i++) {
            const { node } = analysisNodes[i];

            if (
                !ignoreApproval &&
                analysisNodes[i].approval_status !== AnalysisNodeApprovalStatus.APPROVED
            ) {
                continue;
            }

            if (node.type === NodeType.AGGREGATOR) {
                hasAggregator = true;
                continue;
            }

            if (node.type === NodeType.DEFAULT) {
                hasDefault = true;
            }
        }

        let hasAggregatorChanged = false;
        if (this.hasChanged(entity.configuration_node_aggregator_valid, hasAggregator)) {
            entity.configuration_node_aggregator_valid = hasAggregator;
            hasAggregatorChanged = true;
        }

        let hasDefaultChanged = false;
        if (this.hasChanged(entity.configuration_node_default_valid, hasDefault)) {
            entity.configuration_node_default_valid = hasDefault;
            hasDefaultChanged = true;
        }

        if (hasAggregatorChanged || hasDefaultChanged) {
            entity.configuration_nodes_valid = entity.configuration_node_aggregator_valid &&
            entity.configuration_node_default_valid;
        }

        return hasAggregatorChanged || hasDefaultChanged;
    }

    private hasChanged(a: unknown, b: unknown) {
        return a !== b;
        // todo: deep object equality check
    }
}
