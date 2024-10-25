/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorWithStatusCode } from '@hapic/harbor';
import { isAuthupClientUsable, useAuthupClient } from '@privateaim/server-kit';
import { check } from 'express-validator';
import { BadRequestError } from '@ebec/http';
import type { Permission } from '@authup/core-kit';
import { isRealmResourceWritable } from '@authup/core-kit';
import type { Request } from 'routup';
import type { HTTPValidationResult } from '@privateaim/server-http-kit';
import {
    buildHTTPValidationErrorMessage,
    createHTTPValidationResult,
    extendHTTPValidationResultWithRelation,
    useRequestIdentityRealm,
} from '@privateaim/server-http-kit';
import { AnalysisEntity } from '../../../../domains';
import type { AnalysisPermissionEntity } from '../../../../domains';

export async function runAnalysisPermissionValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<HTTPValidationResult<AnalysisPermissionEntity>> {
    if (operation === 'create') {
        await check('analysis_id')
            .exists()
            .isUUID()
            .run(req);

        await check('permission_id')
            .exists()
            .isUUID()
            .run(req);
    }

    await check('policy_id')
        .isUUID()
        .optional({ values: 'null' })
        .run(req);

    const result = createHTTPValidationResult<AnalysisPermissionEntity>(req);

    // ----------------------------------------------

    await extendHTTPValidationResultWithRelation(result, AnalysisEntity, {
        id: 'analysis_id',
        entity: 'analysis',
    });

    if (result.relation.analysis) {
        if (!isRealmResourceWritable(useRequestIdentityRealm(req), result.relation.analysis.realm_id)) {
            throw new BadRequestError(buildHTTPValidationErrorMessage('analysis_id'));
        }

        result.data.analysis_realm_id = result.relation.analysis.realm_id;
    }

    // ----------------------------------------------

    if (isAuthupClientUsable()) {
        const authup = useAuthupClient();

        if (result.data.permission_id) {
            let permission: Permission;
            try {
                permission = await authup.permission.getOne(result.data.permission_id);

                result.data.permission = permission;
                result.data.permission_realm_id = permission.realm_id;

                // todo: remove this when validation is reworked.
                result.relation.permission = permission;
            } catch (e) {
                if (isClientErrorWithStatusCode(e, 404)) {
                    throw new BadRequestError(buildHTTPValidationErrorMessage('permission_id'));
                }

                throw e;
            }
        }

        // todo: this is not possible right now :/
        /*
        const data = buildAbilityFromPermission(permission);
        const ability = useRequestEnv(req, 'abilities');
        if (!ability.has(data)) {
            throw new ForbiddenError(`You don't own the permission ${data.name}`);
        }
         */

        if (result.data.policy_id) {
            try {
                const policy = await authup.policy.getOne(result.data.policy_id);

                result.data.policy = policy;
                result.data.policy_id = policy.id;

                // todo: remove this when validation is reworked.
                result.relation.policy = policy;
            } catch (e) {
                if (isClientErrorWithStatusCode(e, 404)) {
                    throw new BadRequestError(buildHTTPValidationErrorMessage('permission_id'));
                }

                throw e;
            }
        }
    }

    // ----------------------------------------------

    return result;
}
