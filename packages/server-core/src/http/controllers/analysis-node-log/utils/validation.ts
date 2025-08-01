/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { LogLevel } from '@privateaim/kit';
import { Container } from 'validup';
import { createValidationChain, createValidator } from '@validup/adapter-validator';
import { HTTPHandlerOperation } from '@privateaim/server-http-kit';
import type { AnalysisNodeLog } from '@privateaim/core-kit';

export class AnalysisNodeLogValidator extends Container<AnalysisNodeLog> {
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

        const statusValidator = createValidator(() => {
            const chain = createValidationChain();
            return chain
                .isString()
                .isLength({ min: 3, max: 64 });
        });
        this.mount(
            'status',
            { optional: true, group: HTTPHandlerOperation.UPDATE },
            statusValidator,
        );
        this.mount(
            'status',
            { group: HTTPHandlerOperation.CREATE },
            statusValidator,
        );

        this.mount(
            'message',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .optional({ nullable: true })
                    .isString();
            }),
        );

        this.mount(
            'code',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .optional({ nullable: true })
                    .isString()
                    .isLength({ min: 3, max: 64 });
            }),
        );

        this.mount(
            'level',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .optional({ nullable: true })
                    .isIn(Object.values(LogLevel));
            }),
        );
    }
}
