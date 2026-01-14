/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import { createValidationChain, createValidator } from '@validup/adapter-validator';
import { HTTPHandlerOperation } from '@privateaim/server-http-kit';
import type { Registry } from '@privateaim/core-kit';

export class RegistryValidator extends Container<Registry> {
    protected initialize() {
        super.initialize();

        const nameValidator = createValidator(() => {
            const chain = createValidationChain();
            return chain
                .exists()
                .isLength({ min: 3, max: 128 });
        });

        this.mount(
            'name',
            { group: HTTPHandlerOperation.CREATE },
            nameValidator,
        );

        this.mount(
            'name',
            { group: HTTPHandlerOperation.UPDATE, optional: true },
            nameValidator,
        );

        const hostValidator = createValidator(() => {
            const chain = createValidationChain();
            return chain
                .exists()
                .isString()
                .isLength({ min: 3, max: 512 });
        });
        this.mount(
            'host',
            { group: HTTPHandlerOperation.CREATE },
            hostValidator,
        );

        this.mount(
            'host',
            { group: HTTPHandlerOperation.UPDATE, optional: true },
            hostValidator,
        );

        this.mount(
            'account_name',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .exists()
                    .isLength({ min: 3, max: 256 })
                    .optional({ nullable: true });
            }),
        );

        this.mount(
            'account_secret',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .exists()
                    .isLength({ min: 3, max: 256 })
                    .optional({ nullable: true });
            }),
        );
    }
}
