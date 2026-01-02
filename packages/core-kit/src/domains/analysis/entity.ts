/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, User } from '@authup/core-kit';
import type { ProcessStatus } from '@privateaim/kit';
import type { MasterImage, MasterImageCommandArgument } from '../master-image';
import type { Project } from '../project';
import type { Registry } from '../registry';

export interface Analysis {
    id: string;

    name: string | null;

    description: string | null;

    // ------------------------------------------------------------------

    /**
     * Amount of nodes assigned to the analysis.
     */
    nodes: number;

    /**
     * Amount of nodes which approved the analysis.
     */
    nodes_approved: number;

    // ------------------------------------------------------------------

    configuration_locked: boolean;

    /**
     * A root code bucket file is linked for the analysis.
     */
    configuration_entrypoint_valid : boolean;

    /**
     * Master image is assigned.
     */
    configuration_image_valid: boolean;

    /**
     * One or more default nodes are assigned.
     */
    configuration_node_default_valid: boolean;

    /**
     * An aggregator is assigned.
     */
    configuration_node_aggregator_valid: boolean;

    /**
     * A default node as well an aggregator node is assigned.
     */
    configuration_nodes_valid: boolean;

    // ------------------------------------------------------------------

    build_status: `${ProcessStatus}` | null;

    /**
     * Percentage for building image
     */
    build_progress: number | null;

    /**
     * Define if the node constraints are satisfied for the build process.
     */
    build_nodes_valid: boolean;

    // ------------------------------------------------------------------

    distribution_status: `${ProcessStatus}` | null;

    /**
     * Percentage for distributing image
     */
    distribution_progress: number | null;

    // ------------------------------------------------------------------

    execution_status: `${ProcessStatus}` | null;

    execution_progress: number | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    registry: Registry;

    registry_id: Registry['id'];

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    user_id: User['id'];

    // ------------------------------------------------------------------

    project_id: Project['id'];

    project: Project;

    // ------------------------------------------------------------------

    image_command_arguments: MasterImageCommandArgument[] | null;

    // ------------------------------------------------------------------

    master_image_id: MasterImage['id'] | null;

    master_image: MasterImage;
}
