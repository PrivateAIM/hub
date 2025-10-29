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

    async setup(): Promise<void> {
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

        await this.setConfigurationEntrypointStatus(entity);
        await this.setConfigurationImageStatus(entity);
        await this.setConfigurationNodesStatus(entity);

        await this.analysisRepository.save(entity);
    }

    async setConfigurationEntrypointStatus(entity: AnalysisEntity) : Promise<void> {
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

        entity.configuration_entrypoint = !!rootFile;
    }

    async setConfigurationImageStatus(entity: AnalysisEntity) : Promise<void> {
        entity.configuration_image = !!entity.master_image_id;
    }

    async setConfigurationNodesStatus(entity: AnalysisEntity) : Promise<void> {
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

        console.log(hasAggregator, hasDefault);

        entity.configuration_node_aggregator = hasAggregator;
        entity.configuration_node_default = hasDefault;
        entity.configuration_nodes = hasAggregator && hasDefault;
    }
}
