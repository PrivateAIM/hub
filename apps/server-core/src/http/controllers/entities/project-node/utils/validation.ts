/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectNode } from '@privateaim/core-kit';
import { ProjectNodeApprovalStatus } from '@privateaim/core-kit';
import { Container } from 'validup';
import { createValidationChain, createValidator } from '@validup/adapter-validator';
import { HTTPHandlerOperation } from '@privateaim/server-http-kit';

export class ProjectNodeValidator extends Container<ProjectNode> {
    protected initialize() {
        super.initialize();

        this.mount(
            'project_id',
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
            'approval_status',
            { group: HTTPHandlerOperation.UPDATE },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .optional({ values: 'null' })
                    .isIn(Object.values(ProjectNodeApprovalStatus));
            }),
        );

        this.mount(
            'comment',
            { group: HTTPHandlerOperation.UPDATE, optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .optional({ nullable: true })
                    .isString()
                    .isLength({ min: 3, max: 4096 });
            }),
        );
    }
}
