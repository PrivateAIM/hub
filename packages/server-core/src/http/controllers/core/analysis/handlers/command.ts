/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRealmResourceWritable } from '@authup/core';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { AnalysisAPICommand } from '@privateaim/core';
import { HTTPValidationError } from '@privateaim/server-kit';
import { check, matchedData, validationResult } from 'express-validator';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import {
    AnalysisEntity,
    detectAnalysisBuildStatus, lockAnalysisConfiguration,
    startAnalysisBuild,
    stopAnalysisBuild,
} from '../../../../../domains';
import { useRequestEnv } from '../../../../request';

/**
 * Execute a analysis command (start, stop, build).
 *
 * @param req
 * @param res
 */
export async function handleAnalysisCommandRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    if (typeof id !== 'string') {
        throw new NotFoundError();
    }

    await check('command')
        .exists()
        .custom((command) => Object.values(AnalysisAPICommand).includes(command))
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new HTTPValidationError(validation);
    }

    const validationData = matchedData(req, { includeOptionals: true });

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    switch (validationData.command as AnalysisAPICommand) {
        // Build Commands
        case AnalysisAPICommand.BUILD_STATUS:
            entity = await detectAnalysisBuildStatus(entity);
            break;
        case AnalysisAPICommand.BUILD_START:
            entity = await startAnalysisBuild(entity);
            break;
        case AnalysisAPICommand.BUILD_STOP:
            entity = await stopAnalysisBuild(entity);
            break;
        case AnalysisAPICommand.CONFIGURATION_LOCK:
            entity = await lockAnalysisConfiguration(entity);
            break;
    }

    return sendAccepted(res, entity);
}
