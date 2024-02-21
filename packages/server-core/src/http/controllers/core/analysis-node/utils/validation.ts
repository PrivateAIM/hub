/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check } from 'express-validator';
import { AnalysisNodeApprovalStatus } from '@privateaim/core';
import { BadRequestError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core';
import type { Request } from 'routup';
import { useDataSource } from 'typeorm-extension';
import type { HTTPValidationResult } from '@privateaim/server-kit';
import {
    buildHTTPValidationErrorMessage,
    createHTTPValidationResult,
    extendHTTPValidationResultWithRelation,
} from '@privateaim/server-kit';
import { AnalysisEntity, NodeEntity, ProjectNodeEntity } from '../../../../../domains';
import type { AnalysisNodeEntity } from '../../../../../domains';
import { useRequestEnv } from '../../../../request';

export async function runAnalysisNodeValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<HTTPValidationResult<AnalysisNodeEntity>> {
    if (operation === 'create') {
        await check('node_id')
            .exists()
            .isUUID()
            .run(req);

        await check('analysis_id')
            .exists()
            .isUUID()
            .run(req);
    }

    await check('index')
        .exists()
        .isInt()
        .optional()
        .run(req);

    if (operation === 'update') {
        await check('approval_status')
            .optional({ nullable: true })
            .isIn(Object.values(AnalysisNodeApprovalStatus))
            .run(req);

        await check('comment')
            .optional({ nullable: true })
            .isString()
            .run(req);
    }

    const result = createHTTPValidationResult<AnalysisNodeEntity>(req);

    // ----------------------------------------------

    await extendHTTPValidationResultWithRelation(result, AnalysisEntity, {
        id: 'analysis_id',
        entity: 'analysis',
    });
    if (result.relation.analysis) {
        if (
            !isRealmResourceWritable(useRequestEnv(req, 'realm'), result.relation.analysis.realm_id)
        ) {
            throw new BadRequestError(buildHTTPValidationErrorMessage('analysis_id'));
        }

        result.data.analysis_realm_id = result.relation.analysis.realm_id;
    }

    await extendHTTPValidationResultWithRelation(result, NodeEntity, {
        id: 'node_id',
        entity: 'node',
    });

    if (result.relation.node) {
        result.data.node_realm_id = result.relation.node.realm_id;
    }

    if (
        result.relation.node &&
        result.relation.analysis
    ) {
        const dataSource = await useDataSource();
        const proposalStationRepository = dataSource.getRepository(ProjectNodeEntity);
        const proposalStation = await proposalStationRepository.findOneBy({
            project_id: result.relation.analysis.project_id,
            node_id: result.relation.node.id,
        });

        if (!proposalStation) {
            throw new NotFoundError('The referenced node is not part of the analysis project.');
        }
    }

    // ----------------------------------------------

    return result;
}
