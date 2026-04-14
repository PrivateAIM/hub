/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import type { Analysis } from '@privateaim/core-kit';
import { AnalysisBuilderCommandChecker } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type { EntityPersistContext, IEntityRepository } from '../../entities/types.ts';
import type { IAnalysisBuilderCaller, IAnalysisMetadataCaller } from '../types.ts';

type AnalysisBuilderContext = {
    repository: IEntityRepository<Analysis>;
    caller: IAnalysisBuilderCaller;
    metadataCaller: IAnalysisMetadataCaller;
};

export class AnalysisBuilder {
    protected repository: IEntityRepository<Analysis>;

    protected caller: IAnalysisBuilderCaller;

    protected metadataCaller: IAnalysisMetadataCaller;

    constructor(ctx: AnalysisBuilderContext) {
        this.repository = ctx.repository;
        this.caller = ctx.caller;
        this.metadataCaller = ctx.metadataCaller;
    }

    async start(input: string | Analysis, persistCtx?: EntityPersistContext) {
        const entityId = typeof input === 'string' ? input : input.id;
        const entity = await this.metadataCaller.callRecalcDirect({ analysisId: entityId });

        AnalysisBuilderCommandChecker.canStart(entity);

        entity.build_status = ProcessStatus.STARTING;
        entity.build_progress = null;

        await this.repository.save(entity, persistCtx);
        await this.caller.callExecute({ id: entity.id });

        return entity;
    }

    async check(input: string | Analysis) {
        const entity = await this.resolve(input);
        AnalysisBuilderCommandChecker.canCheck(entity);
        await this.caller.callCheck({ id: entity.id });
        return entity;
    }

    protected async resolve(input: string | Analysis): Promise<Analysis> {
        if (typeof input === 'string') {
            const entity = await this.repository.findOneById(input);
            if (!entity) {
                throw new NotFoundError('Analysis could not be found.');
            }
            return entity;
        }
        return input;
    }
}
