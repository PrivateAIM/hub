/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client, Permission } from '@authup/core-kit';
import { ClientAuthMethod } from '@authup/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { AuthupClient, Logger } from '@privateaim/server-kit';
import { isClientErrorWithStatusCode } from 'hapic';
import type { AnalysisEntity } from '../../../adapters/database/entities/index.ts';

/**
 * Self-capabilities granted to a freshly minted analysis client. They let the
 * running analysis act on the node side under its own (restricted) identity.
 * Assigned once, additively, on creation — admins refine the set per analysis
 * later (plan 010, phase 2), so this service never removes permissions.
 */
const DEFAULT_PERMISSION_NAMES: string[] = [
    PermissionName.ANALYSIS_SELF_STORAGE_USE,
    PermissionName.ANALYSIS_SELF_MESSAGE_BROKER_USE,
];

export class AnalysisClientService {
    protected authup: AuthupClient;

    protected logger?: Logger;

    constructor(authup: AuthupClient, logger?: Logger) {
        this.authup = authup;
        this.logger = logger;
    }

    async dismiss(entity: AnalysisEntity): Promise<void> {
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

    async assign(entity: AnalysisEntity): Promise<Client> {
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
                realmId: entity.realm_id,
                authMethod: ClientAuthMethod.SECRET,
            });

            entity.client_id = client.id;
        }

        return client;
    }

    /**
     * Additively grant the default self-capabilities to the analysis client.
     * Existing client permissions are never removed (unlike the node client),
     * so an admin's later refinements survive subsequent calls.
     */
    async assignDefaultPermissions(client: Client): Promise<void> {
        const { data: clientPermissions } = await this.authup
            .clientPermission.getMany({
                relations: { permission: true },
                filters: { clientId: client.id },
            });

        const permissionNamesAssigned = clientPermissions.map(
            (clientPermission) => clientPermission.permission.name,
        );

        for (const permissionName of DEFAULT_PERMISSION_NAMES) {
            if (permissionNamesAssigned.includes(permissionName)) {
                continue;
            }

            let permission: Permission | undefined;

            try {
                permission = await this.authup.permission.getOne(permissionName);
            } catch (e) {
                if (!isClientErrorWithStatusCode(e, 404)) {
                    throw e;
                }

                this.logger?.warn(`The analysis-client permission could not be created, due non existing permission ${permissionName}.`);
            }

            if (permission) {
                await this.authup.clientPermission.create({
                    clientId: client.id,
                    permissionId: permission.id,
                });
            }
        }
    }
}
