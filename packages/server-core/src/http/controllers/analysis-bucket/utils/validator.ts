/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import { Container } from 'validup';
import { createValidator } from '@validup/adapter-validator';
import { HTTPHandlerOperation } from '../../constants';

export class AnalysisBucketValidator extends Container<AnalysisBucket> {
    protected initialize() {
        super.initialize();

        this.mount(
            'analysis_id',
            { group: HTTPHandlerOperation.CREATE },
            createValidator((chain) => chain
                .exists()
                .notEmpty()
                .isUUID()),
        );

        this.mount(
            'type',
            { group: HTTPHandlerOperation.CREATE },
            createValidator((chain) => chain
                .notEmpty()
                .isIn(Object.values(AnalysisBucketType))),
        );
    }
}
