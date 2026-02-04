/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send, useRequestParam } from 'routup';
import type { SelectQueryBuilder } from 'typeorm';
import {
    parseQueryFields,
} from 'rapiq';
import {
    applyFilters, applyPagination, applyQueryFieldsParseOutput, applyRelations, applySort, useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { NodeEntity } from '../../../../../database/domains/index.ts';

async function checkAndApplyFields(req: Request, query: SelectQueryBuilder<any>, fields: any) {
    const fieldsParsed = parseQueryFields<NodeEntity>(fields, {
        default: [
            'id',
            'name',
            'client_id',
            'external_name',
            'hidden',
            'type',
            'online',
            'public_key',
            'robot_id',
            'realm_id',
            'registry_id',
            'registry_project_id',
            'created_at',
            'updated_at',
        ],
        defaultPath: 'node',
    });

    applyQueryFieldsParseOutput(query, fieldsParsed, { defaultAlias: 'node' });
}

export async function getOneNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');
    const { fields, include } = useRequestQuery(req);

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(NodeEntity);
    const query = repository.createQueryBuilder('node')
        .where('node.id = :id', { id });

    await checkAndApplyFields(req, query, fields);

    applyRelations(query, include, {
        defaultAlias: 'node',
        allowed: ['registry_project', 'registry'],
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function getManyNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const {
        filter, page, fields, include, sort,
    } = useRequestQuery(req);

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(NodeEntity);
    const query = repository.createQueryBuilder('node');

    await checkAndApplyFields(req, query, fields);

    applyRelations(query, include, {
        defaultAlias: 'node',
        allowed: ['registry_project', 'registry'],
    });

    applySort(query, sort, {
        defaultAlias: 'node',
        allowed: ['name', 'updated_at', 'created_at'],
    });

    applyFilters(query, filter, {
        allowed: ['id', 'name', 'online', 'hidden', 'realm_id', 'robot_id'],
        defaultAlias: 'node',
    });

    const pagination = applyPagination(query, page, { maxLimit: 50 });

    const [entities, total] = await query.getManyAndCount();

    return send(res, {
        data: entities,
        meta: {
            total,
            ...pagination,
        },
    });
}
