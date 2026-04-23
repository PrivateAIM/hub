/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import type { AnalysisBucketFile } from '@privateaim/core-kit';
import { createValidationChain, createValidator } from '@validup/adapter-validator';
import { ValidatorGroup } from '@privateaim/server-kit';

export class AnalysisBucketFileValidator extends Container<AnalysisBucketFile> {
    protected initialize() {
        super.initialize();

        this.mount(
            'analysis_bucket_id',
            { group: ValidatorGroup.CREATE },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .exists()
                    .notEmpty()
                    .isUUID();
            }),
        );

        const nameValidator = createValidator(() => {
            const chain = createValidationChain();

            return chain
                .exists()
                .isString();
        });
        this.mount(
            'path',
            { group: ValidatorGroup.CREATE },
            nameValidator,
        );

        this.mount(
            'path',
            { group: ValidatorGroup.UPDATE, optional: true },
            nameValidator,
        );

        this.mount(
            'bucket_id',
            { group: ValidatorGroup.CREATE },
            createValidator(() => {
                const chain = createValidationChain();

                return chain
                    .exists()
                    .isUUID();
            }),
        );

        this.mount(
            'bucket_file_id',
            { group: ValidatorGroup.CREATE },
            createValidator(() => {
                const chain = createValidationChain();

                return chain
                    .exists()
                    .isUUID();
            }),
        );

        this.mount(
            'root',
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .optional()
                    .toBoolean()
                    .isBoolean()
                    .default(false);
            }),
        );
    }
}
