/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { 
    Analysis, 
    MasterImage, 
    Project, 
    Registry, 
} from '@privateaim/core-kit';

export function createTestAnalysis(entity: Partial<Analysis> = {}) : Partial<Analysis> {
    return {
        name: faker.string.alpha({ length: 16, casing: 'lower' }),
        ...entity,
    };
}

export function createFullAnalysis(overrides?: Partial<Analysis>): Analysis {
    return {
        id: 'analysis-1',
        name: 'test-analysis',
        displayName: null,
        description: null,
        nodes: 0,
        nodesApproved: 0,
        configurationLocked: false,
        configurationEntrypointValid: true,
        configurationImageValid: true,
        configurationNodeDefaultValid: true,
        configurationNodeAggregatorValid: true,
        configurationNodesValid: true,
        buildStatus: null,
        buildNodesValid: true,
        buildProgress: null,
        buildHash: null,
        buildOs: null,
        buildSize: null,
        distributionStatus: null,
        distributionProgress: null,
        executionStatus: null,
        executionProgress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        registry: { id: 'registry-1' } as Registry,
        registryId: 'registry-1',
        realmId: 'realm-1',
        userId: 'user-1',
        projectId: 'project-1',
        project: { id: 'project-1' } as Project,
        imageCommandArguments: null,
        masterImageId: 'master-image-1',
        masterImage: { id: 'master-image-1' } as MasterImage,
        ...overrides,
    };
}
