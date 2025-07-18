/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRealmResourceWritable } from '@privateaim/kit';
import { ForbiddenError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { HTTPHandlerOperation, useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import {
    AnalysisNodeLogEntity,
} from '../../../../database';
import { AnalysisNodeLogValidator } from '../utils';
import { useAnalysisNodeLogStore } from '../../../../services';

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

    const store = useAnalysisNodeLogStore();
    const entity = await store.write(data);

    return sendCreated(res, entity);
}
