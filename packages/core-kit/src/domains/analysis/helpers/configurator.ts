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
        if (entity.configuration_locked) {
            throw AnalysisError.configurationLocked();
        }

        if (entity.build_status) {
            throw AnalysisError.buildInitialized();
        }

        if (!entity.configuration_node_default_valid) {
            throw AnalysisError.defaultNodeRequired();
        }

        if (!entity.configuration_node_aggregator_valid) {
            throw AnalysisError.aggregatorNodeRequired();
        }

        if (!entity.configuration_entrypoint_valid) {
            throw AnalysisError.entrypointRequired();
        }

        if (!entity.configuration_image_valid) {
            throw AnalysisError.imageAssignmentRequired();
        }
    }

    /**
     * Check if the analysis configuration can be unlocked.
     *
     * @param entity
     */
    static canUnlock(entity: Analysis): void {
        if (!entity.configuration_locked) {
            throw new AnalysisError('The analysis configuration is already unlocked.');
        }

        if (!entity.distribution_status) {
            return;
        }

        if (
            entity.build_status === ProcessStatus.FAILED ||
            entity.build_status === ProcessStatus.STOPPED ||
            entity.build_status === ProcessStatus.STOPPING
        ) {
            return;
        }

        throw new AnalysisError('The analysis configuration can not be unlocked.');
    }
}
