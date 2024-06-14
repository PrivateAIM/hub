/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRealmResourceWritable } from '@authup/core-kit';
import { ForbiddenError } from '@ebec/http';
import type { HTTPValidationResult } from '@privateaim/server-http-kit';
import { createHTTPValidationResult, useRequestEnv } from '@privateaim/server-http-kit';
import { check } from 'express-validator';
import type { Request } from 'routup';
import type { BucketEntity } from '../../../../domains';

export async function runBucketValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<HTTPValidationResult<BucketEntity>> {
    if (operation === 'create') {
        const nameChain = check('name')
            .exists()
            .isLength({ min: 3, max: 256 });

        await nameChain.run(req);

        const regionChain = check('region')
            .exists()
            .isLength({ min: 3, max: 256 })
            .optional();

        await regionChain.run(req);
    }

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
