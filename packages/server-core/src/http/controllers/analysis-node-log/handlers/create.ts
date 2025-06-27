/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRealmResourceWritable } from '@privateaim/kit';
import { ForbiddenError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { HTTPHandlerOperation, useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { isLokiClientUsable, useLokiClient } from '@privateaim/server-kit';
import {
    AnalysisNodeLogEntity,
} from '../../../../domains';
import { AnalysisNodeLogValidator } from '../utils';
import { transformAnalysisNodeLogToLokiStream } from '../../../../domains/analysis-node-log/loki';

export async function createAnalysisNodeLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const validator = new AnalysisNodeLogValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const dataSource = await useDataSource();
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: AnalysisNodeLogEntity,
    });

    data.analysis_realm_id = data.analysis.realm_id;
    data.node_realm_id = data.node.realm_id;

    const isAuthorityOfNode = isRealmResourceWritable(useRequestIdentityRealm(req), data.node_realm_id);
    if (!isAuthorityOfNode) {
        throw new ForbiddenError('You are not an actor of to the node realm.');
    }

    if (isLokiClientUsable()) {
        const client = useLokiClient();

        await client.distributor.push(transformAnalysisNodeLogToLokiStream(data));
    } else {
        const repository = dataSource.getRepository(AnalysisNodeLogEntity);
        const entity = repository.create(data);
        return repository.save(entity);
    }

    return sendAccepted(res);
}
