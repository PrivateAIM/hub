/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RegistryAPICommand } from '@privateaim/core-kit';
import { createValidationChain, createValidator } from '@validup/adapter-validator';
import { Container } from 'validup';

type ValidationResult = {
    id: string,
    command: `${RegistryAPICommand}`,
    secret?: string
};

export class ServiceRegistryValidator extends Container<ValidationResult> {
    protected initialize() {
        super.initialize();

        this.mount(
            'id',
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .isUUID();
            }),
        );

        this.mount(
            'command',
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .isString()
                    .custom((value) => Object.values(RegistryAPICommand).includes(value));
            }),
        );

        this.mount(
            'secret',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/)
                    .optional({ nullable: true });
            }),
        );
    }
}
