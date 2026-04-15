/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DataSourceOptionsBuilder as BaseBuilder } from '@privateaim/server-db-kit';
import {
    AnalysisBucketEntity,
    AnalysisBucketFileEntity,
    AnalysisEntity,
    AnalysisNodeEntity,
    AnalysisNodeEventEntity,
    AnalysisPermissionEntity,
    MasterImageEntity,
    MasterImageGroupEntity,
    NodeEntity,
    ProjectEntity,
    ProjectNodeEntity,
    RegistryEntity,
    RegistryProjectEntity,
} from '../../../adapters/database/entities/index.ts';

export class DataSourceOptionsBuilder extends BaseBuilder {
    constructor() {
        super();

        this.setEntities([
            MasterImageEntity,
            MasterImageGroupEntity,
            ProjectEntity,
            ProjectNodeEntity,
            RegistryEntity,
            RegistryProjectEntity,
            NodeEntity,
            AnalysisEntity,
            AnalysisBucketEntity,
            AnalysisBucketFileEntity,
            AnalysisNodeEntity,
            AnalysisNodeEventEntity,
            AnalysisPermissionEntity,
        ]);

        // Subscribers are instantiated and pushed onto dataSource.subscribers
        // in DatabaseModule.setup() — not registered here as classes.
    }
}
