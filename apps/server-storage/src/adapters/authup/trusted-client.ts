/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client as AuthupClient } from '@authup/core-http-kit';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The id of the Authup client whose capability-token exchanges storage
 * accepts. An id is taken as it is; a name is looked up in `realm` (id or
 * name), so it resolves the client server-core authenticates as.
 */
export async function resolveAuthupClientId(
    authup: AuthupClient | undefined,
    idOrName: string,
    realm: string,
): Promise<string> {
    if (UUID_PATTERN.test(idOrName)) {
        return idOrName;
    }

    if (!authup) {
        throw new Error(`The client ${idOrName} cannot be resolved without an Authup client.`);
    }

    const { data: realmEntity } = await authup.realm.getOne(realm);

    const { data } = await authup.client.getMany({
        filters: { name: idOrName, realmId: realmEntity.id },
        pagination: { limit: 1 },
    });

    if (data.length === 0) {
        throw new Error(`The client ${idOrName} does not exist in the realm ${realm}.`);
    }

    return data[0].id;
}
