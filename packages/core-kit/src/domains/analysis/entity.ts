/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, User } from '@authup/core-kit';
import type { MasterImage, MasterImageCommandArgument } from '../master-image';
import type { Project } from '../project';
import type {
    AnalysisBuildStatus,
    AnalysisRunStatus,
} from './constants';
import type { Registry } from '../registry';

export interface Analysis {
    id: string;

    name: string | null;

    description: string | null;

    nodes: number;

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

    build_status: AnalysisBuildStatus | null;

    // ------------------------------------------------------------------

    /**
     * todo: add distribution_status
     */

    // ------------------------------------------------------------------
    /**
     * todo: rename to execution_status
     */
    run_status: AnalysisRunStatus | null;

    /**
     * todo: add execution_progress
     */

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
