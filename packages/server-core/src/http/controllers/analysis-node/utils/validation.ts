/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AnalysisNodeApprovalStatus, AnalysisNodeRunStatus } from '@privateaim/core-kit';
import { Container } from 'validup';
import { createValidationChain, createValidator } from '@validup/adapter-validator';
import { HTTPHandlerOperation } from '@privateaim/server-http-kit';
import type { AnalysisNodeEntity } from '../../../../database/domains';

export class AnalysisNodeValidator extends Container<AnalysisNodeEntity> {
    protected initialize() {
        super.initialize();

        this.mount(
            'node_id',
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
            'run_status',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .isIn(Object.values(AnalysisNodeRunStatus))
                    .optional({ values: 'null' });
            }),
        );

        this.mount(
            'index',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .exists()
                    .isInt()
                    .optional({ values: 'null' });
            }),
        );

        this.mount(
            'approval_status',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .optional({ nullable: true })
                    .isIn(Object.values(AnalysisNodeApprovalStatus));
            }),
        );

        this.mount(
            'comment',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .optional({ nullable: true })
                    .isString();
            }),
        );
    }
}
