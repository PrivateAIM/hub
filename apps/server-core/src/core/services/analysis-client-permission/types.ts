/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientPermission, Permission } from '@authup/core-kit';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';

/**
 * Port for an OAuth2 client's permission assignments. The concrete,
 * Authup-backed adapter lives in the app layer.
 */
export interface IClientPermissionStore {
    /** All assignments of the client, with the permission relation loaded. */
    getManyByClientId(clientId: string): Promise<EntityRepositoryFindManyResult<ClientPermission>>;

    /** The assignment of `permissionId` to the client, or `null` if there is none. */
    findOne(clientId: string, permissionId: string): Promise<ClientPermission | null>;

    /** The permission itself, so its name can be checked before it is assigned. */
    getPermission(permissionId: string): Promise<Pick<Permission, 'id' | 'name'>>;

    create(clientId: string, permissionId: string): Promise<ClientPermission>;

    /** Removes an assignment by its own id, not by the permission's. */
    delete(id: string): Promise<void>;
}

export interface IAnalysisClientPermissionService {
    getMany(analysisId: string, actor: ActorContext): Promise<EntityRepositoryFindManyResult<ClientPermission>>;

    create(analysisId: string, data: { permissionId?: string }, actor: ActorContext): Promise<ClientPermission>;

    delete(analysisId: string, permissionId: string, actor: ActorContext): Promise<ClientPermission>;
}
