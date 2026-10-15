/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client, Permission } from '@authup/core-kit';
import { ClientAuthMethod } from '@authup/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { AuthupClient } from '@privateaim/server-kit';
import { isClientErrorWithStatusCode } from 'hapic';
import type { NodeEntity } from '../../../adapters/database/entities/index.ts';

export class NodeClientService {
    protected authup: AuthupClient;

    constructor(authup: AuthupClient) {
        this.authup = authup;
    }

    async dismiss(entity: NodeEntity): Promise<void> {
        if (!entity.clientId) {
            return;
        }

        try {
            await this.authup.client.delete(entity.clientId);
        } catch (e) {
            if (!isClientErrorWithStatusCode(e, 404)) {
                throw e;
            }
        }

        entity.clientId = null;
    }

    async assign(entity: NodeEntity): Promise<Client> {
        let client: Client | undefined;

        if (entity.clientId) {
            try {
                const { data } = await this.authup.client.getOne(entity.clientId);
                client = data;
            } catch (e) {
                if (!isClientErrorWithStatusCode(e, 404)) {
                    throw e;
                }
            }
        }

        if (!client) {
            const { data } = await this.authup.client.create({
                name: entity.id,
                realmId: entity.realmId,
                authMethod: ClientAuthMethod.SECRET,
            });

            client = data;
            entity.clientId = client.id;
        }

        return client;
    }

    /**
     * Grant the node client exactly the permissions a node needs, removing any
     * other. Idempotent, so it also runs at boot for every existing node
     * (see NodeClientModule) to grant permissions a release added.
     *
     * Throws when a permission is not provisioned in Authup: a node client
     * missing it fails against the hub later, far from the cause.
     */
    async assignPermissions(clientId: Client['id']) {
        const { data: clientPermissions } = await this.authup
            .clientPermission.getMany({
                relations: { permission: true },
                filters: { clientId },
            });

        const permissionNames: string[] = [
            // todo: remove this permission, node should be permissionless
            PermissionName.ANALYSIS_UPDATE,
            // Node-side services read the analyses their node takes part in.
            PermissionName.ANALYSIS_READ,
            // Node-side services read /nodes to look up their own node and peers' public keys.
            PermissionName.NODE_READ,
        ];
        const permissionNamesAssigned: string[] = [];

        const relationsToDelete: string[] = [];
        for (const clientPermission of clientPermissions) {
            const index = permissionNames.indexOf(clientPermission.permission.name);
            if (index === -1) {
                relationsToDelete.push(clientPermission.id);
            }

            permissionNamesAssigned.push(clientPermission.permission.name);
        }

        if (relationsToDelete.length > 0) {
            for (const element of relationsToDelete) {
                await this.authup.clientPermission.delete(element);
            }
        }

        for (const permissionName of permissionNames) {
            const index = permissionNamesAssigned.indexOf(permissionName);
            if (index !== -1) {
                continue;
            }

            let permission: Permission;

            try {
                const { data } = await this.authup.permission.getOne(permissionName);
                permission = data;
            } catch (e) {
                if (!isClientErrorWithStatusCode(e, 404)) {
                    throw e;
                }

                throw new Error(
                    `The permission ${permissionName} is not provisioned in Authup, so it cannot be granted to node clients.`,
                    { cause: e },
                );
            }

            await this.authup.clientPermission.create({
                clientId,
                permissionId: permission.id,
            });
        }
    }
}
