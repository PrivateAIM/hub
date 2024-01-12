/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { ProjectNodeApprovalStatus } from '@personalhealthtrain/core';
import { NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core';
import type { Request } from 'routup';
import type { ProjectNodeEntity } from '../../../../../domains/project-node/entity';
import { ProjectEntity } from '../../../../../domains/project/entity';
import { NodeEntity } from '../../../../../domains/node';
import { useRequestEnv } from '../../../../request';
import type { RequestValidationResult } from '../../../../validation';
import {
    RequestValidationError, extendRequestValidationResultWithRelation,
    initRequestValidationResult,
    matchedValidationData,
} from '../../../../validation';

export async function runProposalStationValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<RequestValidationResult<ProjectNodeEntity>> {
    const result : RequestValidationResult<ProjectNodeEntity> = initRequestValidationResult();

    if (operation === 'create') {
        await check('proposal_id')
            .exists()
            .isUUID()
            .run(req);

        await check('station_id')
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

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new RequestValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });

    // ----------------------------------------------

    await extendRequestValidationResultWithRelation(result, ProjectEntity, {
        id: 'project_id',
        entity: 'project',
    });

    if (result.relation.project) {
        result.data.project_realm_id = result.relation.project.realm_id;

        if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), result.relation.project.realm_id)) {
            throw new NotFoundError('The referenced proposal realm is not permitted.');
        }
    }

    await extendRequestValidationResultWithRelation(result, NodeEntity, {
        id: 'node_id',
        entity: 'node',
    });
    if (result.relation.node) {
        result.data.node_realm_id = result.relation.node.realm_id;
    }

    return result;
}
