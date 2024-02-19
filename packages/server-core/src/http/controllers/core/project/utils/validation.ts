/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRealmResourceWritable } from '@authup/core';
import { ForbiddenError } from '@ebec/http';
import { check, validationResult } from 'express-validator';
import type { Request } from 'routup';
import { MasterImageEntity } from '../../../../../domains';
import type { ProjectEntity } from '../../../../../domains';
import type { RequestValidationResult } from '../../../../validation';
import {
    RequestValidationError, extendRequestValidationResultWithRelation,
    initRequestValidationResult,
    matchedValidationData,
} from '../../../../validation';
import { useRequestEnv } from '../../../../request';

export async function runProjectValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<RequestValidationResult<ProjectEntity>> {
    const result : RequestValidationResult<ProjectEntity> = initRequestValidationResult();

    const titleChain = check('name')
        .exists()
        .isLength({ min: 5, max: 100 });

    if (operation === 'update') {
        titleChain.optional();
    }

    await titleChain.run(req);

    // ----------------------------------------------

    await check('master_image_id')
        .isUUID()
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new RequestValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });

    // ----------------------------------------------

    await extendRequestValidationResultWithRelation(result, MasterImageEntity, {
        id: 'master_image_id',
        entity: 'master_image',
    });

    // ----------------------------------------------

    if (operation === 'create') {
        const realm = useRequestEnv(req, 'realm');
        if (result.data.realm_id) {
            if (!isRealmResourceWritable(realm, result.data.realm_id)) {
                throw new ForbiddenError('You are not permitted to create this project.');
            }
        } else {
            result.data.realm_id = realm.id;
        }
    }

    return result;
}
