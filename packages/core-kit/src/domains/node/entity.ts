/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client, Realm, Robot } from '@authup/core-kit';
import type { RegistryProject } from '../registry-project';
import type { Registry } from '../registry';
import type { NodeType } from './constants';

export interface Node {
    id: string;

    external_name: string | null;

    public_key: string | null;

    name: string;

    hidden: boolean;

    type: `${NodeType}`;

    online: boolean;

    // ------------------------------------------------------------------

    registry_id: Registry['id'];

    registry: Registry;

    registry_project_id: RegistryProject['id'] | null;

    registry_project: RegistryProject;

    // ------------------------------------------------------------------

    client_id: Client['id'] | null;

    /**
     * @deprecated
     */
    robot_id: Robot['id'] | null;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;
}
