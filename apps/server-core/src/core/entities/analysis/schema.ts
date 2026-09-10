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
    indexes: [
        ['id'],
        ['name'],
        ['displayName'],
        ['projectId'],
        ['realmId'],
        ['buildStatus'],
        ['executionStatus'],
        ['configurationLocked'],
        ['createdAt'],
        ['updatedAt'],
    ],
    fields: {
        default: ['id', 'name', 'displayName', 'description', 'nodes', 'nodesApproved', 'configurationLocked', 'configurationEntrypointValid', 'configurationImageValid', 'configurationNodeAggregatorValid', 'configurationNodeDefaultValid', 'configurationNodesValid', 'distributionStatus', 'distributionProgress', 'buildNodesValid', 'buildStatus', 'buildProgress', 'buildHash', 'buildOs', 'buildSize', 'executionStatus', 'executionProgress', 'createdAt', 'updatedAt', 'registryId', 'clientId', 'realmId', 'userId', 'projectId', 'masterImageId', 'imageCommandArguments'],
        allowed: ['id', 'name', 'displayName', 'description', 'nodes', 'nodesApproved', 'configurationLocked', 'configurationEntrypointValid', 'configurationImageValid', 'configurationNodeAggregatorValid', 'configurationNodeDefaultValid', 'configurationNodesValid', 'distributionStatus', 'distributionProgress', 'buildNodesValid', 'buildStatus', 'buildProgress', 'buildHash', 'buildOs', 'buildSize', 'executionStatus', 'executionProgress', 'createdAt', 'updatedAt', 'registryId', 'clientId', 'realmId', 'userId', 'projectId', 'masterImageId', 'imageCommandArguments'],
    },
    // `description` is deliberately NOT filterable: it is a `text` column, which
    // cannot carry a plain index under MySQL's utf8mb4 3072-byte key limit, and
    // the indexed-filters invariant requires every allowed key to lead a real
    // index. Nothing in client-vue/client-ui ever filtered on it.
    filters: {
        allowed: ['id', 'name', 'displayName', 'projectId', 'realmId', 'buildStatus', 'executionStatus', 'configurationLocked'],
        indexed: true,
    },
    relations: { allowed: ['project', 'masterImage'] },
    sorts: {
        allowed: ['name', 'displayName', 'createdAt', 'updatedAt'],
        default: { updatedAt: 'DESC' },
        indexed: true,
    },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
