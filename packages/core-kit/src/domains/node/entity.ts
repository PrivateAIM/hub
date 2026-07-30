/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client, Realm } from '@authup/core-kit';
import type { RegistryProject } from '../registry-project';
import type { Registry } from '../registry';
import type { NodeType } from './constants';

export interface Node {
    id: string;

    externalName: string | null;

    publicKey: string | null;

    name: string;

    hidden: boolean;

    type: `${NodeType}`;

    online: boolean;

    // ------------------------------------------------------------------

    registryId: Registry['id'] | null;

    registry: Registry | null;

    registryProjectId: RegistryProject['id'] | null;

    registryProject: RegistryProject | null;

    // ------------------------------------------------------------------

    clientId: Client['id'] | null;

    /**
     * @deprecated
     */
    robotId: Client['id'] | null;

    // ------------------------------------------------------------------

    realmId: Realm['id'];

    // ------------------------------------------------------------------

    createdAt: string;

    updatedAt: string;
}
