/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type {
    MasterImageBuilderBasePayload,
    MasterImageBuilderEventMap,
    MasterImageBuilderExecutionProgressPayload,
} from '@privateaim/server-core-worker-kit';
import { MasterImageBuilderEvent } from '@privateaim/server-core-worker-kit';
import type { IMasterImageRepository } from '../../../entities/master-image/types.ts';
import { isProcessStatusInProgress } from '../../helpers.ts';
import type { MasterImageBuilderServiceContext } from './types.ts';

export class MasterImageBuilderService {
    protected imageRepository: IMasterImageRepository;

    constructor(ctx: MasterImageBuilderServiceContext) {
        this.imageRepository = ctx.imageRepository;
    }

    /**
     * Apply a worker event to the master image's build status. Resolves the
     * saved row, or null when the row is missing or the event is a no-op.
     */
    async applyEvent(
        key: keyof MasterImageBuilderEventMap,
        value: MasterImageBuilderBasePayload,
    ): Promise<MasterImage | null> {
        // Check the current status under the lock, not a stale pre-lock read.
        return this.imageRepository.updateLocked(value.id, (entity) => {
            switch (key) {
                case MasterImageBuilderEvent.EXECUTION_STARTED: {
                    if (!isProcessStatusInProgress(entity.buildStatus)) {
                        return false;
                    }

                    entity.buildStatus = ProcessStatus.STARTED;
                    entity.buildProgress = 0;

                    break;
                }
                case MasterImageBuilderEvent.EXECUTION_PROGRESS: {
                    if (!isProcessStatusInProgress(entity.buildStatus)) {
                        return false;
                    }

                    const temp = value as MasterImageBuilderExecutionProgressPayload;

                    if (
                        !entity.buildProgress ||
                        temp.progress.percent > entity.buildProgress
                    ) {
                        entity.buildProgress = Math.min(temp.progress.percent, 100);
                    }

                    break;
                }
                case MasterImageBuilderEvent.EXECUTION_FAILED: {
                    if (!isProcessStatusInProgress(entity.buildStatus)) {
                        return false;
                    }

                    entity.buildStatus = ProcessStatus.FAILED;

                    break;
                }
                case MasterImageBuilderEvent.EXECUTION_FINISHED: {
                    if (!isProcessStatusInProgress(entity.buildStatus)) {
                        return false;
                    }

                    entity.buildStatus = ProcessStatus.EXECUTED;
                    entity.buildProgress = 100;
                }
            }

            return true;
        });
    }
}
