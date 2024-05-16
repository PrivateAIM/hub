/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check } from 'express-validator';
import { RegistryProjectType } from '@privateaim/core';
import type { Request } from 'routup';
import type { HTTPValidationResult } from '@privateaim/server-http-kit';
import {
    createHTTPValidationResult,
    extendHTTPValidationResultWithRelation,
} from '@privateaim/server-http-kit';
import type { RegistryProjectEntity } from '../../../../../domains';
import { RegistryEntity } from '../../../../../domains';

export async function runRegistryProjectValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<HTTPValidationResult<RegistryProjectEntity>> {
    const registryChain = check('registry_id')
        .exists()
        .isUUID();

    if (operation === 'update') {
        registryChain.optional();
    }

    await registryChain.run(req);

    // ----------------------------------------------

    const titleChain = check('name')
        .exists()
        .isLength({ min: 5, max: 128 });

    if (operation === 'update') {
        titleChain.optional();
    }

    await titleChain.run(req);

    // -------------------------------------------------------------

    const externalNameChain = check('external_name')
        .isLength({ min: 1, max: 255 })
        .exists()
        .matches(/^[a-z0-9-_]*$/);

    if (operation === 'update') {
        externalNameChain.optional();
    }

    await externalNameChain.run(req);

    // -------------------------------------------------------------

    if (operation === 'create') {
        await check('type')
            .exists()
            .isIn(Object.values(RegistryProjectType))
            .run(req);
    }

    // ----------------------------------------------

    const result = createHTTPValidationResult<RegistryProjectEntity>(req);
    await extendHTTPValidationResultWithRelation(result, RegistryEntity, {
        id: 'registry_id',
        entity: 'registry',
    });

    return result;
}
