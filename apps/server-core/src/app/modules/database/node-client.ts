/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client, Permission } from '@authup/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { AuthupClient, Logger } from '@privateaim/server-kit';
import { isClientErrorWithStatusCode } from 'hapic';
import type { NodeEntity } from '../../../adapters/database/entities/index.ts';

export class NodeClientService {
    protected authup: AuthupClient;

    protected logger?: Logger;

    constructor(authup: AuthupClient, logger?: Logger) {
        this.authup = authup;
        this.logger = logger;
    }

    async dismiss(entity: NodeEntity): Promise<void> {
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

    async assign(entity: NodeEntity): Promise<Client> {
        let client: Client | undefined;

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
                relations: { permission: true },
                filter: { client_id: client.id },
            });

        const permissionNames: string[] = [
            PermissionName.ANALYSIS_APPROVE,
            PermissionName.ANALYSIS_UPDATE,
            PermissionName.PROJECT_APPROVE,
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
                permission = await this.authup.permission.getOne(permissionName);
            } catch (e) {
                if (!isClientErrorWithStatusCode(e, 404)) {
                    throw e;
                }

                this.logger?.warn(`The node-client permission could not be created, due non existing permission ${permissionName}.`);
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
