/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, Robot } from '@authup/core-kit';
import type { DomainType } from '../constants';
import type { RegistryProject } from '../registry-project';
import type { Registry } from '../registry';
import type { DomainEventBaseContext } from '../types-base';
import type { NodeType } from './constants';

export interface Node {
    id: string;

    external_name: string | null;

    name: string;

    email: string | null;

    hidden: boolean;

    type: `${NodeType}`;

    online: boolean;

    // ------------------------------------------------------------------

    registry_id: Registry['id'];

    registry: Registry;

    registry_project_id: RegistryProject['id'] | null;

    registry_project: RegistryProject;

    // ------------------------------------------------------------------

    robot_id: Robot['id'] | null;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;
}

export type NodeEventContext = DomainEventBaseContext & {
    type: `${DomainType.NODE}`,
    data: Node
};
