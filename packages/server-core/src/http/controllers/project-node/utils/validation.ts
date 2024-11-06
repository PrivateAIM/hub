/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProjectNodeApprovalStatus } from '@privateaim/core-kit';
import { Container } from 'validup';
import { createValidator } from '@validup/adapter-validator';
import type { ProjectNodeEntity } from '../../../../domains';
import { HTTPHandlerOperation } from '../../constants';

export class ProjectNodeValidator extends Container<ProjectNodeEntity> {
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
            'node_id',
            { group: HTTPHandlerOperation.CREATE },
            createValidator((chain) => chain
                .exists()
                .notEmpty()
                .isUUID()),
        );

        this.mount(
            'approval_status',
            { group: HTTPHandlerOperation.UPDATE },
            createValidator((chain) => chain
                .optional({ values: 'null' })
                .isIn(Object.values(ProjectNodeApprovalStatus))),
        );

        this.mount(
            'comment',
            { group: HTTPHandlerOperation.UPDATE, optional: true },
            createValidator((chain) => chain
                .optional({ nullable: true })
                .isString()
                .isLength({ min: 3, max: 4096 })),
        );
    }
}
