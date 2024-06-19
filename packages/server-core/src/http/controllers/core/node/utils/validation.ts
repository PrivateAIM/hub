/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NodeType } from '@privateaim/core-kit';
import { check } from 'express-validator';
import { isRealmResourceWritable } from '@authup/core-kit';
import { ForbiddenError } from '@ebec/http';
import type { Request } from 'routup';
import type { HTTPValidationResult } from '@privateaim/server-http-kit';
import {
    createHTTPValidationResult,
    extendHTTPValidationResultWithRelation,
    useRequestEnv,
} from '@privateaim/server-http-kit';
import { RegistryEntity } from '../../../../../domains';
import type { NodeEntity } from '../../../../../domains';

export async function runNodeValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<HTTPValidationResult<NodeEntity>> {
    const nameChain = check('name')
        .isLength({ min: 3, max: 128 })
        .exists()
        .notEmpty();

    if (operation === 'update') {
        nameChain.optional();
    }

    await nameChain.run(req);

    // -------------------------------------------------------------

    await check('type')
        .isIn(Object.values(NodeType))
        .optional()
        .run(req);

    // -------------------------------------------------------------

    await check('hidden')
        .isBoolean()
        .optional()
        .run(req);

    // -------------------------------------------------------------

    await check('external_name')
        .isLength({ min: 1, max: 64 })
        .exists()
        .matches(/^[a-z0-9-_]*$/)
        .optional({ nullable: true })
        .run(req);

    // -------------------------------------------------------------

    await check('registry_id')
        .exists()
        .isUUID()
        .optional({ nullable: true })
        .run(req);

    // -------------------------------------------------------------

    await check('robot_id')
        .exists()
        .isUUID()
        .optional({ nullable: true })
        .run(req);

    // -------------------------------------------------------------

    if (operation === 'create') {
        await check('realm_id')
            .exists()
            .isUUID()
            .optional({ nullable: true })
            .run(req);
    }

    // ----------------------------------------------

    const result = createHTTPValidationResult<NodeEntity>(req);

    // ----------------------------------------------

    await extendHTTPValidationResultWithRelation(result, RegistryEntity, {
        id: 'registry_id',
        entity: 'registry',
    });

    // ----------------------------------------------

    if (operation === 'create') {
        const realm = useRequestEnv(req, 'realm');
        if (result.data.realm_id) {
            if (!isRealmResourceWritable(realm, result.data.realm_id)) {
                throw new ForbiddenError('You are not permitted to create this node.');
            }
        } else {
            result.data.realm_id = realm.id;
        }
    }

    return result;
}
