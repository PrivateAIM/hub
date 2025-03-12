/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from './analysis-bucket';
import type { AnalysisNodeLog } from './analysis-node-log';
import type {
    DomainEventName, DomainEventSubscriptionName, DomainSubType, DomainType,
} from './constants';
import type { MasterImage } from './master-image';
import type { MasterImageEventLog } from './master-image-event-log';
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

type DomainTypeMapRaw = {
    [DomainType.MASTER_IMAGE]: MasterImage,
    [DomainType.MASTER_IMAGE_EVENT_LOG]: MasterImageEventLog,
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
    [DomainType.ANALYSIS_NODE_LOG]: AnalysisNodeLog,
    [DomainSubType.ANALYSIS_NODE_IN]: AnalysisNode,
    [DomainSubType.ANALYSIS_NODE_OUT]: AnalysisNode,
};

export type DomainTypeMap = {
    [K in keyof DomainTypeMapRaw as `${K}`]: DomainTypeMapRaw[K]
};

export type EventRecord<
    T extends string,
    D extends Record<string, any>,
> = {
    type: T,
    data: D,
    event: `${DomainEventName}`,
};

export type DomainsEvents = {
    [T in keyof DomainTypeMap]: EventRecord<T, DomainTypeMap[T]>
}[keyof DomainTypeMap];

export type DomainEventFullName<
    T extends string,
> = `${T}${Capitalize<`${DomainEventName}`>}`;

export type DomainEventSubscriptionFullName<
    T extends string,
> = `${T}${Capitalize<`${DomainEventSubscriptionName}`>}`;
