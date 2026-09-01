/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '@privateaim/core-kit';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
import type { INodeRepository } from '../../entities/node/types.ts';
import type { IRegistryRepository } from '../../entities/registry/types.ts';
import type { IRegistryProjectRepository } from '../../entities/registry-project/types.ts';
import type { INodeRegistryCredentialService, RegistryCredentials } from './types.ts';

type NodeRegistryCredentialServiceContext = {
    repository: INodeRepository;
    registryRepository: IRegistryRepository;
    registryProjectRepository: IRegistryProjectRepository;
};

/**
 * Hands a node the credentials of its own registry project (Harbor robot
 * account) so it can pull/push images without holding any management
 * permission. Fail-closed — see {@link NodeRegistryCredentialService.isAuthorized}
 * for who may read the secret.
 */
export class NodeRegistryCredentialService extends AbstractEntityService implements INodeRegistryCredentialService {
    protected repository: INodeRepository;

    protected registryRepository: IRegistryRepository;

    protected registryProjectRepository: IRegistryProjectRepository;

    constructor(ctx: NodeRegistryCredentialServiceContext) {
        super();
        this.repository = ctx.repository;
        this.registryRepository = ctx.registryRepository;
        this.registryProjectRepository = ctx.registryProjectRepository;
    }

    async getCredentials(nodeId: string, actor: ActorContext): Promise<RegistryCredentials> {
        const node = await this.repository.findOneById(nodeId);
        if (!node) {
            throw new EntityNotFoundError({ entity: 'node' });
        }

        // Authorize before exposing provisioning state, so an unauthorized
        // caller can never infer it from BadRequest vs PermissionDenied.
        if (!(await this.isAuthorized(node, actor))) {
            throw new PermissionDeniedError('You are not permitted to read the registry credentials of this node.');
        }

        if (!node.registryProjectId) {
            throw new BadRequestError('The node has no registry project provisioned yet.');
        }

        const registryProject = await this.registryProjectRepository.findOneWithSecret(node.registryProjectId);
        if (!registryProject) {
            throw new BadRequestError('The registry project of the node could not be found.');
        }

        const registry = await this.registryRepository.findOneById(registryProject.registryId);
        if (!registry) {
            throw new BadRequestError('The registry of the node could not be found.');
        }

        return {
            host: registry.host,
            externalName: registryProject.externalName,
            accountName: registryProject.accountName,
            accountSecret: registryProject.accountSecret,
        };
    }

    /**
     * Fail-closed, with three ways in:
     *
     * - the node's own client (the referenced identity) reading its own credentials;
     * - a node administrator of the node's realm — {@link PermissionName.NODE_UPDATE}
     *   already owns the whole lifecycle of that registry project (connecting
     *   provisions it, disconnecting destroys it, reconnecting rotates the robot
     *   account), and the secret is scoped to that one project, so withholding it
     *   from the caller who may rotate it protects nothing;
     * - {@link PermissionName.REGISTRY_MANAGE}, which gates this same secret on
     *   the registry-project endpoint.
     *
     * Being a master-realm member is, by itself, not sufficient: membership is
     * not a permission.
     */
    protected async isAuthorized(node: Node, actor: ActorContext): Promise<boolean> {
        if (
            actor.identity &&
            actor.identity.type === 'client' &&
            !!node.clientId &&
            node.clientId === actor.identity.id
        ) {
            return true;
        }

        const holds = async (name: PermissionName): Promise<boolean> => {
            try {
                await actor.permissionChecker.preCheck({ name });
                return true;
            } catch {
                return false;
            }
        };

        // Realm-scoped: NODE_UPDATE never reaches another realm's node.
        if (
            isRealmResourceWritable(actor.realm, node.realmId) &&
            await holds(PermissionName.NODE_UPDATE)
        ) {
            return true;
        }

        return holds(PermissionName.REGISTRY_MANAGE);
    }
}
