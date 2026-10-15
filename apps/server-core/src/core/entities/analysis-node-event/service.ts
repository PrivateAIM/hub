/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { eq } from '@rapiq/core';
import type { AnalysisNodeEvent } from '@privateaim/core-kit';
import { EntityNotFoundError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService, appendQueryConditions  } from '@privateaim/server-kit';
import { decodeQuery } from '../../query/index.ts';
import type { AnalysisReachTarget, IAnalysisReachService } from '../../services/analysis-reach/index.ts';
import { analysisNodeEventSchema } from './schema.ts';
import type { IAnalysisNodeEventRepository, IAnalysisNodeEventService } from './types.ts';

type AnalysisNodeEventServiceContext = {
    repository: IAnalysisNodeEventRepository;
    reach: IAnalysisReachService;
};

/** Like analysis-node rows (D2): every participant sees every node's events. */
const REACH_TARGET: AnalysisReachTarget = {
    analysisPath: 'analysis',
    analysisIdAttributeName: 'analysisId',
};

export class AnalysisNodeEventService extends AbstractEntityService implements IAnalysisNodeEventService {
    protected repository: IAnalysisNodeEventRepository;

    protected reach: IAnalysisReachService;

    constructor(ctx: AnalysisNodeEventServiceContext) {
        super();
        this.repository = ctx.repository;
        this.reach = ctx.reach;
    }

    async getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<AnalysisNodeEvent>> {
        const decoded = decodeQuery(query, { schema: analysisNodeEventSchema });
        const condition = await this.reach.resolve(actor, REACH_TARGET);

        return this.repository.findMany(condition ? appendQueryConditions(decoded, condition) : decoded);
    }

    /** Reads through the same reach as {@link getMany}; out of reach answers 404. */
    async getOne(id: string, actor: ActorContext, query?: Record<string, any>): Promise<AnalysisNodeEvent> {
        const decoded = decodeQuery(query, { schema: analysisNodeEventSchema, parameters: ['fields', 'relations'] });
        const condition = await this.reach.resolve(actor, REACH_TARGET);

        const scoped = condition ? appendQueryConditions(decoded, condition) : decoded;
        const { data: [entity] } = await this.repository.findMany(appendQueryConditions(scoped, eq('id', id)));
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-node-event' });
        }

        return entity;
    }
}
