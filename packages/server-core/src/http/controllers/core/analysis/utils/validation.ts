/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check } from 'express-validator';
import { BadRequestError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core-kit';
import type { Request } from 'routup';
import type { HTTPValidationResult } from '@privateaim/server-kit';
import {
    createHTTPValidationResult,
    extendHTTPValidationResultWithRelation,
} from '@privateaim/server-kit';
import {
    MasterImageEntity, ProjectEntity, RegistryEntity,
} from '../../../../../domains';
import type { AnalysisEntity } from '../../../../../domains';
import { useRequestEnv } from '../../../../request';

export async function runAnalysisValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<HTTPValidationResult<AnalysisEntity>> {
    if (operation === 'create') {
        await check('project_id')
            .exists()
            .notEmpty()
            .isUUID()
            .run(req);
    }

    await check('name')
        .notEmpty()
        .isLength({ min: 1, max: 128 })
        .optional({ nullable: true })
        .run(req);

    await check('master_image_id')
        .exists()
        .notEmpty()
        .isUUID()
        .optional({ nullable: true })
        .run(req);

    await check('registry_id')
        .exists()
        .notEmpty()
        .isUUID()
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    const result = createHTTPValidationResult<AnalysisEntity>(req);

    // ----------------------------------------------

    await extendHTTPValidationResultWithRelation(result, MasterImageEntity, {
        id: 'master_image_id',
        entity: 'master_image',
    });

    await extendHTTPValidationResultWithRelation(result, ProjectEntity, {
        id: 'project_id',
        entity: 'project',
    });
    await extendHTTPValidationResultWithRelation(result, RegistryEntity, {
        id: 'registry_id',
        entity: 'registry',
    });

    if (result.relation.project) {
        if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), result.relation.project.realm_id)) {
            throw new BadRequestError('The referenced project realm is not permitted.');
        }

        result.data.realm_id = result.relation.project.realm_id;
    }

    return result;
}
