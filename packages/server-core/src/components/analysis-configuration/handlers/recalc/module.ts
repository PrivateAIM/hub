/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { AnalysisBucketType, NodeType } from '@privateaim/core-kit';
import type { ComponentHandler } from '@privateaim/server-kit';
import { clone, isEqual } from 'smob';
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

        const cloned = clone(entity);

        await this.setConfigurationEntrypointStatus(entity);
        await this.setConfigurationImageStatus(entity);
        await this.setConfigurationNodesStatus(entity);

        if (this.hasChanged(cloned, entity)) {
            await this.analysisRepository.save(entity);
        }
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

        entity.configuration_entrypoint_valid = !!rootFile;
    }

    async setConfigurationImageStatus(entity: AnalysisEntity) : Promise<void> {
        entity.configuration_image_valid = !!entity.master_image_id;
    }

    async setConfigurationNodesStatus(entity: AnalysisEntity) : Promise<void> {
        const analysisNodes = await this.analysisNodesRepository.find({
            where: {
                analysis_id: entity.id,
            },
            relations: ['node'],
        });

        let nodes = 0;
        let hasAggregator : boolean = false;
        let hasDefault : boolean = false;

        for (let i = 0; i < analysisNodes.length; i++) {
            const { node } = analysisNodes[i];

            nodes++;

            switch (node.type) {
                case NodeType.AGGREGATOR: {
                    hasAggregator = true;
                    break;
                }
                default: {
                    hasDefault = true;
                    break;
                }
            }
        }

        entity.nodes = nodes;
        entity.configuration_node_aggregator_valid = hasAggregator;
        entity.configuration_node_default_valid = hasDefault;
        entity.configuration_nodes_valid = hasAggregator && hasDefault;
    }

    private hasChanged(a: Analysis, b: Analysis) {
        const keys : (keyof Analysis)[] = [
            'nodes',

            'configuration_entrypoint_valid',

            'configuration_image_valid',

            'configuration_node_default_valid',
            'configuration_node_aggregator_valid',
            'configuration_nodes_valid',
        ];

        for (let i = 0; i < keys.length; i++) {
            if (!isEqual(a[keys[i]], b[keys[i]])) {
                return true;
            }
        }

        return false;
    }
}
