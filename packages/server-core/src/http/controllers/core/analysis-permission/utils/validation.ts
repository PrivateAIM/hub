/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isAuthupClientUsable, useAuthupClient } from '@privateaim/server-kit';
import { check } from 'express-validator';
import { BadRequestError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core-kit';
import type { Request } from 'routup';
import type { HTTPValidationResult } from '@privateaim/server-http-kit';
import {
    buildHTTPValidationErrorMessage,
    createHTTPValidationResult,
    extendHTTPValidationResultWithRelation,
    useRequestEnv,
} from '@privateaim/server-http-kit';
import { AnalysisEntity } from '../../../../../domains';
import type { AnalysisPermissionEntity } from '../../../../../domains';

export async function runAnalysisPermissionValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<HTTPValidationResult<AnalysisPermissionEntity>> {
    if (operation === 'create') {
        await check('node_id')
            .exists()
            .isUUID()
            .run(req);

        await check('permission_id')
            .exists()
            .isUUID()
            .run(req);

        await check('policy_id')
            .isUUID()
            .optional({ values: 'null' })
            .run(req);
    }

    const result = createHTTPValidationResult<AnalysisPermissionEntity>(req);

    // ----------------------------------------------

    await extendHTTPValidationResultWithRelation(result, AnalysisEntity, {
        id: 'analysis_id',
        entity: 'analysis',
    });

    if (result.relation.analysis) {
        if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), result.relation.analysis.realm_id)) {
            throw new BadRequestError(buildHTTPValidationErrorMessage('analysis_id'));
        }

        result.data.analysis_realm_id = result.relation.analysis.realm_id;
    }

    // ----------------------------------------------

    if (isAuthupClientUsable()) {
        const authup = useAuthupClient();

        const permission = await authup.permission.getOne(result.data.permission_id);

        // todo: is requester permitted to assign permission ?!

        result.data.permission_realm_id = permission.realm_id;

        // todo: wait for authup implementation
        // const policy = await authup.policy.getOne(result.data.policy_id);
        // result.data.policy_id = policy.id;
    }

    // ----------------------------------------------

    return result;
}
