/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, EntityNotFoundError } from '@privateaim/errors';
import type { Analysis, AnalysisNode, Registry } from '@privateaim/core-kit';
import { AnalysisDistributorCommandChecker } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type {
    AnalysisDistributorBasePayload,
    AnalysisDistributorCheckFinishedPayload,
    AnalysisDistributorEventMap,
    AnalysisDistributorExecutionProgressPayload,
} from '@privateaim/server-core-worker-kit';
import { AnalysisDistributorEvent } from '@privateaim/server-core-worker-kit';
import type { EntityPersistContext, IEntityRepository } from '@privateaim/server-kit';
import type { IAnalysisMetadataRecalculator, IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { IAnalysisNodeMetadataRecalculator } from '../../entities/analysis-node/types.ts';
import type { IAnalysisFileMetadataRecalculator } from '../../entities/analysis-bucket-file/types.ts';
import {
    isCheckVerdictStale,
    isProcessHeartbeatDue,
    isProcessStale,
    isProcessStatusInProgress,
} from '../helpers.ts';
import type { IAnalysisDistributorDispatcher } from './types.ts';

type AnalysisDistributorContext = {
    repository: IAnalysisRepository;
    analysisNodeRepository: IEntityRepository<AnalysisNode>;
    registryRepository: IEntityRepository<Registry>;
    dispatcher: IAnalysisDistributorDispatcher;
    analysisRecalculator: IAnalysisMetadataRecalculator;
    nodeRecalculator: IAnalysisNodeMetadataRecalculator;
    fileRecalculator: IAnalysisFileMetadataRecalculator;
};

export class AnalysisDistributor {
    protected repository: IAnalysisRepository;

    protected analysisNodeRepository: IEntityRepository<AnalysisNode>;

    protected registryRepository: IEntityRepository<Registry>;

    protected dispatcher: IAnalysisDistributorDispatcher;

    protected analysisRecalculator: IAnalysisMetadataRecalculator;

    protected nodeRecalculator: IAnalysisNodeMetadataRecalculator;

    protected fileRecalculator: IAnalysisFileMetadataRecalculator;

    constructor(ctx: AnalysisDistributorContext) {
        this.repository = ctx.repository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.registryRepository = ctx.registryRepository;
        this.dispatcher = ctx.dispatcher;
        this.analysisRecalculator = ctx.analysisRecalculator;
        this.nodeRecalculator = ctx.nodeRecalculator;
        this.fileRecalculator = ctx.fileRecalculator;
    }

    async start(input: string | Analysis, persistCtx?: EntityPersistContext) {
        const entityId = typeof input === 'string' ? input : input.id;

        await this.analysisRecalculator.recalc(entityId);
        await this.nodeRecalculator.recalc(entityId);
        const entity = await this.fileRecalculator.recalc(entityId);

        AnalysisDistributorCommandChecker.canStart(entity);

        await this.assignRegistry(entity);
        await this.checkNodes(entity);

        // checked again on the locked row: a concurrent start (another
        // replica) may have moved the status since the read above.
        const started = await this.repository.updateLocked(entityId, (locked) => {
            AnalysisDistributorCommandChecker.canStart(locked);

            locked.registryId ??= entity.registryId;
            locked.distributionStatus = ProcessStatus.STARTING;
            return true;
        }, persistCtx);

        if (!started) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        await this.dispatcher.dispatchExecute({ id: started.id });

        return started;
    }

    async check(input: string | Analysis) {
        const entity = await this.resolve(input);
        AnalysisDistributorCommandChecker.canCheck(entity);
        await this.dispatcher.dispatchCheck({ id: entity.id });
        return entity;
    }

    /**
     * Apply a worker event to the analysis' distribution status. Resolves the
     * saved row, or null when the row is missing or the event is a no-op.
     */
    async applyEvent(
        key: keyof AnalysisDistributorEventMap,
        value: AnalysisDistributorBasePayload,
    ): Promise<Analysis | null> {
        // the whole read-check-mutate-save runs on the locked row, so a terminal
        // status is checked against the row as it is now, not as it was read
        // before a concurrent handler (another replica) committed.
        return this.repository.updateLocked(value.id, (entity) => {
            switch (key) {
                case AnalysisDistributorEvent.EXECUTION_STARTED: {
                    // only a run core still considers running (STARTING/STARTED)
                    // may progress: not a terminal one, and not one unlocked to
                    // null, which a late event would leave unlocked-but-running.
                    if (!isProcessStatusInProgress(entity.distributionStatus)) {
                        return false;
                    }

                    entity.distributionStatus = ProcessStatus.STARTED;
                    entity.distributionProgress = 0;
                    break;
                }
                case AnalysisDistributorEvent.EXECUTION_PROGRESS: {
                    // only a run core still considers running (STARTING/STARTED)
                    // may progress: not a terminal one, and not one unlocked to
                    // null, which a late event would leave unlocked-but-running.
                    if (!isProcessStatusInProgress(entity.distributionStatus)) {
                        return false;
                    }

                    const temp = value as AnalysisDistributorExecutionProgressPayload;
                    const previous = entity.distributionProgress;
                    if (
                        !entity.distributionProgress ||
                        temp.progress.percent >= entity.distributionProgress
                    ) {
                        entity.distributionProgress = Math.min(temp.progress.percent, 100);
                    }

                    // a worker heartbeat repeats the last percent, and typeorm
                    // skips a save that changes nothing — stamp the row so it
                    // reads as alive to the stale check (F13). Throttled, so a
                    // burst of unchanged progress is not a write per event; a
                    // percent change bumps updatedAt on its own.
                    if (entity.distributionProgress === previous) {
                        if (!isProcessHeartbeatDue(entity.updatedAt)) {
                            return false;
                        }

                        entity.updatedAt = new Date().toISOString();
                    }
                    break;
                }
                case AnalysisDistributorEvent.CHECK_FAILED: {
                    // failure of the check itself says nothing about the distribution outcome
                    return false;
                }
                case AnalysisDistributorEvent.EXECUTION_FAILED: {
                    // a late failure must neither flip a finished run nor
                    // write onto one unlocked to null.
                    if (!isProcessStatusInProgress(entity.distributionStatus)) {
                        return false;
                    }

                    entity.distributionStatus = ProcessStatus.FAILED;
                    break;
                }
                case AnalysisDistributorEvent.EXECUTION_FINISHED: {
                    // only a run core still considers running may finish. A run
                    // already declared FAILED (a stale verdict after a worker
                    // outage — the retried EXECUTE is re-published behind the
                    // reconciler's CHECKs) or unlocked to null must not be
                    // resurrected by a late finish.
                    // ponytail: the full fix is run ids (plan 018).
                    if (!isProcessStatusInProgress(entity.distributionStatus)) {
                        return false;
                    }

                    entity.distributionStatus = ProcessStatus.EXECUTED;
                    entity.distributionProgress = 100;
                    break;
                }
                case AnalysisDistributorEvent.CHECK_FINISHED: {
                    const temp = value as AnalysisDistributorCheckFinishedPayload;
                    if (!temp.status || isCheckVerdictStale(temp.checkedAt, entity.updatedAt)) {
                        return false;
                    }

                    // the worker reports an in-progress status as it sees it;
                    // whether that process is orphaned is judged here, on the
                    // locked row (F13).
                    const status = isProcessStatusInProgress(temp.status) && isProcessStale(entity.updatedAt) ?
                        ProcessStatus.FAILED :
                        temp.status;

                    entity.distributionStatus = status;

                    if (status === ProcessStatus.EXECUTED) {
                        entity.distributionProgress = 100;
                    } else if (status === ProcessStatus.FAILED) {
                        entity.distributionProgress = 0;
                    }
                }
            }

            return true;
        });
    }

    protected async assignRegistry(entity: Analysis) {
        if (!entity.registryId) {
            const registries = await this.registryRepository.findManyBy({});
            const registry = registries[0];

            if (!registry) {
                throw new BadRequestError('No docker registry is defined.');
            }

            entity.registryId = registry.id;
        }

        return entity;
    }

    protected async checkNodes(entity: Analysis) {
        const analysisNodes = await this.analysisNodeRepository.findManyBy({ analysisId: entity.id });

        for (const analysisNode of analysisNodes) {
            if (
                analysisNode.node &&
                !analysisNode.node.registryId
            ) {
                throw new BadRequestError(`The node ${analysisNode.node.name} is not assigned to a registry yet.`);
            }
        }
    }

    protected async resolve(input: string | Analysis): Promise<Analysis> {
        if (typeof input === 'string') {
            const entity = await this.repository.findOneById(input);
            if (!entity) {
                throw new BadRequestError('Analysis could not be found.');
            }
            return entity;
        }
        return input;
    }
}
