/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import type { Analysis } from '../entity';
import { AnalysisError } from '../error';

export class AnalysisBuilderCommandChecker {
    /**
     * Verify if the build start process can be triggered.
     *
     * @param entity
     */
    static canStart(entity: Analysis) {
        if (!entity.configuration_locked) {
            throw AnalysisError.configurationNotLocked();
        }

        if (!entity.build_nodes_valid) {
            throw AnalysisError.nodesApprovalRequired();
        }

        if (!entity.build_status) {
            return;
        }

        if (
            entity.build_status === ProcessStatus.FAILED ||
            entity.build_status === ProcessStatus.STOPPED
        ) {
            return;
        }

        throw new AnalysisError('The analysis build can not be started.');
    }

    /**
     * Check if the build check process can be triggered.
     *
     * @param entity
     */
    static canCheck(entity: Analysis) {
        if (!entity.configuration_locked) {
            throw new AnalysisError('The analysis configuration must be locked before checking the build status.');
        }

        if (!entity.build_status) {
            throw new AnalysisError('The analysis build process has not been initialized.');
        }

        if (entity.build_status === ProcessStatus.FINISHED) {
            throw new AnalysisError('The analysis build process has already been successfully completed.');
        }

        // todo: check time
    }
}
