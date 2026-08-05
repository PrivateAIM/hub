/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/zod';
import { z } from 'zod';
import { TypedContainer, ValidatorGroup } from '@privateaim/kit';
import type { Registry } from './entity.ts';

export class RegistryValidator extends TypedContainer<Registry> {
    protected override initialize() {
        super.initialize();

        const nameValidator = createValidator(z.string().min(3).max(128));

        this.mount(
            'name',
            { group: ValidatorGroup.CREATE },
            nameValidator,
        );

        this.mount(
            'name',
            { group: ValidatorGroup.UPDATE, optional: true },
            nameValidator,
        );

        const hostValidator = createValidator(z.string().min(3).max(512));
        this.mount(
            'host',
            { group: ValidatorGroup.CREATE },
            hostValidator,
        );

        this.mount(
            'host',
            { group: ValidatorGroup.UPDATE, optional: true },
            hostValidator,
        );

        this.mount(
            'accountName',
            { optional: true },
            createValidator(z.string().min(3).max(256).nullable()),
        );

        this.mount(
            'accountSecret',
            { optional: true },
            createValidator(z.string().min(3).max(256).nullable()),
        );
    }
}
