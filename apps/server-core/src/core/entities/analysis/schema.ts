/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { Analysis } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = {
    project: DomainType.PROJECT,
    masterImage: DomainType.MASTER_IMAGE,
};

export const analysisSchema = defineSchema<Analysis>({
    name: DomainType.ANALYSIS,
    strict: true,
    fields: {
        default: ['id', 'name', 'displayName', 'description', 'nodes', 'nodesApproved', 'configurationLocked', 'configurationEntrypointValid', 'configurationImageValid', 'configurationNodeAggregatorValid', 'configurationNodeDefaultValid', 'configurationNodesValid', 'distributionStatus', 'distributionProgress', 'buildNodesValid', 'buildStatus', 'buildProgress', 'buildHash', 'buildOs', 'buildSize', 'executionStatus', 'executionProgress', 'createdAt', 'updatedAt', 'registryId', 'clientId', 'realmId', 'userId', 'projectId', 'masterImageId', 'imageCommandArguments'],
        allowed: ['id', 'name', 'displayName', 'description', 'nodes', 'nodesApproved', 'configurationLocked', 'configurationEntrypointValid', 'configurationImageValid', 'configurationNodeAggregatorValid', 'configurationNodeDefaultValid', 'configurationNodesValid', 'distributionStatus', 'distributionProgress', 'buildNodesValid', 'buildStatus', 'buildProgress', 'buildHash', 'buildOs', 'buildSize', 'executionStatus', 'executionProgress', 'createdAt', 'updatedAt', 'registryId', 'clientId', 'realmId', 'userId', 'projectId', 'masterImageId', 'imageCommandArguments'],
    },
    filters: { allowed: ['id', 'name', 'displayName', 'description', 'projectId', 'realmId', 'buildStatus', 'executionStatus', 'configurationLocked'] },
    relations: { allowed: ['project', 'masterImage'] },
    sort: { allowed: ['name', 'displayName', 'createdAt', 'updatedAt'], default: { updatedAt: 'DESC' } },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
