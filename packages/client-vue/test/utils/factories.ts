/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    Analysis, 
    AnalysisNode, 
    Node, 
    Project, 
    ProjectNode,
} from '@privateaim/core-kit';
import { NodeType } from '@privateaim/core-kit';

let counter = 0;

/**
 * The domain interfaces declare relation properties as required, but the
 * API omits them unless the query loads the relation — these factories
 * return that unloaded shape, which is what the `as` casts cover.
 */
export function createTestNode(overrides: Partial<Node> = {}) : Node {
    counter++;

    return {
        id: `node-${counter}`,
        name: `node-${counter}`,
        externalName: null,
        hidden: false,
        type: `${NodeType.DEFAULT}`,
        online: false,
        registryId: null,
        registry: null,
        registryProjectId: null,
        registryProject: null,
        publicKey: null,
        clientId: null,
        robotId: null,
        realmId: 'realm-test',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        ...overrides,
    };
}

export function createTestAnalysisNode(overrides: Partial<AnalysisNode> = {}) : AnalysisNode {
    counter++;

    const node = overrides.node ?? createTestNode();

    return {
        id: `analysis-node-${counter}`,
        approvalStatus: null,
        executionStatus: null,
        executionProgress: null,
        comment: '',
        artifactTag: null,
        artifactDigest: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        analysisId: 'analysis-test',
        analysisRealmId: 'realm-test',
        nodeId: node.id,
        nodeRealmId: node.realmId,
        ...overrides,
        node,
    } as AnalysisNode;
}

export function createTestProject(overrides: Partial<Project> = {}) : Project {
    counter++;

    return {
        id: `project-${counter}`,
        name: `project-${counter}`,
        displayName: null,
        description: null,
        nodes: 0,
        analyses: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        realmId: 'realm-test',
        clientId: null,
        robotId: null,
        userId: 'user-test',
        masterImageId: null,
        masterImage: null,
        ...overrides,
    };
}

export function createTestProjectNode(overrides: Partial<ProjectNode> = {}) : ProjectNode {
    counter++;

    return {
        id: `project-node-${counter}`,
        approvalStatus: null,
        comment: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        projectId: 'project-test',
        projectRealmId: 'realm-test',
        nodeId: 'node-test',
        nodeRealmId: 'realm-other',
        ...overrides,
    } as ProjectNode;
}

export function createTestAnalysis(overrides: Partial<Analysis> = {}) : Analysis {
    counter++;

    return {
        id: `analysis-${counter}`,
        name: `analysis-${counter}`,
        displayName: null,
        description: null,
        nodes: 0,
        nodesApproved: 0,
        configurationLocked: false,
        configurationEntrypointValid: false,
        configurationImageValid: false,
        configurationNodeDefaultValid: false,
        configurationNodeAggregatorValid: false,
        configurationNodesValid: false,
        buildStatus: null,
        buildNodesValid: false,
        buildProgress: null,
        buildHash: null,
        buildOs: null,
        buildSize: null,
        distributionStatus: null,
        distributionProgress: null,
        executionStatus: null,
        executionProgress: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        registry: null,
        registryId: null,
        clientId: null,
        realmId: 'realm-test',
        userId: 'user-test',
        projectId: 'project-test',
        imageCommandArguments: null,
        masterImageId: null,
        ...overrides,
    } as Analysis;
}
