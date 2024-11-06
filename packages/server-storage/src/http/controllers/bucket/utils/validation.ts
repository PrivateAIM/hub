/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HTTPHandlerOperation } from '@privateaim/server-http-kit';
import { createValidator } from '@validup/adapter-validator';
import { Container } from 'validup';
import type { BucketEntity } from '../../../../domains';

export class BucketValidator extends Container<BucketEntity> {
    protected initialize() {
        super.initialize();

        this.mount(
            'name',
            { group: HTTPHandlerOperation.CREATE },
            createValidator(
                (chain) => chain.isLength({ min: 3, max: 256 }),
            ),
        );

        this.mount(
            'region',
            { group: HTTPHandlerOperation.CREATE, optional: true },
            createValidator(
                (chain) => chain
                    .isLength({ min: 3, max: 256 })
                    .optional({ values: 'null' }),
            ),
        );
    }
}
