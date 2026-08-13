/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { eq } from '@rapiq/core';
import type { AnalysisNodeEvent } from '@privateaim/core-kit';
import { EntityNotFoundError } from '@privateaim/errors';
import type { EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
import { appendQueryConditions, decodeQuery } from '../../query/index.ts';
import { analysisNodeEventSchema } from './schema.ts';
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
        return this.repository.findMany(decodeQuery(query, { schema: analysisNodeEventSchema }));
    }

    /**
     * `findOneById` takes no query, so an actor-supplied `fields`/`relations`
     * selection has to go through `findMany` with an `id` condition appended.
     */
    async getOne(id: string, query?: Record<string, any>): Promise<AnalysisNodeEvent> {
        const entity = query ?
            await this.repository.findMany(appendQueryConditions(decodeQuery(query, { schema: analysisNodeEventSchema, parameters: ['fields', 'relations'] }), eq('id', id))).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-node-event' });
        }

        return entity;
    }
}
