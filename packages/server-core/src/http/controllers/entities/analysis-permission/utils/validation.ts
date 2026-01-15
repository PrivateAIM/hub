/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import { createValidationChain, createValidator } from '@validup/adapter-validator';
import { HTTPHandlerOperation } from '@privateaim/server-http-kit';
import type { AnalysisPermission } from '@privateaim/core-kit';

export class AnalysisPermissionValidator extends Container<AnalysisPermission> {
    protected initialize() {
        super.initialize();

        this.mount(
            'permission_id',
            { group: HTTPHandlerOperation.CREATE },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .exists()
                    .notEmpty()
                    .isUUID();
            }),
        );

        this.mount(
            'analysis_id',
            { group: HTTPHandlerOperation.CREATE },
            createValidator(() => {
                const chain = createValidationChain();

                return chain
                    .exists()
                    .notEmpty()
                    .isUUID();
            }),
        );

        this.mount(
            'policy_id',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();

                return chain
                    .isUUID()
                    .optional({ values: 'null' });
            }),
        );
    }
}
