/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import { createValidator } from '@validup/adapter-zod';
import { z } from 'zod';
import { ValidatorGroup } from '@privateaim/kit';
import type { AnalysisPermission } from './entity.ts';

export class AnalysisPermissionValidator extends Container<AnalysisPermission> {
    protected initialize() {
        super.initialize();

        this.mount(
            'permission_id',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        this.mount(
            'analysis_id',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        this.mount(
            'policy_id',
            { optional: true },
            createValidator(z.uuid().nullable()),
        );
    }
}
