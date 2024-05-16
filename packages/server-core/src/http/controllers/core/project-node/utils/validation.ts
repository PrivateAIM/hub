/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check } from 'express-validator';
import { ProjectNodeApprovalStatus } from '@privateaim/core';
import { NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core-kit';
import type { Request } from 'routup';
import type { HTTPValidationResult } from '@privateaim/server-http-kit';
import {
    createHTTPValidationResult,
    extendHTTPValidationResultWithRelation,
} from '@privateaim/server-http-kit';
import type { ProjectNodeEntity } from '../../../../../domains';
import { NodeEntity, ProjectEntity } from '../../../../../domains';
import { useRequestEnv } from '@privateaim/server-http-kit';

export async function runProjectNodeValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<HTTPValidationResult<ProjectNodeEntity>> {
    if (operation === 'create') {
        await check('project_id')
            .exists()
            .isUUID()
            .run(req);

        await check('node_id')
            .exists()
            .isUUID()
            .run(req);
    }

    if (operation === 'update') {
        await check('approval_status')
            .optional()
            .isIn(Object.values(ProjectNodeApprovalStatus))
            .run(req);

        await check('comment')
            .optional({ nullable: true })
            .isString()
            .isLength({ min: 3, max: 4096 })
            .run(req);
    }

    // ----------------------------------------------

    const result = createHTTPValidationResult<ProjectNodeEntity>(req);

    // ----------------------------------------------

    await extendHTTPValidationResultWithRelation(result, ProjectEntity, {
        id: 'project_id',
        entity: 'project',
    });

    if (result.relation.project) {
        result.data.project_realm_id = result.relation.project.realm_id;

        if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), result.relation.project.realm_id)) {
            throw new NotFoundError('The referenced project realm is not permitted.');
        }
    }

    await extendHTTPValidationResultWithRelation(result, NodeEntity, {
        id: 'node_id',
        entity: 'node',
    });
    if (result.relation.node) {
        result.data.node_realm_id = result.relation.node.realm_id;
    }

    return result;
}
