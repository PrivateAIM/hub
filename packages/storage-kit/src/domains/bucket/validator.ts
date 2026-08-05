/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/zod';
import zod from 'zod';
import type { Bucket } from './entity.ts';
import { TypedContainer, ValidatorGroup } from '@privateaim/kit';

export class BucketValidator extends TypedContainer<Partial<Bucket>> {
    protected override initialize() {
        super.initialize();

        this.mount(
            'name',
            { group: ValidatorGroup.CREATE },
            createValidator(
                zod.string()
                    .min(3)
                    .max(256),
            ),
        );

        this.mount(
            'region',
            { group: ValidatorGroup.CREATE, optional: true },
            createValidator(
                zod.string()
                    .min(3)
                    .max(256)
                    .nullable(),
            ),
        );

        this.mount(
            'realmId',
            { group: ValidatorGroup.CREATE, optional: true },
            createValidator(
                zod.string()
                    .uuid()
                    .nullable(),
            ),
        );
    }
}
