/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Realm,
} from '@authup/core-kit';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import { ServerError } from '@ebec/http';
import { isClientErrorWithStatusCode } from '@hapic/harbor';
import { ServiceID } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { useAuthupClient, useLogger } from '@privateaim/server-kit';

export async function setupAuthupService(): Promise<any> {
    // todo: check if authup client is usable
    const authupClient = useAuthupClient();

    // -------------------------------------------------

    let realm: Realm;

    try {
        realm = await authupClient.realm.getOne(REALM_MASTER_NAME);
    } catch (e) {
        throw new ServerError(`The ${REALM_MASTER_NAME} does not exist.`);
    }

    // -------------------------------------------------

    /**
     * Create registry client account.
     */
    const { data: clients } = await authupClient.client.getMany({
        filter: {
            realm_id: realm.id,
            name: ServiceID.REGISTRY,
        },
    });

    if (clients.length === 0) {
        await authupClient.client.create({
            name: ServiceID.REGISTRY,
            realm_id: realm.id,
        });

        useLogger().debug(`Client ${ServiceID.REGISTRY} created.`);
    } else {
        useLogger().debug(`Client ${ServiceID.REGISTRY} already exists.`);
    }

    // -------------------------------------------------

    /**
     * Create permissions
     */
    const permissionNames = Object.values(PermissionName);
    for (let i = 0; i < permissionNames.length; i++) {
        try {
            await authupClient.permission.create({
                name: permissionNames[i],
            });

            useLogger().debug(`Created permission ${permissionNames[i]}`);
        } catch (e) {
            if (isClientErrorWithStatusCode(e, 409)) {
                useLogger().debug(`Permission ${permissionNames[i]} already exists`);
            } else {
                throw e;
            }
        }
    }
}
