/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import { createValidator } from '@validup/adapter-validator';
import { HTTPHandlerOperation } from '@privateaim/server-http-kit';
import type { AnalysisPermissionEntity } from '../../../../domains';

export class AnalysisPermissionValidator extends Container<AnalysisPermissionEntity> {
    protected initialize() {
        super.initialize();

        this.mount(
            'permission_id',
            { group: HTTPHandlerOperation.CREATE },
            createValidator((chain) => chain
                .exists()
                .notEmpty()
                .isUUID()),
        );

        this.mount(
            'analysis_id',
            { group: HTTPHandlerOperation.CREATE },
            createValidator((chain) => chain
                .exists()
                .notEmpty()
                .isUUID()),
        );

        this.mount(
            'policy_id',
            { optional: true },
            createValidator((chain) => chain
                .isUUID()
                .optional({ values: 'null' })),
        );
    }
}
