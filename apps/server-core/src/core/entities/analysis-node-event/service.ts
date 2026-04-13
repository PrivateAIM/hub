/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeEvent } from '@privateaim/core-kit';
import { NotFoundError } from '@ebec/http';
import type { EntityRepositoryFindManyResult } from '../types.ts';
import { AbstractEntityService } from '../service.ts';
import type { IAnalysisNodeEventRepository, IAnalysisNodeEventService } from './types.ts';

type AnalysisNodeEventServiceContext = {
    repository: IAnalysisNodeEventRepository;
};

export class AnalysisNodeEventService extends AbstractEntityService implements IAnalysisNodeEventService {
    protected repository: IAnalysisNodeEventRepository;

    constructor(ctx: AnalysisNodeEventServiceContext) {
        super();
        this.repository = ctx.repository;
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisNodeEvent>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string): Promise<AnalysisNodeEvent> {
        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }
}
