/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Client, 
    Realm, 
    Robot, 
    User,
} from '@authup/core-kit';
import type { MasterImage } from '../master-image';

export interface Project {
    id: string;

    /**
     * URL-friendly identifier (slug). Unique. Auto-generated on creation when
     * not provided.
     */
    name: string;

    /**
     * Human-readable label shown in the UI. Falls back to `name` when not set.
     */
    display_name: string | null;

    description: string | null;

    // ------------------------------------------------------------------

    nodes: number;

    analyses: number;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    client_id: Client['id'] | null;

    robot_id: Robot['id'] | null;

    user_id: User['id'] | null;

    master_image_id: MasterImage['id'] | null;

    master_image: MasterImage | null;
}
