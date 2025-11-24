/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { AnalysisAPICommand } from '@privateaim/core-kit';
import { isRealmResourceWritable } from '@privateaim/kit';
import { HTTPHandlerOperation, useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useEnv } from '../../../../config';
import { AnalysisEntity } from '../../../../database';
import { AnalysisBuilder, AnalysisConfigurator, AnalysisDistributor } from '../../../../services';
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
    const ignoreApproval = useEnv('skipAnalysisApproval');

    const distributor = new AnalysisDistributor();
    const builder = new AnalysisBuilder();
    const configurator = new AnalysisConfigurator();

    switch (data.command) {
        // Build
        case AnalysisAPICommand.BUILD_STATUS:
            entity = await builder.check(entity);
            break;
        case AnalysisAPICommand.BUILD_START:
            entity = await builder.start(entity, req);
            break;

        // Distribution
        case AnalysisAPICommand.DISTRIBUTION_CHECK:
            entity = await distributor.check(entity);
            break;
        case AnalysisAPICommand.DISTRIBUTION_START:
            entity = await distributor.start(entity, req);
            break;

        // Configuration
        case AnalysisAPICommand.CONFIGURATION_LOCK:
            entity = await configurator.lock(entity, {
                ignoreApproval,
                request: req,
            });
            break;
        case AnalysisAPICommand.CONFIGURATION_UNLOCK:
            entity = await configurator.unlock(entity, {
                ignoreApproval,
                request: req,
            });
            break;
    }

    return sendAccepted(res, entity);
}
