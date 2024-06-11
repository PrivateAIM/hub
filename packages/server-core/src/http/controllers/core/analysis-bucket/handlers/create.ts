/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { AnalysisBucketEntity } from '../../../../../domains';
import { runAnalysisBucketValidation } from '../utils';

export async function createAnalysisBucketRouteHandler(req: Request, res: Response) : Promise<any> {
    const result = await runAnalysisBucketValidation(req, 'create');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisBucketEntity);

    let entity = repository.create(result.data);

    entity = await repository.save(entity);

    return sendCreated(res, entity);
}
