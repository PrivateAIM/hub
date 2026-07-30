/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type { Registry } from '../registry';
import type { RegistryProjectType } from './constants';

export interface RegistryProject {
    id: string;

    name: string;

    type: `${RegistryProjectType}`;

    public: boolean;

    // ------------------------------------------------------------------

    // a-z0-9-_ {0,255}
    externalName: string;

    externalId: string | null;

    // ------------------------------------------------------------------

    accountId: string | null;

    accountName: string | null;

    accountSecret: string | null;

    // ------------------------------------------------------------------

    webhookName: string | null;

    webhookExists: boolean | null;

    // ------------------------------------------------------------------

    registryId: Registry['id'];

    registry: Registry;

    // ------------------------------------------------------------------

    realmId: Realm['id'] | null;

    // ------------------------------------------------------------------

    createdAt: string;

    updatedAt: string;
}
