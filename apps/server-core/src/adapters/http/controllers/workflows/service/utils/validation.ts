/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RegistryAPICommand } from '@privateaim/core-kit';
import { createValidator } from '@validup/adapter-zod';
import { Container } from 'validup';
import { z } from 'zod';

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
            createValidator(z.uuid()),
        );

        this.mount(
            'command',
            createValidator(z.nativeEnum(RegistryAPICommand)),
        );

        this.mount(
            'secret',
            { optional: true },
            createValidator(
                z.string()
                    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/)
                    .nullable(),
            ),
        );
    }
}
