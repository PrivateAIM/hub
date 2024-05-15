/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    createHTTPValidationResult,
} from '@privateaim/server-http-kit';
import { body, check } from 'express-validator';
import { getHostNameFromString } from '@privateaim/core';
import type { Request } from 'routup';
import type { HTTPValidationResult } from '@privateaim/server-http-kit';
import type { RegistryEntity } from '../../../../../domains';

export async function runRegistryValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<HTTPValidationResult<RegistryEntity>> {
    const titleChain = check('name')
        .exists()
        .isLength({ min: 3, max: 128 });

    if (operation === 'update') {
        titleChain.optional();
    }

    await titleChain.run(req);

    // ----------------------------------------------

    const hostChain = body('host')
        .exists()
        .isString()
        .isLength({ min: 3, max: 512 });

    if (operation === 'update') {
        hostChain.optional();
    }

    await hostChain.run(req);

    // ----------------------------------------------

    await check('account_name')
        .exists()
        .isLength({ min: 3, max: 256 })
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    await check('account_secret')
        .exists()
        .isLength({ min: 3, max: 256 })
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    const result = createHTTPValidationResult<RegistryEntity>(req);
    if (result.data.host) {
        result.data.host = getHostNameFromString(result.data.host);
    }

    return result;
}
