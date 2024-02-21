/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRealmResourceWritable } from '@authup/core';
import { ForbiddenError } from '@ebec/http';
import type { HTTPValidationResult } from '@privateaim/server-kit/src';
import { createHTTPValidationResult } from '@privateaim/server-kit/src';
import { check } from 'express-validator';
import type { Request } from 'routup';
import type { BucketEntity } from '../../../../domains';
import { useRequestEnv } from '../../../request';

export async function runProjectValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<HTTPValidationResult<BucketEntity>> {
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

    const result = createHTTPValidationResult<BucketEntity>(req);

    // ----------------------------------------------

    if (operation === 'create') {
        const realm = useRequestEnv(req, 'realm');
        if (result.data.realm_id) {
            if (!isRealmResourceWritable(realm, result.data.realm_id)) {
                throw new ForbiddenError('You are not permitted to create this bucket.');
            }
        } else {
            result.data.realm_id = realm.id;
        }
    }

    return result;
}
