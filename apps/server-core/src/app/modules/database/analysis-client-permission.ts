/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientPermission, Permission } from '@authup/core-kit';
import { REALM_SCOPE } from '@authup/core-kit';
import type { AuthupClient, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import type { IClientPermissionStore } from '../../../core/services/analysis-client-permission/index.ts';

/**
 * Authup-backed adapter for the {@link IClientPermissionStore} core port.
 */
export class AuthupClientPermissionStore implements IClientPermissionStore {
    protected authup: AuthupClient;

    constructor(authup: AuthupClient) {
        this.authup = authup;
    }

    async getManyByClientId(clientId: string): Promise<EntityRepositoryFindManyResult<ClientPermission>> {
        const { data, meta } = await this.authup.clientPermission.getMany({
            filters: { clientId },
            relations: { permission: true },
        });

        return { data, meta };
    }

    async findOne(clientId: string, permissionId: string): Promise<ClientPermission | null> {
        const { data } = await this.authup.clientPermission.getMany({ filters: { clientId, permissionId } });

        return data[0] ?? null;
    }

    async getPermission(permissionId: string): Promise<Pick<Permission, 'id' | 'name'>> {
        const { data } = await this.authup.permission.getOne(permissionId);

        return data;
    }

    async create(clientId: string, permissionId: string): Promise<ClientPermission> {
        // Analysis clients reach by binding only (plan 021, D8): a grant scope
        // would let the client act for every analysis of its realm.
        const { data } = await this.authup.clientPermission.create({
            clientId, 
            permissionId, 
            realmScope: REALM_SCOPE.NONE, 
        });

        return data;
    }

    async delete(id: string): Promise<void> {
        await this.authup.clientPermission.delete(id);
    }
}
