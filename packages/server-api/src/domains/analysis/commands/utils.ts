/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { Repository } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { AnalysisEntity } from '../entity';

export async function resolveTrain(
    train: AnalysisEntity | string,
    repository?: Repository<AnalysisEntity>,
) : Promise<AnalysisEntity | undefined> {
    if (typeof train !== 'string') {
        return train;
    }

    if (typeof repository === 'undefined') {
        const dataSource = await useDataSource();
        repository = dataSource.getRepository(AnalysisEntity);
    }

    const entity = await repository.findOneBy({ id: train });
    if (!entity) {
        throw new BadRequestError('The train could not be resolved.');
    }

    return entity;
}
