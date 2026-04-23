/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry, RegistryProject } from '@privateaim/core-kit';
import { RegistryAPICommand } from '@privateaim/core-kit';
import { PermissionName, getHostNameFromString, isObject } from '@privateaim/kit';
import { BadRequestError, NotFoundError } from '@ebec/http';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';
import { AbstractEntityService, ValidatorGroup } from '@privateaim/server-kit';
import type { IRegistryCaller } from '../../harbor/types.ts';
import type { IRegistryRepository, IRegistryService } from './types.ts';
import { RegistryValidator } from './validator.ts';

type RegistryServiceContext = {
    repository: IRegistryRepository;
    registryProjectRepository?: IEntityRepository<RegistryProject>;
    registryCaller?: IRegistryCaller;
};

export class RegistryService extends AbstractEntityService implements IRegistryService {
    protected repository: IRegistryRepository;

    protected registryProjectRepository?: IEntityRepository<RegistryProject>;

    protected registryCaller?: IRegistryCaller;

    protected validator: RegistryValidator;

    constructor(ctx: RegistryServiceContext) {
        super();
        this.repository = ctx.repository;
        this.registryProjectRepository = ctx.registryProjectRepository;
        this.registryCaller = ctx.registryCaller;
        this.validator = new RegistryValidator();
    }

    async getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<Registry>> {
        await this.checkSecretFieldAccess(query, actor);

        return this.repository.findMany(query);
    }

    async getOne(id: string, actor: ActorContext, query?: Record<string, any>): Promise<Registry> {
        if (query) {
            await this.checkSecretFieldAccess(query, actor);
        }

        const entity = query ?
            await this.repository.findMany({ ...query, filter: { id } }).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    private async checkSecretFieldAccess(query: Record<string, any>, actor: ActorContext): Promise<void> {
        const { fields } = query;
        if (!fields) {
            return;
        }

        const tokens: string[] = [];
        const collect = (v: unknown) => {
            if (typeof v === 'string') {
                tokens.push(...v.split(','));
            } else if (Array.isArray(v)) {
                v.forEach(collect);
            } else if (isObject(v)) {
                Object.values(v).forEach(collect);
            }
        };
        collect(fields);

        const requestsSecret = tokens
            .map((t) => t.trim().replace(/^[+-]/, ''))
            .includes('account_secret');

        if (requestsSecret) {
            await actor.permissionChecker.preCheck({ name: PermissionName.REGISTRY_MANAGE });
        }
    }

    async create(data: Partial<Registry>, actor: ActorContext): Promise<Registry> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.REGISTRY_MANAGE });

        if (validated.host) {
            validated.host = getHostNameFromString(validated.host);
        }

        const entity = this.repository.create(validated);

        return this.repository.save(entity, { data: actor.metadata });
    }

    async update(id: string, data: Partial<Registry>, actor: ActorContext): Promise<Registry> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.REGISTRY_MANAGE });

        if (validated.host) {
            validated.host = getHostNameFromString(validated.host);
        }

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        const merged = this.repository.merge(entity, validated);

        return this.repository.save(merged, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<Registry> {
        await actor.permissionChecker.preCheck({ name: PermissionName.REGISTRY_MANAGE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }

    async executeCommand(
        command: `${RegistryAPICommand}`,
        data: { id: string; secret?: string },
        actor: ActorContext,
    ): Promise<void> {
        await actor.permissionChecker.preCheck({ name: PermissionName.REGISTRY_MANAGE });

        if (!this.registryCaller) {
            throw new BadRequestError('Registry caller is not available.');
        }

        switch (command) {
            case RegistryAPICommand.SETUP:
            case RegistryAPICommand.CLEANUP:
            case RegistryAPICommand.DELETE: {
                const entity = await this.repository.findOneWithSecret(data.id);
                if (!entity) {
                    throw new NotFoundError();
                }

                const commandMap: Record<string, string> = {
                    [RegistryAPICommand.SETUP]: 'SETUP',
                    [RegistryAPICommand.CLEANUP]: 'CLEANUP',
                    [RegistryAPICommand.DELETE]: 'DELETE',
                };

                await this.registryCaller.call(commandMap[command], { id: entity.id }, {});
                break;
            }
            case RegistryAPICommand.PROJECT_LINK:
            case RegistryAPICommand.PROJECT_UNLINK: {
                if (!this.registryProjectRepository) {
                    throw new BadRequestError('Registry project repository is not available.');
                }

                const entity = await this.registryProjectRepository.findOneBy({ id: data.id });
                if (!entity) {
                    throw new NotFoundError();
                }

                if (command === RegistryAPICommand.PROJECT_LINK) {
                    await this.registryCaller.call(
                        'PROJECT_LINK',
                        { id: entity.id, secret: data.secret },
                        {},
                    );
                } else {
                    await this.registryCaller.call(
                        'PROJECT_UNLINK',
                        {
                            id: entity.id,
                            registryId: entity.registry_id,
                            externalName: entity.external_name,
                            accountId: entity.account_id,
                        },
                        {},
                    );
                }
                break;
            }
            default: {
                throw new BadRequestError(`Unknown command: ${command}`);
            }
        }
    }
}
