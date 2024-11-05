/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { AnalysisBucketEntity } from '../../../../domains';
import { AnalysisBucketValidator } from '../utils';
import { HTTPHandlerOperation } from '../../constants';

export async function createAnalysisBucketRouteHandler(req: Request, res: Response) : Promise<any> {
    const validator = new AnalysisBucketValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    data.realm_id = data.analysis.realm_id;

    const dataSource = await useDataSource();
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: AnalysisBucketEntity,
    });
    const repository = dataSource.getRepository(AnalysisBucketEntity);

    let entity = repository.create(data);

    entity = await repository.save(entity);

    return sendCreated(res, entity);
}
