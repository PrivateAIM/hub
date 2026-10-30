/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry, RegistryProject } from '@privateaim/core-kit';
import { RegistryAPICommand, RegistryValidator  } from '@privateaim/core-kit';
import {
    PermissionName,
    ValidatorGroup,
    getHostNameFromString,
    isObject,
} from '@privateaim/kit';
import { BadRequestError, EntityNotFoundError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';
import { AbstractEntityService, appendQueryConditions, scopeReadQuery  } from '@privateaim/server-kit';
import { eq } from '@rapiq/core';
import type { IRegistryDispatcher } from '../../harbor/types.ts';
import { decodeQuery } from '../../query/index.ts';
import { registrySchema } from './schema.ts';
import type { IRegistryRepository, IRegistryService } from './types.ts';

type RegistryServiceContext = {
    repository: IRegistryRepository;
    registryProjectRepository?: IEntityRepository<RegistryProject>;
    registryDispatcher?: IRegistryDispatcher;
};

/**
 * The permission-gated field, as a checked literal. `checkSecretFieldAccess`
 * compares raw `?fields=` tokens against it, and a stale string there would skip
 * the REGISTRY_MANAGE pre-check entirely rather than fail — so `satisfies` keeps
 * it pinned to the property name.
 */
const SECRET_FIELD = 'accountSecret' satisfies keyof Registry;

/**
 * Registries are a global catalog: any one of these grants reads every
 * registry. The grant is checked, but results are not narrowed by realm.
 */
export const REGISTRY_READ_PERMISSIONS = [
    PermissionName.REGISTRY_READ,
    PermissionName.REGISTRY_MANAGE,
];

export class RegistryService extends AbstractEntityService implements IRegistryService {
    protected repository: IRegistryRepository;

    protected registryProjectRepository?: IEntityRepository<RegistryProject>;

    protected registryDispatcher?: IRegistryDispatcher;

    protected validator: RegistryValidator;

    constructor(ctx: RegistryServiceContext) {
        super();
        this.repository = ctx.repository;
        this.registryProjectRepository = ctx.registryProjectRepository;
        this.registryDispatcher = ctx.registryDispatcher;
        this.validator = new RegistryValidator();
    }

    async getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<Registry>> {
        const scoped = await scopeReadQuery(
            decodeQuery(query, { schema: registrySchema }),
            actor,
            { names: REGISTRY_READ_PERMISSIONS, compile: false },
        );

        await this.checkSecretFieldAccess(query, actor);

        return this.repository.findMany(scoped);
    }

    async getOne(id: string, actor: ActorContext, query?: Record<string, any>): Promise<Registry> {
        await actor.permissionEvaluator.preEvaluateOneOf({ name: REGISTRY_READ_PERMISSIONS });

        if (query) {
            await this.checkSecretFieldAccess(query, actor);
        }

        const entity = query ?
            await this.repository.findMany(appendQueryConditions(decodeQuery(query, { schema: registrySchema, parameters: ['fields', 'relations'] }), eq('id', id))).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'registry' });
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
            .includes(SECRET_FIELD);

        if (requestsSecret) {
            await actor.permissionEvaluator.preEvaluate({ name: PermissionName.REGISTRY_MANAGE });
        }
    }

    async create(data: Partial<Registry>, actor: ActorContext): Promise<Registry> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.REGISTRY_MANAGE });

        if (validated.host) {
            validated.host = getHostNameFromString(validated.host);
        }

        const entity = this.repository.create(validated);

        return this.repository.save(entity, { data: actor.metadata });
    }

    async update(id: string, data: Partial<Registry>, actor: ActorContext): Promise<Registry> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.REGISTRY_MANAGE });

        if (validated.host) {
            validated.host = getHostNameFromString(validated.host);
        }

        const entity = await this.repository.findOneBy({ id });

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'registry' });
        }

        const merged = this.repository.merge(entity, validated);

        return this.repository.save(merged, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<Registry> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.REGISTRY_MANAGE });

        const entity = await this.repository.findOneBy({ id });

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'registry' });
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
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.REGISTRY_MANAGE });

        if (!this.registryDispatcher) {
            throw new BadRequestError('Registry dispatcher is not available.');
        }

        switch (command) {
            case RegistryAPICommand.SETUP:
            case RegistryAPICommand.CLEANUP:
            case RegistryAPICommand.DELETE: {
                const entity = await this.repository.findOneWithSecret(data.id);

                if (!entity) {
                    throw new EntityNotFoundError({ entity: 'registry' });
                }

                const commandMap: Record<string, string> = {
                    [RegistryAPICommand.SETUP]: 'SETUP',
                    [RegistryAPICommand.CLEANUP]: 'CLEANUP',
                    [RegistryAPICommand.DELETE]: 'DELETE',
                };

                await this.registryDispatcher.dispatch(commandMap[command], { id: entity.id }, {});

                break;
            }
            case RegistryAPICommand.PROJECT_LINK:
            case RegistryAPICommand.PROJECT_UNLINK: {
                if (!this.registryProjectRepository) {
                    throw new BadRequestError('Registry project repository is not available.');
                }

                const entity = await this.registryProjectRepository.findOneBy({ id: data.id });

                if (!entity) {
                    throw new EntityNotFoundError({ entity: 'registry-project' });
                }

                if (command === RegistryAPICommand.PROJECT_LINK) {
                    await this.registryDispatcher.dispatch(
                        'PROJECT_LINK',
                        { id: entity.id, secret: data.secret },
                        {},
                    );
                } else {
                    await this.registryDispatcher.dispatch(
                        'PROJECT_UNLINK',
                        {
                            id: entity.id,
                            registryId: entity.registryId,
                            externalName: entity.externalName,
                            accountId: entity.accountId,
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
