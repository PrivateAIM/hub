/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client, Realm, User } from '@authup/core-kit';
import type { ProcessStatus } from '@privateaim/kit';
import type { MasterImage, MasterImageCommandArgument } from '../master-image';
import type { Project } from '../project';
import type { Registry } from '../registry';

export interface Analysis {
    id: string;

    /**
     * URL-friendly identifier (slug). Auto-generated on creation when not provided.
     */
    name: string;

    /**
     * Human-readable label shown in the UI. Falls back to `name` when not set.
     */
    displayName: string | null;

    description: string | null;

    // ------------------------------------------------------------------

    /**
     * Amount of nodes assigned to the analysis.
     */
    nodes: number;

    /**
     * Amount of nodes which approved the analysis.
     */
    nodesApproved: number;

    // ------------------------------------------------------------------

    configurationLocked: boolean;

    /**
     * A root code bucket file is linked for the analysis.
     */
    configurationEntrypointValid : boolean;

    /**
     * Master image is assigned.
     */
    configurationImageValid: boolean;

    /**
     * One or more default nodes are assigned.
     */
    configurationNodeDefaultValid: boolean;

    /**
     * An aggregator is assigned.
     */
    configurationNodeAggregatorValid: boolean;

    /**
     * A default node as well an aggregator node is assigned.
     */
    configurationNodesValid: boolean;

    // ------------------------------------------------------------------

    buildStatus: `${ProcessStatus}` | null;

    /**
     * Define if the node constraints are satisfied for the build process.
     */
    buildNodesValid: boolean;

    /**
     * Percentage for building image
     */
    buildProgress: number | null;

    /**
     * Hash for build process.
     */
    buildHash: string | null;

    /**
     * Operating system
     */
    buildOs: string | null;

    /**
     * Size in bytes
     */
    buildSize: number | null;

    // ------------------------------------------------------------------

    distributionStatus: `${ProcessStatus}` | null;

    /**
     * Percentage for distributing image
     */
    distributionProgress: number | null;

    // ------------------------------------------------------------------

    executionStatus: `${ProcessStatus}` | null;

    executionProgress: number | null;

    // ------------------------------------------------------------------

    createdAt: string;

    updatedAt: string;

    // ------------------------------------------------------------------

    registry: Registry | null;

    registryId: Registry['id'] | null;

    // ------------------------------------------------------------------

    /**
     * Dedicated OAuth2/Authup client the analysis uses to act on the node side
     * under its own (restricted) identity. Provisioned on creation.
     */
    clientId: Client['id'] | null;

    // ------------------------------------------------------------------

    realmId: Realm['id'];

    userId: User['id'];

    // ------------------------------------------------------------------

    projectId: Project['id'];

    project: Project;

    // ------------------------------------------------------------------

    imageCommandArguments: MasterImageCommandArgument[] | null;

    // ------------------------------------------------------------------

    masterImageId: MasterImage['id'] | null;

    masterImage: MasterImage;
}
