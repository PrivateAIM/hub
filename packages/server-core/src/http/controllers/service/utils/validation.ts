/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RegistryAPICommand } from '@privateaim/core-kit';
import { createValidator } from '@validup/adapter-validator';
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
            createValidator((chain) => chain
                .isUUID()),
        );

        this.mount(
            'command',
            createValidator((chain) => chain
                .isString()
                .custom((value) => Object.values(RegistryAPICommand).includes(value))),
        );

        this.mount(
            'secret',
            { optional: true },
            createValidator((chain) => chain
                .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/)
                .optional({ nullable: true })),
        );
    }
}
