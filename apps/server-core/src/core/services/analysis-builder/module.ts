/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EntityNotFoundError } from '@privateaim/errors';
import type { Analysis } from '@privateaim/core-kit';
import { AnalysisBuilderCommandChecker, NodeType } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type {
    AnalysisBuilderBasePayload,
    AnalysisBuilderCheckFinishedPayload,
    AnalysisBuilderEventMap,
    AnalysisBuilderExecutionFinishedPayload,
    AnalysisBuilderExecutionProgressPayload,
} from '@privateaim/server-core-worker-kit';
import { AnalysisBuilderEvent } from '@privateaim/server-core-worker-kit';
import {
    isCheckVerdictStale,
    isProcessHeartbeatDue,
    isProcessStale,
    isProcessStatusInProgress,
} from '../helpers.ts';
import type { IAnalysisMetadataRecalculator, IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { IAnalysisNodeMetadataRecalculator, IAnalysisNodeRepository } from '../../entities/analysis-node/types.ts';
import type { IAnalysisFileMetadataRecalculator } from '../../entities/analysis-bucket-file/types.ts';
import type { AnalysisBuilderStartOptions, IAnalysisBuilderDispatcher } from './types.ts';

type AnalysisBuilderContext = {
    repository: IAnalysisRepository;
    analysisNodeRepository: IAnalysisNodeRepository;
    dispatcher: IAnalysisBuilderDispatcher;
    analysisRecalculator: IAnalysisMetadataRecalculator;
    nodeRecalculator: IAnalysisNodeMetadataRecalculator;
    fileRecalculator: IAnalysisFileMetadataRecalculator;
};

export class AnalysisBuilder {
    protected repository: IAnalysisRepository;

    protected analysisNodeRepository: IAnalysisNodeRepository;

    protected dispatcher: IAnalysisBuilderDispatcher;

    protected analysisRecalculator: IAnalysisMetadataRecalculator;

    protected nodeRecalculator: IAnalysisNodeMetadataRecalculator;

    protected fileRecalculator: IAnalysisFileMetadataRecalculator;

    constructor(ctx: AnalysisBuilderContext) {
        this.repository = ctx.repository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.dispatcher = ctx.dispatcher;
        this.analysisRecalculator = ctx.analysisRecalculator;
        this.nodeRecalculator = ctx.nodeRecalculator;
        this.fileRecalculator = ctx.fileRecalculator;
    }

    async start(input: string | Analysis, options: AnalysisBuilderStartOptions = {}) {
        const entityId = typeof input === 'string' ? input : input.id;

        await this.analysisRecalculator.recalc(entityId);
        await this.nodeRecalculator.recalc(entityId);
        const entity = await this.fileRecalculator.recalc(entityId);

        // early, so approvals are not reset for a build that cannot start
        AnalysisBuilderCommandChecker.canStart(entity);

        if (!options.ignoreApproval) {
            await this.resetApprovals(entityId);
            await this.nodeRecalculator.recalc(entityId);
        }

        // checked again on the locked row: a concurrent start (another
        // replica) may have moved the status since the read above.
        const started = await this.repository.updateLocked(entityId, (locked) => {
            AnalysisBuilderCommandChecker.canStart(locked);

            locked.buildStatus = ProcessStatus.STARTING;
            locked.buildProgress = null;
            return true;
        }, options.persistCtx);

        if (!started) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        await this.dispatcher.dispatchExecute({ id: started.id });

        return started;
    }

    async check(input: string | Analysis) {
        const entity = await this.resolve(input);
        AnalysisBuilderCommandChecker.canCheck(entity);
        await this.dispatcher.dispatchCheck({ id: entity.id });
        return entity;
    }

    /**
     * Apply a worker event to the analysis' build status. Resolves the saved
     * row, or null when the row is missing or the event is a no-op.
     */
    async applyEvent(
        key: keyof AnalysisBuilderEventMap,
        value: AnalysisBuilderBasePayload,
    ): Promise<Analysis | null> {
        // the whole read-check-mutate-save runs on the locked row, so a terminal
        // status is checked against the row as it is now, not as it was read
        // before a concurrent handler (another replica) committed.
        return this.repository.updateLocked(value.id, (entity) => {
            switch (key) {
                case AnalysisBuilderEvent.EXECUTION_STARTED: {
                    // only a run core still considers running (STARTING/STARTED)
                    // may progress: not a terminal one, and not one unlocked to
                    // null, which a late event would leave unlocked-but-running.
                    if (!isProcessStatusInProgress(entity.buildStatus)) {
                        return false;
                    }

                    entity.buildStatus = ProcessStatus.STARTED;
                    entity.buildProgress = 0;
                    break;
                }
                case AnalysisBuilderEvent.EXECUTION_PROGRESS: {
                    // only a run core still considers running (STARTING/STARTED)
                    // may progress: not a terminal one, and not one unlocked to
                    // null, which a late event would leave unlocked-but-running.
                    if (!isProcessStatusInProgress(entity.buildStatus)) {
                        return false;
                    }

                    const temp = value as AnalysisBuilderExecutionProgressPayload;
                    const previous = entity.buildProgress;
                    if (
                        !entity.buildProgress ||
                        temp.progress.percent >= entity.buildProgress
                    ) {
                        entity.buildProgress = Math.min(temp.progress.percent, 100);
                    }

                    // a worker heartbeat repeats the last percent, and typeorm
                    // skips a save that changes nothing — stamp the row so it
                    // reads as alive to the stale check (F13). Throttled, so a
                    // burst of unchanged progress is not a write per event; a
                    // percent change bumps updatedAt on its own.
                    if (entity.buildProgress === previous) {
                        if (!isProcessHeartbeatDue(entity.updatedAt)) {
                            return false;
                        }

                        entity.updatedAt = new Date().toISOString();
                    }
                    break;
                }
                case AnalysisBuilderEvent.CHECK_FAILED: {
                    // failure of the check itself says nothing about the build outcome
                    return false;
                }
                case AnalysisBuilderEvent.EXECUTION_FAILED: {
                    // a late failure must neither flip a finished run nor
                    // write onto one unlocked to null.
                    if (!isProcessStatusInProgress(entity.buildStatus)) {
                        return false;
                    }

                    entity.buildStatus = ProcessStatus.FAILED;
                    break;
                }
                case AnalysisBuilderEvent.EXECUTION_FINISHED: {
                    // only a run core still considers running may finish. A run
                    // already declared FAILED (a stale verdict after a worker
                    // outage — the retried EXECUTE is re-published behind the
                    // reconciler's CHECKs) or unlocked to null must not be
                    // resurrected by a late finish.
                    // ponytail: the full fix is run ids (plan 018).
                    if (!isProcessStatusInProgress(entity.buildStatus)) {
                        return false;
                    }

                    const temp = value as AnalysisBuilderExecutionFinishedPayload;

                    entity.buildHash = temp.hash ?? null;
                    entity.buildOs = temp.os ?? null;
                    entity.buildSize = temp.size ?? null;
                    entity.buildStatus = ProcessStatus.EXECUTED;
                    entity.buildProgress = 100;
                    break;
                }
                case AnalysisBuilderEvent.CHECK_FINISHED: {
                    const temp = value as AnalysisBuilderCheckFinishedPayload;
                    if (!temp.status || isCheckVerdictStale(temp.checkedAt, entity.updatedAt)) {
                        return false;
                    }

                    // the worker reports an in-progress status as it sees it;
                    // whether that process is orphaned is judged here, on the
                    // locked row (F13).
                    const status = isProcessStatusInProgress(temp.status) && isProcessStale(entity.updatedAt) ?
                        ProcessStatus.FAILED :
                        temp.status;

                    entity.buildStatus = status;

                    if (status === ProcessStatus.EXECUTED) {
                        entity.buildProgress = 100;
                        entity.buildHash = temp.hash ?? entity.buildHash;
                        entity.buildOs = temp.os ?? entity.buildOs;
                        entity.buildSize = temp.size ?? entity.buildSize;
                    } else if (status === ProcessStatus.FAILED) {
                        // the image is verifiably gone (e.g. docker daemon data loss) —
                        // reset the build artifacts so the build can be retriggered.
                        entity.buildProgress = 0;
                        entity.buildHash = temp.hash ?? null;
                        entity.buildOs = temp.os ?? null;
                        entity.buildSize = temp.size ?? null;
                    }
                }
            }

            return true;
        });
    }

    /**
     * Nodes approve the built image, not the code, so an approval given for a
     * previous image must not let a new one through distribution.
     */
    protected async resetApprovals(analysisId: string) {
        // The node relation tells an aggregator apart; a plain findManyBy
        // leaves it unloaded, which would clear the aggregator's approval too.
        const analysisNodes = await this.analysisNodeRepository.findManyWithNodeByAnalysis(analysisId);

        for (const analysisNode of analysisNodes) {
            if (
                (analysisNode.node && analysisNode.node.type === NodeType.AGGREGATOR) ||
                analysisNode.approvalStatus === null
            ) {
                continue;
            }

            analysisNode.approvalStatus = null;
            await this.analysisNodeRepository.save(analysisNode);
        }
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
