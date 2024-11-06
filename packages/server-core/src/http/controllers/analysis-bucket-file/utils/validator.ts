/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import type { AnalysisBucketFile } from '@privateaim/core-kit';
import { createValidator } from '@validup/adapter-validator';
import { HTTPHandlerOperation } from '@privateaim/server-http-kit';

export class AnalysisBucketFileValidator extends Container<AnalysisBucketFile> {
    protected initialize() {
        super.initialize();

        this.mount(
            'bucket_id',
            { group: HTTPHandlerOperation.CREATE },
            createValidator((chain) => chain
                .exists()
                .notEmpty()
                .isUUID()),
        );

        this.mount(
            'name',
            { group: HTTPHandlerOperation.CREATE },
            createValidator((chain) => chain
                .exists()
                .isString()),
        );

        this.mount(
            'name',
            { group: HTTPHandlerOperation.UPDATE, optional: true },
            createValidator((chain) => chain
                .exists()
                .isString()
                .optional({ values: 'null' })),
        );

        this.mount(
            'external_id',
            { group: HTTPHandlerOperation.CREATE },
            createValidator((chain) => chain
                .exists()
                .isUUID()),
        );

        this.mount(
            'root',
            createValidator((chain) => chain
                .optional()
                .toBoolean()
                .isBoolean()
                .default(false)),
        );
    }
}
