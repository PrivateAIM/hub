/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile } from './entity.ts';
import { createValidator } from '@validup/zod';
import { z } from 'zod';
import { TypedContainer, ValidatorGroup } from '@privateaim/kit';

export class AnalysisBucketFileValidator extends TypedContainer<AnalysisBucketFile> {
    protected override initialize() {
        super.initialize();

        this.mount(
            'analysisBucketId',
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
            'bucketId',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        this.mount(
            'bucketFileId',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        this.mount(
            'root',
            { optional: true },
            createValidator(z.boolean().optional().default(false)),
        );
    }
}
