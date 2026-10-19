/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client, Permission } from '@authup/core-kit';
import { ClientAuthMethod, REALM_SCOPE } from '@authup/core-kit';
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
     * Every grant is scoped `none`: it is a capability only, never realm reach.
     * The node acts through its binding (`node.clientId`) on its own node and
     * the analyses it takes part in, not on everything its realm owns. A grant
     * with any other scope (`own` is authup's default) is replaced.
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
            // Node-side services read the analyses their node takes part in.
            PermissionName.ANALYSIS_READ,
            // Node-side services read /nodes to look up their own node and peers' public keys.
            PermissionName.NODE_READ,
            // The node writes the logs of its own analysis runs.
            PermissionName.ANALYSIS_NODE_LOG_CREATE,
        ];
        const assigned = new Set<string>();
        const rescoped: string[] = [];
        const revoked: string[] = [];
        for (const clientPermission of clientPermissions) {
            const { name } = clientPermission.permission;
            if (!permissionNames.includes(name)) {
                revoked.push(clientPermission.id);
                continue;
            }

            if (clientPermission.realmScope !== REALM_SCOPE.NONE) {
                rescoped.push(clientPermission.id);
                continue;
            }

            assigned.add(name);
        }

        // Resolve every permission to grant BEFORE changing anything: a name
        // missing in Authup must fail the sync with the client's grants
        // untouched, not after the old ones were already revoked (which
        // stripped node_read from every node client on an upgrade that ran
        // before analysis_read was provisioned).
        const permissions = new Map<string, Permission>();
        for (const permissionName of permissionNames) {
            if (!assigned.has(permissionName)) {
                permissions.set(permissionName, await this.resolvePermission(permissionName));
            }
        }

        // grant before revoking, so a failing request leaves the client with
        // more than it needs rather than less. A re-scoped grant is the one
        // exception: Authup keeps one grant per (client, permission), so it
        // is replaced in place.
        for (const id of rescoped) {
            await this.authup.clientPermission.delete(id);
        }

        for (const permission of permissions.values()) {
            await this.authup.clientPermission.create({
                clientId,
                permissionId: permission.id,
                realmScope: REALM_SCOPE.NONE,
            });
        }

        for (const id of revoked) {
            await this.authup.clientPermission.delete(id);
        }
    }

    protected async resolvePermission(permissionName: string): Promise<Permission> {
        try {
            const { data } = await this.authup.permission.getOne(permissionName);
            return data;
        } catch (e) {
            if (!isClientErrorWithStatusCode(e, 404)) {
                throw e;
            }

            throw new Error(
                `The permission ${permissionName} is not provisioned in Authup, so it cannot be granted to node clients.`,
                { cause: e },
            );
        }
    }
}
