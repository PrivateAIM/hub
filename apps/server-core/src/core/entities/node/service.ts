/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node, RegistryProject } from '@privateaim/core-kit';
import { RegistryProjectType } from '@privateaim/core-kit';
import {
    PermissionName,
    createNanoID,
    isHex,
    isRealmResourceWritable,
} from '@privateaim/kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService, ValidatorGroup } from '@privateaim/server-kit';
import type { INodeRepository, INodeService, IRegistryManager } from './types.ts';
import { NodeValidator } from './validator.ts';

type NodeServiceContext = {
    repository: INodeRepository;
    registryManager?: IRegistryManager;
};

export class NodeService extends AbstractEntityService implements INodeService {
    protected repository: INodeRepository;

    protected registryManager?: IRegistryManager;

    protected validator: NodeValidator;

    constructor(ctx: NodeServiceContext) {
        super();
        this.repository = ctx.repository;
        this.registryManager = ctx.registryManager;
        this.validator = new NodeValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Node>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string, query?: Record<string, any>): Promise<Node> {
        const entity = query ?
            await this.repository.findMany({ ...query, filter: { id } }).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async create(data: Partial<Node>, actor: ActorContext): Promise<Node> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.NODE_CREATE });

        await this.repository.validateJoinColumns(validated);

        if (validated.realm_id) {
            if (!isRealmResourceWritable(actor.realm, validated.realm_id)) {
                throw new ForbiddenError('You are not permitted to create this node.');
            }
        } else {
            validated.realm_id = this.getActorRealmId(actor);
        }

        const entity = this.repository.create(validated);

        if (entity.public_key && !isHex(entity.public_key)) {
            entity.public_key = Buffer
                .from(entity.public_key, 'utf8')
                .toString('hex');
        }

        await this.linkRegistryProject(entity);

        return this.repository.save(entity, { data: actor.metadata });
    }

    async update(id: string, data: Partial<Node>, actor: ActorContext): Promise<Node> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.NODE_UPDATE });

        await this.repository.validateJoinColumns(validated);

        if (validated.public_key && !isHex(validated.public_key)) {
            validated.public_key = Buffer
                .from(validated.public_key, 'utf8')
                .toString('hex');
        }

        const entity = await this.repository.findOneWithExternalName(id);
        if (!entity) {
            throw new NotFoundError();
        }

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new ForbiddenError('You are not permitted to update this node.');
        }

        const merged = this.repository.merge(entity, validated);

        await this.syncRegistryProject(merged);

        return this.repository.save(merged, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<Node> {
        await actor.permissionChecker.preCheck({ name: PermissionName.NODE_DELETE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new ForbiddenError('You are not permitted to delete this station.');
        }

        await this.unlinkRegistryProject(entity);

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }

    // ---------------------------------------------------------------

    private async linkRegistryProject(entity: Node): Promise<void> {
        if (!this.registryManager) return;

        let registryId: string | undefined;
        if (entity.registry_id) {
            registryId = entity.registry_id;
        } else {
            registryId = await this.registryManager.findDefaultRegistryId() ?? undefined;
        }

        if (!registryId) return;

        const externalName = entity.external_name || createNanoID();
        entity.external_name = externalName;

        const registryProject = await this.registryManager.createProject({
            external_name: externalName,
            name: entity.name,
            type: RegistryProjectType.NODE,
            realm_id: entity.realm_id,
            registry_id: registryId,
            public: false,
        } as Partial<RegistryProject>);

        entity.registry_project_id = registryProject.id;

        await this.registryManager.linkProject(registryProject.id);
    }

    private async syncRegistryProject(entity: Node): Promise<void> {
        if (!this.registryManager || !entity.registry_id) return;

        const externalName = entity.external_name || createNanoID();

        let registryProject: RegistryProject | undefined;
        if (entity.registry_project_id) {
            registryProject = await this.registryManager.findProject(entity.registry_project_id) ?? undefined;
        }

        if (registryProject) {
            if (registryProject.external_name !== externalName) {
                registryProject.external_name = externalName;
                registryProject.realm_id = entity.realm_id;

                await this.registryManager.saveProject(registryProject);
                await this.registryManager.relinkProject(registryProject);
            }
        } else {
            registryProject = await this.registryManager.createProject({
                external_name: externalName,
                name: entity.name,
                type: RegistryProjectType.NODE,
                realm_id: entity.realm_id,
                registry_id: entity.registry_id,
                public: false,
            } as Partial<RegistryProject>);

            await this.registryManager.linkProject(registryProject.id);
        }

        entity.registry_project_id = registryProject.id;
        entity.external_name = externalName;
    }

    private async unlinkRegistryProject(entity: Node): Promise<void> {
        if (!this.registryManager || !entity.registry_project_id) return;

        const registryProject = await this.registryManager.findProject(entity.registry_project_id);
        if (!registryProject) return;

        await this.registryManager.unlinkProject(registryProject);
        await this.registryManager.removeProject(registryProject);
    }
}
