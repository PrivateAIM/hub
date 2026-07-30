/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import type { Analysis } from '../entity';
import { AnalysisError } from '../error';

export class AnalysisDistributorCommandChecker {
    /**
     * Check if the distribution start process can be triggered.
     *
     * @param entity
     */
    static canStart(entity: Analysis) {
        if (
            !entity.buildStatus ||
            entity.buildStatus !== ProcessStatus.EXECUTED
        ) {
            throw new AnalysisError('The analysis is not built yet.');
        }

        // we haven't started distribution yet.
        if (!entity.distributionStatus) {
            return;
        }

        if (
            entity.distributionStatus !== ProcessStatus.FAILED &&
            entity.distributionStatus !== ProcessStatus.STOPPED
        ) {
            throw new AnalysisError(`The analysis can not be distributed in state ${  entity.distributionStatus}`);
        }
    }

    /**
     * Check if the distribution check process can be triggered.
     *
     * @param entity
     */
    static canCheck(entity: Analysis) {
        if (!entity.buildStatus) {
            throw new AnalysisError('The analysis build process has not been initialized.');
        }

        if (entity.buildStatus !== ProcessStatus.EXECUTED) {
            throw new AnalysisError('The analysis build process has not been finished.');
        }

        if (!entity.distributionStatus) {
            throw new AnalysisError('The analysis distribution process has not been initialized.');
        }

        // EXECUTED is checkable on purpose: it reconciles the recorded state
        // with the registry after data loss (images gone -> FAILED -> redistributable).

        // todo: check time
    }
}
