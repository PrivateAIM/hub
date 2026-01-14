/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isAuthupClientUsable, useAuthupClient } from '@privateaim/server-kit';
import type { RelationsParseOutputElement } from 'rapiq';
import { parseQueryRelations } from 'rapiq';
import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send, useRequestParam } from 'routup';
import {
    applyQuery, applyQueryRelationsParseOutput, useDataSource,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import type { Permission, Policy } from '@authup/core-kit';
import { isRealmResourceReadable } from '@privateaim/kit';
import { useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { AnalysisPermissionEntity, onlyRealmWritableQueryResources } from '../../../../../database/domains/index.ts';

type RelationMapKey = 'analysis' | 'permission' | 'policy';
type RelationsMap = {
    [K in RelationMapKey]?: RelationsParseOutputElement
};

function getRelations(req: Request) : RelationsMap {
    const relations = parseQueryRelations(useRequestQuery(req, 'include'), {
        allowed: ['analysis', 'permission', 'policy'],
    });

    const output : Record<string, RelationsParseOutputElement> = {};
    for (let i = 0; i < relations.length; i++) {
        output[relations[i].value] = relations[i];
    }

    return output;
}

function groupById<T extends { id: string }>(input: T[]) : Record<string, T> {
    const output : Record<string, T> = {};

    for (let i = 0; i < input.length; i++) {
        output[input[i].id] = input[i];
    }

    return output;
}

export async function getOneAnalysisPermissionRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisPermissionEntity);
    const query = repository.createQueryBuilder('analysisPermission')
        .where('analysisPermission.id = :id', { id });

    const relationsMap = getRelations(req);

    if (relationsMap.analysis) {
        applyQueryRelationsParseOutput(query, [
            relationsMap.analysis,
        ], {
            defaultAlias: 'analysisPermission',
        });
    }

    const entity = await query.getOne();
    if (!entity) {
        throw new NotFoundError();
    }

    if (isAuthupClientUsable()) {
        const authupClient = useAuthupClient();

        if (relationsMap.permission) {
            entity.permission = await authupClient.permission.getOne(entity.permission_id);
        }

        if (relationsMap.policy) {
            if (entity.policy_id) {
                entity.policy = await authupClient.policy.getOne(entity.policy_id);
            }
        }
    }

    if (!isRealmResourceReadable(useRequestIdentityRealm(req), entity.analysis_realm_id)) {
        throw new ForbiddenError();
    }

    return send(res, entity);
}

export async function getManyAnalysisPermissionRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisPermissionEntity);
    const query = repository.createQueryBuilder('analysisPermission');
    query.distinctOn(['analysisPermission.id']);

    onlyRealmWritableQueryResources(query, useRequestIdentityRealm(req), [
        'analysisPermission.analysis_realm_id',
    ]);

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'analysisPermission',
        filters: {
            allowed: [
                'permission_id',
                'permission_realm_id',

                'analysis_id',
                'analysis_realm_id',
                'analysis.id',
                'analysis.name',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        sort: {
            allowed: ['created_at', 'updated_at'],
        },
    });

    const relationsMap = getRelations(req);
    if (relationsMap.analysis) {
        applyQueryRelationsParseOutput(query, [
            relationsMap.analysis,
        ], {
            defaultAlias: 'analysisPermission',
        });
    }

    const [entities, total] = await query.getManyAndCount();

    if (isAuthupClientUsable()) {
        const authupClient = useAuthupClient();

        let permissionMap : Record<string, Permission> = {};
        if (relationsMap.permission) {
            const { data: permissions } = await authupClient.permission.getMany({
                filter: {
                    id: entities.map((entity) => entity.permission_id),
                },
            });

            permissionMap = groupById(permissions);
        }

        let policyMap : Record<string, Policy> = {};
        if (relationsMap.policy) {
            const id = entities
                .map((entity) => entity.policy_id)
                .filter(Boolean);
            if (id.length > 0) {
                const { data: policies } = await authupClient.policy.getMany({
                    filter: {
                        id,
                    },
                });

                policyMap = groupById(policies);
            }
        }

        for (let i = 0; i < entities.length; i++) {
            if (
                entities[i].permission_id &&
                typeof permissionMap[entities[i].permission_id] !== 'undefined'
            ) {
                entities[i].permission = permissionMap[entities[i].permission_id];
            }

            if (
                entities[i].policy_id &&
                typeof policyMap[entities[i].policy_id] !== 'undefined'
            ) {
                entities[i].policy = policyMap[entities[i].policy_id];
            }
        }
    }

    return send(res, {
        data: entities,
        meta: {
            total,
            ...pagination,
        },
    });
}
