/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
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
 * permission. Fail-closed: only a master-realm member or the node's own client
 * may read the secret — everything else is denied.
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

        if (!node.registry_project_id) {
            throw new BadRequestError('The node has no registry project provisioned yet.');
        }

        const registryProject = await this.registryProjectRepository.findOneWithSecret(node.registry_project_id);
        if (!registryProject) {
            throw new BadRequestError('The registry project of the node could not be found.');
        }

        const registry = await this.registryRepository.findOneById(registryProject.registry_id);
        if (!registry) {
            throw new BadRequestError('The registry of the node could not be found.');
        }

        return {
            host: registry.host,
            external_name: registryProject.external_name,
            account_name: registryProject.account_name,
            account_secret: registryProject.account_secret,
        };
    }

    /**
     * Fail-closed: the node's own client may always read its own credentials
     * (the referenced identity); any other caller must actually hold
     * {@link PermissionName.REGISTRY_MANAGE} — the same permission that gates
     * this secret on the registry-project endpoint. Being a master-realm member
     * is, by itself, not sufficient: membership is not a permission.
     */
    protected async isAuthorized(node: Node, actor: ActorContext): Promise<boolean> {
        if (
            actor.identity &&
            actor.identity.type === 'client' &&
            !!node.client_id &&
            node.client_id === actor.identity.id
        ) {
            return true;
        }

        try {
            await actor.permissionChecker.preCheck({ name: PermissionName.REGISTRY_MANAGE });
            return true;
        } catch {
            return false;
        }
    }
}
