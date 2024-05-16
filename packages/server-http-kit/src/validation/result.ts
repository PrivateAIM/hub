/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { deleteUndefinedObjectProperties } from '@privateaim/core';
import type { MatchedDataOptions } from 'express-validator';
import { matchedData, validationResult } from 'express-validator';
import type { Request } from 'routup';
import type { EntityTarget } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { buildHTTPValidationErrorMessage } from './message';
import { HTTPValidationError } from './module';
import type { HTTPValidationExtendKeys, HTTPValidationResult } from './type';

export function createHTTPValidationResult<
    R extends Record<string, any>,
    M extends Record<string, any> = Record<string, any>,
>(req: Request, options: Partial<MatchedDataOptions> = {}) : HTTPValidationResult<R, M> {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new HTTPValidationError(validation);
    }

    return {
        data: deleteUndefinedObjectProperties(matchedData(req, {
            includeOptionals: true,
            ...options,
        })) as R,
        meta: {} as M,
        relation: {},
    };
}

export async function extendHTTPValidationResultWithRelation<
    R extends Record<string, any>,
    >(
    result: HTTPValidationResult<R>,
    target: EntityTarget<any>,
    keys: HTTPValidationExtendKeys<R>,
) : Promise<HTTPValidationResult<R>> {
    if (result.data[keys.id]) {
        const dataSource = await useDataSource();

        const repository = dataSource.getRepository(target);
        const entity = await repository.findOneBy({ id: result.data[keys.id] });
        if (!entity) {
            throw new BadRequestError(buildHTTPValidationErrorMessage(keys.id));
        }

        result.relation[keys.entity as keyof HTTPValidationResult<R>['relation']] = entity;
    }

    return result;
}
