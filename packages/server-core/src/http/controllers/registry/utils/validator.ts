/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import { createValidator } from '@validup/adapter-validator';
import type { RegistryEntity } from '../../../../domains';
import { HTTPHandlerOperation } from '../../constants';

export class RegistryValidator extends Container<RegistryEntity> {
    protected initialize() {
        super.initialize();

        this.mount(
            'name',
            { group: HTTPHandlerOperation.CREATE },
            createValidator((chain) => chain
                .exists()
                .isLength({ min: 3, max: 128 })),
        );

        this.mount(
            'name',
            { group: HTTPHandlerOperation.UPDATE, optional: true },
            createValidator((chain) => chain
                .exists()
                .isLength({ min: 3, max: 128 })
                .optional({ values: 'null' })),
        );

        this.mount(
            'host',
            { group: HTTPHandlerOperation.CREATE },
            createValidator((chain) => chain
                .exists()
                .isString()
                .isLength({ min: 3, max: 512 })),
        );

        this.mount(
            'host',
            { group: HTTPHandlerOperation.CREATE, optional: true },
            createValidator((chain) => chain
                .exists()
                .isString()
                .isLength({ min: 3, max: 512 })
                .optional({ values: 'null' })),
        );

        this.mount(
            'account_name',
            { optional: true },
            createValidator((chain) => chain
                .exists()
                .isLength({ min: 3, max: 256 })
                .optional({ nullable: true })),
        );

        this.mount(
            'account_secret',
            { optional: true },
            createValidator((chain) => chain
                .exists()
                .isLength({ min: 3, max: 256 })
                .optional({ nullable: true })),
        );
    }
}
