/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum DomainType {
    MASTER_IMAGE = 'masterImage',
    MASTER_IMAGE_GROUP = 'masterImageGroup',
    PROJECT = 'project',
    PROJECT_NODE = 'projectNode',
    REGISTRY = 'registry',
    REGISTRY_PROJECT = 'registryProject',
    NODE = 'node',
    ANALYSIS = 'analysis',
    ANALYSIS_BUCKET = 'analysisBucket',
    ANALYSIS_BUCKET_FILE = 'analysisBucketFile',
    ANALYSIS_LOG = 'analysisLog',
    ANALYSIS_NODE = 'analysisNode',
    ANALYSIS_NODE_EVENT = 'analysisNodeEvent',
    ANALYSIS_NODE_LOG = 'analysisNodeLog',
    ANALYSIS_PERMISSION = 'analysisPermission',
}

export enum DomainSubType {
    PROJECT_NODE_IN = 'projectNodeIn',
    PROJECT_NODE_OUT = 'projectNodeOut',
    ANALYSIS_NODE_IN = 'analysisNodeIn',
    ANALYSIS_NODE_OUT = 'analysisNodeOut',
}

export enum DomainEventName {
    CREATED = 'created',
    DELETED = 'deleted',
    UPDATED = 'updated',
}

export enum DomainEventSubscriptionName {
    SUBSCRIBE = 'subscribe',
    UNSUBSCRIBE = 'unsubscribe',
}
