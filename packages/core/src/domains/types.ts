/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    DomainEventName, DomainEventSubscriptionName, DomainSubType, DomainType,
} from './constants';
import type { MasterImage, MasterImageEventContext } from './master-image';
import type { MasterImageGroup, MasterImageGroupEventContext } from './master-image-group';
import type { Project, ProjectEventContext } from './project';
import type { ProjectNode, ProjectNodeEventContext } from './project-node';
import type { Registry, RegistryEventContext } from './registry';
import type { RegistryProject, RegistryProjectEventContext } from './registry-project';
import type { Node, NodeEventContext } from './node';
import type { Analysis, AnalysisEventContext } from './analysis';
import type { AnalysisFile, AnalysisFileEventContext } from './analysis-file';
import type { AnalysisLog, AnalysisLogEventContext } from './analysis-log';
import type { AnalysisNode, TrainStationEventContext } from './analysis-node';

export type DomainsEventContext = MasterImageEventContext |
MasterImageGroupEventContext |
ProjectEventContext |
ProjectNodeEventContext |
RegistryEventContext |
RegistryProjectEventContext |
NodeEventContext |
AnalysisEventContext |
AnalysisLogEventContext |
AnalysisFileEventContext |
TrainStationEventContext;

export type DomainEventContext<T extends `${DomainType}` | `${DomainSubType}`> =
    T extends `${DomainType.MASTER_IMAGE}` ?
        MasterImageEventContext :
        T extends `${DomainType.MASTER_IMAGE_GROUP}` ?
            MasterImageGroupEventContext :
            T extends `${DomainType.PROJECT}` ?
                ProjectEventContext :
                T extends `${DomainType.PROJECT_NODE}` | `${DomainSubType.PROJECT_NODE_IN}` | `${DomainSubType.PROJECT_NODE_OUT}` ?
                    ProjectNodeEventContext :
                    T extends `${DomainType.REGISTRY}` ?
                        RegistryEventContext :
                        T extends `${DomainType.REGISTRY_PROJECT}` ?
                            RegistryProjectEventContext :
                            T extends `${DomainType.NODE}` ?
                                NodeEventContext :
                                T extends `${DomainType.ANALYSIS}` ?
                                    AnalysisEventContext :
                                    T extends `${DomainType.ANALYSIS_LOG}` ?
                                        AnalysisLogEventContext :
                                        T extends `${DomainType.ANALYSIS_FILE}` ?
                                            AnalysisFileEventContext :
                                            T extends `${DomainType.ANALYSIS_NODE}` | `${DomainSubType.ANALYSIS_NODE_IN}` | `${DomainSubType.ANALYSIS_NODE_OUT}` ?
                                                TrainStationEventContext :
                                                never;

export type DomainEntity<T extends `${DomainType}` | `${DomainSubType}`> =
    T extends `${DomainType.MASTER_IMAGE}` ?
        MasterImage :
        T extends `${DomainType.MASTER_IMAGE_GROUP}` ?
            MasterImageGroup :
            T extends `${DomainType.PROJECT}` ?
                Project :
                T extends `${DomainType.PROJECT_NODE}` | `${DomainSubType.PROJECT_NODE_IN}` | `${DomainSubType.PROJECT_NODE_OUT}` ?
                    ProjectNode :
                    T extends `${DomainType.REGISTRY}` ?
                        Registry :
                        T extends `${DomainType.REGISTRY_PROJECT}` ?
                            RegistryProject :
                            T extends `${DomainType.NODE}` ?
                                Node :
                                T extends `${DomainType.ANALYSIS}` ?
                                    Analysis :
                                    T extends `${DomainType.ANALYSIS_LOG}` ?
                                        AnalysisLog :
                                        T extends `${DomainType.ANALYSIS_FILE}` ?
                                            AnalysisFile :
                                            T extends `${DomainType.ANALYSIS_NODE}` | `${DomainSubType.ANALYSIS_NODE_IN}` | `${DomainSubType.ANALYSIS_NODE_OUT}` ?
                                                AnalysisNode :
                                                never;

export type DomainInput = `${DomainType}` | DomainType | `${DomainSubType}` | DomainSubType;

export type DomainEventFullName<
    T extends DomainInput = DomainInput,
> = `${T}${Capitalize<`${DomainEventName}`>}`;

export type DomainEventSubscriptionFullName<
    T extends DomainInput = DomainInput,
> = `${T}${Capitalize<`${DomainEventSubscriptionName}`>}`;
