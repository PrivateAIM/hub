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
    AnalysisBucketFileSubscriber,
    AnalysisBucketSubscriber,
    AnalysisEntity,
    AnalysisNodeEntity,
    AnalysisNodeEventEntity,
    AnalysisNodeEventSubscriber,
    AnalysisNodeSubscriber,
    AnalysisPermissionEntity,
    AnalysisPermissionSubscriber,
    AnalysisSubscriber,
    MasterImageEntity,
    MasterImageGroupEntity,
    MasterImageGroupSubscriber,
    MasterImageSubscriber,
    NodeEntity,
    NodeSubscriber,
    ProjectEntity,
    ProjectNodeEntity,
    ProjectNodeSubscriber,
    ProjectSubscriber,
    RegistryEntity,
    RegistryProjectEntity,
    RegistryProjectSubscriber,
    RegistrySubscriber,
} from '../domains/index.ts';

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

        this.setSubscribers([
            AnalysisSubscriber,
            AnalysisBucketSubscriber,
            AnalysisBucketFileSubscriber,
            AnalysisNodeSubscriber,
            AnalysisNodeEventSubscriber,
            AnalysisPermissionSubscriber,
            MasterImageSubscriber,
            MasterImageGroupSubscriber,
            NodeSubscriber,
            ProjectSubscriber,
            ProjectNodeSubscriber,
            RegistrySubscriber,
            RegistryProjectSubscriber,
        ]);
    }
}
