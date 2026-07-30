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
        if (!entity.configurationLocked) {
            throw AnalysisError.configurationNotLocked();
        }

        if (!entity.buildNodesValid) {
            throw AnalysisError.nodesApprovalRequired();
        }

        if (!entity.buildStatus) {
            return;
        }

        if (
            entity.buildStatus === ProcessStatus.FAILED ||
            entity.buildStatus === ProcessStatus.STOPPED
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
        if (!entity.configurationLocked) {
            throw new AnalysisError('The analysis configuration must be locked before checking the build status.');
        }

        if (!entity.buildStatus) {
            throw new AnalysisError('The analysis build process has not been initialized.');
        }

        // EXECUTED is checkable on purpose: it reconciles the recorded state
        // with the docker daemon after data loss (image gone -> FAILED -> rebuildable).

        // todo: check time
    }
}
