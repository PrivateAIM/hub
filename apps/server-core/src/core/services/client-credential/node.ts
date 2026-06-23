/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '@privateaim/core-kit';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import type { INodeRepository } from '../../entities/node/types.ts';
import type {
    ClientCredentials,
    ClientCredentialsUpdate,
    IClientCredentialStore,
    INodeClientCredentialService,
} from './types.ts';

type NodeClientCredentialServiceContext = {
    repository: INodeRepository;
    credentialStore: IClientCredentialStore;
};

/**
 * Hands the credentials of a node's dedicated client to the parties allowed to
 * manage the node. Fail-closed: the node's own client may always manage its own
 * credentials (the referenced identity); any other caller must hold NODE_UPDATE
 * and be permitted to write the node's realm (which a master-realm member always
 * is).
 */
export class NodeClientCredentialService implements INodeClientCredentialService {
    protected repository: INodeRepository;

    protected credentialStore: IClientCredentialStore;

    constructor(ctx: NodeClientCredentialServiceContext) {
        this.repository = ctx.repository;
        this.credentialStore = ctx.credentialStore;
    }

    async getCredentials(nodeId: string, actor: ActorContext): Promise<ClientCredentials> {
        const node = await this.repository.findOneById(nodeId);
        if (!node) {
            throw new EntityNotFoundError({ entity: 'node' });
        }

        // Authorize before exposing provisioning state, so an unauthorized
        // caller can never infer it from BadRequest vs PermissionDenied.
        if (!(await this.isAuthorized(node, actor))) {
            throw new PermissionDeniedError('You are not permitted to read the credentials of this node client.');
        }

        if (!node.client_id) {
            throw new BadRequestError('The node has no client provisioned yet.');
        }

        return this.credentialStore.readByClientId(node.client_id);
    }

    async setCredentials(
        nodeId: string,
        data: ClientCredentialsUpdate,
        actor: ActorContext,
    ): Promise<ClientCredentials> {
        const node = await this.repository.findOneById(nodeId);
        if (!node) {
            throw new EntityNotFoundError({ entity: 'node' });
        }

        if (!(await this.isAuthorized(node, actor))) {
            throw new PermissionDeniedError('You are not permitted to write the credentials of this node client.');
        }

        if (!node.client_id) {
            throw new BadRequestError('The node has no client provisioned yet.');
        }

        return this.credentialStore.writeByClientId(node.client_id, data);
    }

    /**
     * Fail-closed: the node's own client may always manage its own credentials
     * (the referenced identity); any other caller must actually hold NODE_UPDATE
     * and be permitted to write the node's realm. Being a master-realm member
     * is, by itself, not sufficient: membership is not a permission.
     */
    private async isAuthorized(node: Node, actor: ActorContext): Promise<boolean> {
        if (
            actor.identity &&
            actor.identity.type === 'client' &&
            !!node.client_id &&
            node.client_id === actor.identity.id
        ) {
            return true;
        }

        try {
            await actor.permissionChecker.preCheck({ name: PermissionName.NODE_UPDATE });
        } catch {
            return false;
        }

        return isRealmResourceWritable(actor.realm, node.realm_id);
    }
}
