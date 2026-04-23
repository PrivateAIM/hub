/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import { Container } from 'validup';
import { createValidationChain, createValidator } from '@validup/adapter-validator';
import { ValidatorGroup } from '@privateaim/server-kit';

export class AnalysisBucketValidator extends Container<AnalysisBucket> {
    protected initialize() {
        super.initialize();

        this.mount(
            'analysis_id',
            { group: ValidatorGroup.CREATE },
            createValidator(() => {
                const chain = createValidationChain();

                return chain
                    .exists()
                    .notEmpty()
                    .isUUID();
            }),
        );

        this.mount(
            'bucket_id',
            { group: ValidatorGroup.CREATE },
            createValidator(() => {
                const chain = createValidationChain();

                return chain
                    .exists()
                    .notEmpty()
                    .isUUID();
            }),
        );

        this.mount(
            'type',
            { group: ValidatorGroup.CREATE },
            createValidator(() => {
                const chain = createValidationChain();

                return chain
                    .notEmpty()
                    .isIn(Object.values(AnalysisBucketType));
            }),
        );
    }
}
