/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import type { INodeRepository } from '../../entities/node/types.ts';
import type {
    ClientCredentials,
    IClientCredentialReader,
    INodeClientCredentialService,
} from './types.ts';

type NodeClientCredentialServiceContext = {
    repository: INodeRepository;
    credentialReader: IClientCredentialReader;
};

/**
 * Hands the credentials of a node's dedicated client to the parties allowed to
 * manage the node, mirroring the analysis client credential pull path.
 * Fail-closed: the actor must hold NODE_UPDATE and be permitted to write the
 * node's realm (which a master-realm member always is).
 */
export class NodeClientCredentialService implements INodeClientCredentialService {
    protected repository: INodeRepository;

    protected credentialReader: IClientCredentialReader;

    constructor(ctx: NodeClientCredentialServiceContext) {
        this.repository = ctx.repository;
        this.credentialReader = ctx.credentialReader;
    }

    async getCredentials(nodeId: string, actor: ActorContext): Promise<ClientCredentials> {
        const node = await this.repository.findOneById(nodeId);
        if (!node) {
            throw new EntityNotFoundError({ entity: 'node' });
        }

        if (!node.client_id) {
            throw new BadRequestError('The node has no client provisioned yet.');
        }

        await actor.permissionChecker.preCheck({ name: PermissionName.NODE_UPDATE });

        if (!isRealmResourceWritable(actor.realm, node.realm_id)) {
            throw new PermissionDeniedError('You are not permitted to read the credentials of this node client.');
        }

        return this.credentialReader.readByClientId(node.client_id);
    }
}
