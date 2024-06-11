/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AnalysisBucketType } from '@privateaim/core';
import { check } from 'express-validator';
import type { Request } from 'routup';
import type { HTTPValidationResult } from '@privateaim/server-http-kit';
import {
    createHTTPValidationResult,
    extendHTTPValidationResultWithRelation,
} from '@privateaim/server-http-kit';
import type { AnalysisBucketEntity } from '../../../../../domains';
import { AnalysisEntity } from '../../../../../domains';

export async function runAnalysisBucketValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<HTTPValidationResult<AnalysisBucketEntity>> {
    if (operation === 'create') {
        await check('analysis_id')
            .exists()
            .isUUID()
            .run(req);
    }

    await check('type')
        .exists()
        .notEmpty()
        .isIn(Object.values(AnalysisBucketType))
        .run(req);

    const result = createHTTPValidationResult<AnalysisBucketEntity>(req);

    // ----------------------------------------------

    await extendHTTPValidationResultWithRelation(result, AnalysisEntity, {
        id: 'analysis_id',
        entity: 'analysis',
    });

    // ----------------------------------------------

    if (operation === 'create') {
        result.data.realm_id = result.relation.analysis.realm_id;
        result.data.analysis_id = result.relation.analysis.id;
    }

    // ----------------------------------------------

    return result;
}
