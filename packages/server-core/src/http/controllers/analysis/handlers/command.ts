/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRealmResourceWritable } from '@privateaim/kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { AnalysisAPICommand } from '@privateaim/core-kit';
import { HTTPHandlerOperation, useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import {
    AnalysisEntity,
    detectAnalysisBuildStatus,
    lockAnalysisConfiguration, runAnalysisSpinUpCommand,
    startAnalysisBuild,
    stopAnalysisBuild,
    unlockAnalysisConfiguration,
} from '../../../../database/domains';
import { runAnalysisTearDownCommand } from '../../../../database/domains/analysis/commands/tear-down';
import { AnalysisCommandValidator } from '../utils';

/**
 * Execute a analysis command (start, stop, build).
 *
 * @param req
 * @param res
 */
export async function handleAnalysisCommandRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    if (typeof id !== 'string' || id.length === 0) {
        throw new NotFoundError();
    }

    const validator = new AnalysisCommandValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
        throw new ForbiddenError();
    }

    switch (data.command) {
        // General
        case AnalysisAPICommand.SPIN_UP: {
            entity = await runAnalysisSpinUpCommand(entity);
            break;
        }
        case AnalysisAPICommand.TEAR_DOWN: {
            entity = await runAnalysisTearDownCommand(entity);
            break;
        }

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

        // Configuration
        case AnalysisAPICommand.CONFIGURATION_LOCK:
            entity = await lockAnalysisConfiguration(entity);
            break;
        case AnalysisAPICommand.CONFIGURATION_UNLOCK:
            entity = await unlockAnalysisConfiguration(entity);
            break;
    }

    return sendAccepted(res, entity);
}
