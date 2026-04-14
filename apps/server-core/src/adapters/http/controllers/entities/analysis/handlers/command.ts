/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { AnalysisCommand } from '@privateaim/core-kit';
import { isRealmResourceWritable } from '@privateaim/kit';
import { HTTPHandlerOperation, useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useEnv } from '../../../../../../app/modules/config/index.ts';
import { AnalysisEntity } from '../../../../../../adapters/database/index.ts';
import { buildActorContext } from '../../../../request/index.ts';
import {
    createAnalysisBuilder,
    createAnalysisConfigurator,
    createAnalysisDistributor,
    createAnalysisStorageManagerFromDataSource,
} from '../../../../../../app/services/analysis-command/module.ts';
import { AnalysisCommandValidator } from '../utils/index.ts';

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
    const data = await validatorAdapter.run(req, { group: HTTPHandlerOperation.CREATE });

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
        throw new ForbiddenError();
    }
    const ignoreApproval = useEnv('skipAnalysisApproval');
    const actor = buildActorContext(req);
    const persistCtx = { data: actor.metadata };

    const distributor = createAnalysisDistributor();
    const builder = createAnalysisBuilder();
    const configurator = createAnalysisConfigurator();
    const analysisStorageManager = createAnalysisStorageManagerFromDataSource();

    switch (data.command) {
        // Build
        case AnalysisCommand.BUILD_CHECK:
            entity = await builder.check(entity);
            break;
        case AnalysisCommand.BUILD_START:
            entity = await builder.start(entity, persistCtx);
            break;

        // Configuration
        case AnalysisCommand.CONFIGURATION_LOCK:
            entity = await configurator.lock(entity, {
                ignoreApproval,
                persistCtx,
            });
            break;
        case AnalysisCommand.CONFIGURATION_UNLOCK:
            entity = await configurator.unlock(entity, {
                ignoreApproval,
                persistCtx,
            });
            break;

        // Distribution
        case AnalysisCommand.DISTRIBUTION_CHECK:
            entity = await distributor.check(entity);
            break;
        case AnalysisCommand.DISTRIBUTION_START:
            entity = await distributor.start(entity, persistCtx);
            break;

            // Storage
        case AnalysisCommand.STORAGE_CHECK:
            entity = await analysisStorageManager.check(entity);
            break;
    }

    return sendAccepted(res, entity);
}
