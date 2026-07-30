/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import type { Analysis } from '../entity';
import { AnalysisError } from '../error';

export class AnalysisConfiguratorCommandChecker {
    /**
     * Check if the analysis configuration can be locked.
     *
     * @param entity
     */
    static canLock(entity: Analysis) : void {
        if (entity.configurationLocked) {
            throw AnalysisError.configurationLocked();
        }

        if (entity.buildStatus) {
            throw AnalysisError.buildInitialized();
        }

        if (!entity.configurationNodeDefaultValid) {
            throw AnalysisError.defaultNodeRequired();
        }

        if (!entity.configurationNodeAggregatorValid) {
            throw AnalysisError.aggregatorNodeRequired();
        }

        if (!entity.configurationEntrypointValid) {
            throw AnalysisError.entrypointRequired();
        }

        if (!entity.configurationImageValid) {
            throw AnalysisError.imageAssignmentRequired();
        }
    }

    /**
     * Check if the analysis configuration can be unlocked.
     *
     * @param entity
     */
    static canUnlock(entity: Analysis): void {
        if (!entity.configurationLocked) {
            throw new AnalysisError('The analysis configuration is already unlocked.');
        }

        if (!entity.buildStatus) {
            return;
        }

        if (
            entity.buildStatus === ProcessStatus.FAILED ||
            entity.buildStatus === ProcessStatus.STOPPED ||
            entity.buildStatus === ProcessStatus.STOPPING
        ) {
            return;
        }

        throw new AnalysisError('The analysis configuration can not be unlocked.');
    }
}
