/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { BadRequestError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core';
import type { Request } from 'routup';
import { MasterImageEntity } from '../../../../../domains';
import { ProjectEntity } from '../../../../../domains';
import { RegistryEntity } from '../../../../../domains';
import type { AnalysisEntity } from '../../../../../domains';
import type { RequestValidationResult } from '../../../../validation';
import {
    RequestValidationError, extendRequestValidationResultWithRelation,
    initRequestValidationResult,
    matchedValidationData,
} from '../../../../validation';
import { AnalysisFileEntity } from '../../../../../domains';
import { useRequestEnv } from '../../../../request';

export async function runAnalysisValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<RequestValidationResult<AnalysisEntity>> {
    const result : RequestValidationResult<AnalysisEntity> = initRequestValidationResult();

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

    await check('entrypoint_file_id')
        .isUUID()
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
    await extendRequestValidationResultWithRelation(result, ProjectEntity, {
        id: 'project_id',
        entity: 'project',
    });
    await extendRequestValidationResultWithRelation(result, RegistryEntity, {
        id: 'registry_id',
        entity: 'registry',
    });

    await extendRequestValidationResultWithRelation(result, AnalysisFileEntity, {
        id: 'entrypoint_file_id',
        entity: 'entrypoint_file',
    });

    if (result.relation.project) {
        if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), result.relation.project.realm_id)) {
            throw new BadRequestError('The referenced project realm is not permitted.');
        }

        result.data.realm_id = result.relation.project.realm_id;
    }

    return result;
}
