/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client, Permission } from '@authup/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { AuthupClient } from '@privateaim/server-kit';
import { useAuthupClient, useLogger } from '@privateaim/server-kit';
import { isClientErrorWithStatusCode } from 'hapic';
import type { NodeEntity } from '../../database/index.ts';

export class NodeClientService {
    protected authup : AuthupClient;

    constructor() {
        this.authup = useAuthupClient();
    }

    async dismiss(entity: NodeEntity) : Promise<void> {
        if (!entity.client_id) {
            return;
        }

        try {
            await this.authup.client.delete(entity.client_id);
        } catch (e) {
            if (!isClientErrorWithStatusCode(e, 404)) {
                throw e;
            }
        }

        entity.client_id = null;
    }

    async assign(entity: NodeEntity) : Promise<Client> {
        let client : Client | undefined;

        if (entity.client_id) {
            try {
                client = await this.authup.client.getOne(entity.client_id);
            } catch (e) {
                if (!isClientErrorWithStatusCode(e, 404)) {
                    throw e;
                }
            }
        }

        if (!client) {
            client = await this.authup.client.create({
                name: entity.id,
                realm_id: entity.realm_id,
                is_confidential: true,
            });

            entity.client_id = client.id;
        }

        return client;
    }

    async assignPermissions(client: Client) {
        const { data: clientPermissions } = await this.authup
            .clientPermission.getMany({
                relations: {
                    permission: true,
                },
                filter: {
                    client_id: client.id,
                },
            });

        const permissionNames : string[] = [
            PermissionName.ANALYSIS_APPROVE,
            PermissionName.ANALYSIS_UPDATE,
            PermissionName.PROJECT_APPROVE,
        ];
        const permissionNamesAssigned : string[] = [];

        const relationsToDelete : string[] = [];
        for (let i = 0; i < clientPermissions.length; i++) {
            const index = permissionNames.indexOf(clientPermissions[i].permission.name);
            if (index === -1) {
                relationsToDelete.push(clientPermissions[i].id);
            }

            permissionNamesAssigned.push(clientPermissions[i].permission.name);
        }

        if (relationsToDelete.length > 0) {
            for (let i = 0; i < relationsToDelete.length; i++) {
                await this.authup.clientPermission.delete(relationsToDelete[i]);
            }
        }

        for (let i = 0; i < permissionNames.length; i++) {
            const index = permissionNamesAssigned.indexOf(permissionNames[i]);
            if (index !== -1) {
                continue;
            }

            let permission : Permission;

            try {
                permission = await this.authup.permission.getOne(permissionNames[i]);
            } catch (e) {
                if (!isClientErrorWithStatusCode(e, 404)) {
                    throw e;
                }

                useLogger()
                    .warn(`The node-client permission could not be created, due non existing permission ${permissionNames[i]}.`);
            }

            if (permission) {
                await this.authup.clientPermission.create({
                    client_id: client.id,
                    permission_id: permission.id,
                });
            }
        }
    }
}
