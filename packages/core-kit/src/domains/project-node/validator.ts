/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectNode } from './entity.ts';
import { ProjectNodeApprovalStatus } from './constants.ts';
import { Container } from 'validup';
import { createValidator } from '@validup/zod';
import { z } from 'zod';
import { ValidatorGroup } from '@privateaim/kit';

export class ProjectNodeValidator extends Container<ProjectNode> {
    protected override initialize() {
        super.initialize();

        this.mount(
            'project_id',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        this.mount(
            'node_id',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        this.mount(
            'approval_status',
            { group: ValidatorGroup.UPDATE, optional: true },
            createValidator(z.enum(ProjectNodeApprovalStatus).nullable()),
        );

        this.mount(
            'comment',
            { group: ValidatorGroup.UPDATE, optional: true },
            createValidator(z.string().min(3).max(4096).nullable()),
        );
    }
}
