/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/adapter-zod';
import zod from 'zod';
import { Container } from 'validup';
import type { Bucket } from '@privateaim/storage-kit';
import { ValidatorGroup } from '@privateaim/server-kit';

export class BucketValidator extends Container<Partial<Bucket>> {
    protected initialize() {
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
            'realm_id',
            { group: ValidatorGroup.CREATE, optional: true },
            createValidator(
                zod.string()
                    .uuid()
                    .nullable(),
            ),
        );
    }
}
