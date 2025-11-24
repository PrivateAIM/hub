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
        if (!entity.build_status || entity.build_status !== ProcessStatus.FINISHED) {
            throw new AnalysisError('The analysis is not built yet.');
        }
    }

    /**
     * Check if the distribution check process can be triggered.
     *
     * @param entity
     */
    static canCheck(entity: Analysis) {
        if (!entity.build_status) {
            throw new AnalysisError('The analysis build process has not been initialized.');
        }

        if (entity.build_status !== ProcessStatus.FINISHED) {
            throw new AnalysisError('The analysis build process has not been finished.');
        }

        // todo: check time
    }
}
