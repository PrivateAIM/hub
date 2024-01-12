/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core';
import type { DomainType } from '../constants';
import type { RegistryProject } from '../registry-project';
import type { Registry } from '../registry';
import type { DomainEventBaseContext } from '../types-base';

export interface Node {
    id: string;

    external_name: string | null;

    name: string;

    email: string | null;

    hidden: boolean;

    // ------------------------------------------------------------------

    registry_id: Registry['id'];

    registry: Registry;

    registry_project_id: RegistryProject['id'] | null;

    registry_project: RegistryProject;

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
