/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AnalysisFileType } from '@privateaim/core';
import { check } from 'express-validator';
import type { Request } from 'routup';
import type { HTTPValidationResult } from '@privateaim/server-http-kit';
import {
    createHTTPValidationResult,
    extendHTTPValidationResultWithRelation,
} from '@privateaim/server-http-kit';
import { AnalysisEntity } from '../../../../../domains';
import type { AnalysisFileEntity } from '../../../../../domains';
import { useRequestEnv } from '../../../../request';

export async function runAnalysisFileValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<HTTPValidationResult<AnalysisFileEntity>> {
    if (operation === 'create') {
        await check('analysis_id')
            .exists()
            .isUUID()
            .run(req);
    }

    // ----------------------------------------------

    const nameChain = check('name')
        .exists()
        .isString();

    if (operation === 'update') {
        nameChain.optional();
    }

    await nameChain.run(req);

    // ----------------------------------------------

    if (operation === 'create') {
        await check('bucket_file_id')
            .exists()
            .isUUID()
            .run(req);

        await check('target_realm_id')
            .exists()
            .isUUID()
            .optional({ nullable: true })
            .run(req);

        await check('type')
            .exists()
            .isIn(Object.values(AnalysisFileType))
            .run(req);
    }

    await check('root')
        .optional()
        .toBoolean()
        .isBoolean()
        .default(false)
        .run(req);

    const result = createHTTPValidationResult<AnalysisFileEntity>(req);

    // ----------------------------------------------

    await extendHTTPValidationResultWithRelation(result, AnalysisEntity, {
        id: 'analysis_id',
        entity: 'analysis',
    });

    // ----------------------------------------------

    if (operation === 'create') {
        result.data.realm_id = useRequestEnv(req, 'realmId');
        if (!result.data.target_realm_id) {
            result.data.target_realm_id = result.data.realm_id;
        }

        const userId = useRequestEnv(req, 'userId');
        if (userId) {
            result.data.user_id = userId;
        }

        const robotId = useRequestEnv(req, 'robotId');
        if (robotId) {
            result.data.robot_id = robotId;
        }
    }

    // ----------------------------------------------

    return result;
}
