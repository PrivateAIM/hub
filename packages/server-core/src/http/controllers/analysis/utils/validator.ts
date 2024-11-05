/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import { createValidator } from '@validup/adapter-validator';
import type { Analysis } from '@privateaim/core-kit';
import { HTTPHandlerOperation } from '../../constants';

export class AnalysisValidator extends Container<Analysis> {
    protected initialize() {
        super.initialize();

        this.mount(
            'project_id',
            { group: HTTPHandlerOperation.CREATE },
            createValidator((chain) => chain
                .exists()
                .notEmpty()
                .isUUID()),
        );

        this.mount(
            'name',
            { group: HTTPHandlerOperation.UPDATE, optional: true },
            createValidator((chain) => chain
                .isString()
                .isLength({ min: 3, max: 128 })
                .optional({ values: 'null' })),
        );

        this.mount(
            'name',
            { group: HTTPHandlerOperation.CREATE },
            createValidator((chain) => chain
                .isString()
                .isLength({ min: 3, max: 128 })),
        );

        this.mount(
            'description',
            createValidator((chain) => chain
                .isString()
                .isLength({ min: 5, max: 4096 })
                .optional({ values: 'null' })),
        );

        this.mount(
            'master_image_id',
            { optional: true },
            createValidator((chain) => chain
                .isUUID()
                .optional({ values: 'null' })),
        );

        this.mount(
            'registry_id',
            { optional: true },
            createValidator((chain) => chain
                .isUUID()
                .optional({ values: 'null' })),
        );
    }
}
