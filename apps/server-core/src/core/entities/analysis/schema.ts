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
    master_image: DomainType.MASTER_IMAGE,
};

export const analysisSchema = defineSchema<Analysis>({
    name: DomainType.ANALYSIS,
    strict: true,
    fields: {
        default: ['id', 'name', 'display_name', 'description', 'nodes', 'nodes_approved', 'configuration_locked', 'configuration_entrypoint_valid', 'configuration_image_valid', 'configuration_node_aggregator_valid', 'configuration_node_default_valid', 'configuration_nodes_valid', 'distribution_status', 'distribution_progress', 'build_nodes_valid', 'build_status', 'build_progress', 'build_hash', 'build_os', 'build_size', 'execution_status', 'execution_progress', 'created_at', 'updated_at', 'registry_id', 'client_id', 'realm_id', 'user_id', 'project_id', 'master_image_id'],
        allowed: ['id', 'name', 'display_name', 'description', 'nodes', 'nodes_approved', 'configuration_locked', 'configuration_entrypoint_valid', 'configuration_image_valid', 'configuration_node_aggregator_valid', 'configuration_node_default_valid', 'configuration_nodes_valid', 'distribution_status', 'distribution_progress', 'build_nodes_valid', 'build_status', 'build_progress', 'build_hash', 'build_os', 'build_size', 'execution_status', 'execution_progress', 'created_at', 'updated_at', 'registry_id', 'client_id', 'realm_id', 'user_id', 'project_id', 'master_image_id'],
    },
    filters: { allowed: ['id', 'name', 'display_name', 'description', 'project_id', 'realm_id', 'build_status', 'execution_status', 'configuration_locked'] },
    relations: { allowed: ['project', 'master_image'] },
    sort: { allowed: ['created_at', 'updated_at'], default: { updated_at: 'DESC' } },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
