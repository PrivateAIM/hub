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
import { HTTPHandlerOperation } from '@privateaim/server-http-kit';
import { AnalysisBucketEntity } from '../../../../../database/domains/index.ts';
import { RequestRepositoryAdapter } from '../../../../request/index.ts';
import { AnalysisBucketValidator } from '../utils/index.ts';

export async function createAnalysisBucketRouteHandler(req: Request, res: Response) : Promise<any> {
    const validator = new AnalysisBucketValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const dataSource = await useDataSource();
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: AnalysisBucketEntity,
    });

    data.realm_id = data.analysis.realm_id;

    const repository = dataSource.getRepository(AnalysisBucketEntity);

    let entity = repository.create(data);

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    entity = await requestRepository.save(entity);

    return sendCreated(res, entity);
}
