/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import type { AnalysisBucketFile } from './entity.ts';
import { createValidator } from '@validup/adapter-zod';
import { z } from 'zod';
import { ValidatorGroup } from '@privateaim/kit';

export class AnalysisBucketFileValidator extends Container<AnalysisBucketFile> {
    protected initialize() {
        super.initialize();

        this.mount(
            'analysis_bucket_id',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        const pathValidator = createValidator(z.string());
        this.mount(
            'path',
            { group: ValidatorGroup.CREATE },
            pathValidator,
        );

        this.mount(
            'path',
            { group: ValidatorGroup.UPDATE, optional: true },
            pathValidator,
        );

        this.mount(
            'bucket_id',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        this.mount(
            'bucket_file_id',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        this.mount(
            'root',
            createValidator(z.boolean().optional().default(false)),
        );
    }
}
