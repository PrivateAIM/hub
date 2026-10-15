/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EntityNotFoundError } from '@privateaim/errors';
import type { Analysis, AnalysisNode } from '@privateaim/core-kit';
import { AnalysisConfiguratorCommandChecker, NodeType } from '@privateaim/core-kit';
import type { IEntityRepository } from '@privateaim/server-kit';
import type { IAnalysisMetadataRecalculator, IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { IAnalysisNodeMetadataRecalculator } from '../../entities/analysis-node/types.ts';
import type { IAnalysisFileMetadataRecalculator } from '../../entities/analysis-bucket-file/types.ts';
import type { AnalysisConfiguratorLockOptions, AnalysisConfiguratorUnlockOptions } from './types.ts';

type AnalysisConfiguratorContext = {
    repository: IAnalysisRepository;
    analysisNodeRepository: IEntityRepository<AnalysisNode>;
    analysisRecalculator: IAnalysisMetadataRecalculator;
    nodeRecalculator: IAnalysisNodeMetadataRecalculator;
    fileRecalculator: IAnalysisFileMetadataRecalculator;
};

export class AnalysisConfigurator {
    protected repository: IAnalysisRepository;

    protected analysisNodeRepository: IEntityRepository<AnalysisNode>;

    protected analysisRecalculator: IAnalysisMetadataRecalculator;

    protected nodeRecalculator: IAnalysisNodeMetadataRecalculator;

    protected fileRecalculator: IAnalysisFileMetadataRecalculator;

    constructor(ctx: AnalysisConfiguratorContext) {
        this.repository = ctx.repository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.analysisRecalculator = ctx.analysisRecalculator;
        this.nodeRecalculator = ctx.nodeRecalculator;
        this.fileRecalculator = ctx.fileRecalculator;
    }

    async lock(
        input: string | Analysis,
        options: AnalysisConfiguratorLockOptions = {},
    ): Promise<Analysis> {
        const entityId = typeof input === 'string' ? input : input.id;

        await this.analysisRecalculator.recalc(entityId);
        await this.nodeRecalculator.recalc(entityId);
        await this.fileRecalculator.recalc(entityId);

        // on the locked row: a concurrent transition may have moved it since the recalcs
        const entity = await this.repository.updateLocked(entityId, (locked) => {
            AnalysisConfiguratorCommandChecker.canLock(locked);

            locked.configurationLocked = true;
            return true;
        }, options.persistCtx);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        return entity;
    }

    async unlock(
        input: string | Analysis,
        options: AnalysisConfiguratorUnlockOptions = {},
    ): Promise<Analysis> {
        const entity = await this.resolve(input);

        AnalysisConfiguratorCommandChecker.canUnlock(entity);

        const analysisNodes = await this.analysisNodeRepository.findManyBy({ analysisId: entity.id });

        for (const analysisNode of analysisNodes) {
            if (
                analysisNode.node &&
                analysisNode.node.type === NodeType.AGGREGATOR
            ) {
                continue;
            }

            if (!options.ignoreApproval) {
                analysisNode.approvalStatus = null;
            }

            await this.analysisNodeRepository.save(analysisNode);
        }

        // checked again on the locked row: a concurrent build start (another
        // replica) may have committed STARTING since the read above.
        const unlocked = await this.repository.updateLocked(entity.id, (locked) => {
            AnalysisConfiguratorCommandChecker.canUnlock(locked);

            locked.configurationLocked = false;
            locked.buildStatus = null;
            return true;
        }, options.persistCtx);

        if (!unlocked) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        return this.nodeRecalculator.recalc(entity.id);
    }

    protected async resolve(input: string | Analysis): Promise<Analysis> {
        if (typeof input === 'string') {
            const entity = await this.repository.findOneById(input);
            if (!entity) {
                throw new EntityNotFoundError({ entity: 'analysis' });
            }
            return entity;
        }
        return input;
    }
}
