/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNode } from './entity.ts';
import { AnalysisNodeApprovalStatus } from './constants.ts';
import { Container } from 'validup';
import { createValidator } from '@validup/zod';
import { z } from 'zod';
import { ProcessStatus, ValidatorGroup } from '@privateaim/kit';

export class AnalysisNodeValidator extends Container<AnalysisNode> {
    protected override initialize() {
        super.initialize();

        this.mount(
            'nodeId',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        this.mount(
            'analysisId',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        this.mount(
            'executionStatus',
            { optional: true },
            createValidator(z.enum(ProcessStatus).nullable()),
        );

        this.mount(
            'executionProgress',
            { optional: true },
            createValidator(z.number().int().min(0).max(100).nullable()),
        );

        this.mount(
            'approvalStatus',
            { optional: true },
            createValidator(z.enum(AnalysisNodeApprovalStatus).nullable()),
        );

        this.mount(
            'comment',
            { optional: true },
            createValidator(z.string().nullable()),
        );
    }
}
