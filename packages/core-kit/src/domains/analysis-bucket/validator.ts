/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from './entity.ts';
import { AnalysisBucketType } from './constants.ts';
import { Container } from 'validup';
import { createValidator } from '@validup/zod';
import { z } from 'zod';
import { ValidatorGroup } from '@privateaim/kit';

export class AnalysisBucketValidator extends Container<AnalysisBucket> {
    protected initialize() {
        super.initialize();

        this.mount(
            'analysis_id',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        this.mount(
            'bucket_id',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        this.mount(
            'type',
            { group: ValidatorGroup.CREATE },
            createValidator(z.enum(AnalysisBucketType)),
        );
    }
}
