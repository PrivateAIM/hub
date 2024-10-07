/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check } from 'express-validator';
import type { Request } from 'routup';
import type { HTTPValidationResult } from '@privateaim/server-http-kit';
import {
    createHTTPValidationResult,
    extendHTTPValidationResultWithRelation,
} from '@privateaim/server-http-kit';
import { AnalysisBucketEntity } from '../../../../../domains';
import type { AnalysisBucketFileEntity } from '../../../../../domains';

export async function runAnalysisFileValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<HTTPValidationResult<AnalysisBucketFileEntity>> {
    if (operation === 'create') {
        await check('bucket_id')
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
        await check('external_id')
            .exists()
            .isUUID()
            .run(req);
    }

    await check('root')
        .optional()
        .toBoolean()
        .isBoolean()
        .default(false)
        .run(req);

    const result = createHTTPValidationResult<AnalysisBucketFileEntity>(req);

    // ----------------------------------------------

    await extendHTTPValidationResultWithRelation(result, AnalysisBucketEntity, {
        id: 'bucket_id',
        entity: 'bucket',
    });

    return result;
}
