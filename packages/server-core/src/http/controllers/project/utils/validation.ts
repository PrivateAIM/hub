/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRealmResourceWritable } from '@authup/core-kit';
import { ForbiddenError } from '@ebec/http';
import { check } from 'express-validator';
import type { Request } from 'routup';
import type { HTTPValidationResult } from '@privateaim/server-http-kit';
import {
    createHTTPValidationResult,
    extendHTTPValidationResultWithRelation,
    useRequestIdentityRealm,
} from '@privateaim/server-http-kit';
import { MasterImageEntity } from '../../../../domains';
import type { ProjectEntity } from '../../../../domains';

export async function runProjectValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<HTTPValidationResult<ProjectEntity>> {
    const titleChain = check('name')
        .exists()
        .isLength({ min: 5, max: 100 });

    if (operation === 'update') {
        titleChain.optional();
    }

    await titleChain.run(req);

    // ----------------------------------------------

    await check('description')
        .isString()
        .isLength({ min: 5, max: 4096 })
        .optional({ values: 'null' })
        .run(req);

    // ----------------------------------------------

    await check('master_image_id')
        .isUUID()
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    const result = createHTTPValidationResult<ProjectEntity>(req);

    // ----------------------------------------------

    await extendHTTPValidationResultWithRelation(result, MasterImageEntity, {
        id: 'master_image_id',
        entity: 'master_image',
    });

    // ----------------------------------------------

    if (operation === 'create') {
        const realm = useRequestIdentityRealm(req);
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
