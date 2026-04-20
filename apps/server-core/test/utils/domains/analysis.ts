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
        description: null,
        nodes: 0,
        nodes_approved: 0,
        configuration_locked: false,
        configuration_entrypoint_valid: true,
        configuration_image_valid: true,
        configuration_node_default_valid: true,
        configuration_node_aggregator_valid: true,
        configuration_nodes_valid: true,
        build_status: null,
        build_nodes_valid: true,
        build_progress: null,
        build_hash: null,
        build_os: null,
        build_size: null,
        distribution_status: null,
        distribution_progress: null,
        execution_status: null,
        execution_progress: null,
        created_at: new Date(),
        updated_at: new Date(),
        registry: {} as Registry,
        registry_id: 'registry-1',
        realm_id: 'realm-1',
        user_id: 'user-1',
        project_id: 'project-1',
        project: {} as Project,
        image_command_arguments: null,
        master_image_id: null,
        master_image: {} as MasterImage,
        ...overrides,
    };
}
