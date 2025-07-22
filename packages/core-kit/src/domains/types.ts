/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from './analysis-bucket';
import type { AnalysisNodeEvent } from './analysis-node-event';
import type { AnalysisNodeLog } from './analysis-node-log';
import type { DomainSubType, DomainType } from './constants';
import type { MasterImage } from './master-image';
import type { MasterImageEvent } from './master-image-event';
import type { MasterImageGroup } from './master-image-group';
import type { Project } from './project';
import type { ProjectNode } from './project-node';
import type { Registry } from './registry';
import type { RegistryProject } from './registry-project';
import type { Node } from './node';
import type { Analysis } from './analysis';
import type { AnalysisBucketFile } from './analysis-bucket-file';
import type { AnalysisLog } from './analysis-log';
import type { AnalysisNode } from './analysis-node';
import type { AnalysisPermission } from './analysis-permission';

type DomainTypeMapRaw = {
    [DomainType.MASTER_IMAGE]: MasterImage,
    [DomainType.MASTER_IMAGE_EVENT]: MasterImageEvent,
    [DomainType.MASTER_IMAGE_GROUP]: MasterImageGroup,
    [DomainType.PROJECT]: Project,
    [DomainType.PROJECT_NODE]: ProjectNode,
    [DomainSubType.PROJECT_NODE_IN]: ProjectNode,
    [DomainSubType.PROJECT_NODE_OUT]: ProjectNode,
    [DomainType.REGISTRY]: Registry,
    [DomainType.REGISTRY_PROJECT]: RegistryProject
    [DomainType.NODE]: Node,
    [DomainType.ANALYSIS]: Analysis,
    [DomainType.ANALYSIS_BUCKET]: AnalysisBucket,
    [DomainType.ANALYSIS_BUCKET_FILE]: AnalysisBucketFile,
    [DomainType.ANALYSIS_LOG]: AnalysisLog,
    [DomainType.ANALYSIS_NODE]: AnalysisNode,
    [DomainType.ANALYSIS_NODE_EVENT]: AnalysisNodeEvent,
    [DomainType.ANALYSIS_NODE_LOG]: AnalysisNodeLog,
    [DomainType.ANALYSIS_PERMISSION]: AnalysisPermission,
    [DomainSubType.ANALYSIS_NODE_IN]: AnalysisNode,
    [DomainSubType.ANALYSIS_NODE_OUT]: AnalysisNode,
};

export type DomainTypeMap = {
    [K in keyof DomainTypeMapRaw as `${K}`]: DomainTypeMapRaw[K]
};
