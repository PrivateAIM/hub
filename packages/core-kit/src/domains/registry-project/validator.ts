/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from './entity.ts';
import { RegistryProjectType } from './constants.ts';
import { Container } from 'validup';
import { createValidator } from '@validup/adapter-zod';
import { z } from 'zod';
import { ValidatorGroup } from '@privateaim/kit';

export class RegistryProjectValidator extends Container<RegistryProject> {
    protected initialize() {
        super.initialize();

        this.mount(
            'registry_id',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        const nameValidator = createValidator(z.string().min(5).max(128));
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

        const externalNameValidator = createValidator(z.string().min(1).max(255).regex(/^[a-z0-9-_]*$/));
        this.mount(
            'external_name',
            { group: ValidatorGroup.CREATE },
            externalNameValidator,
        );

        this.mount(
            'external_name',
            { group: ValidatorGroup.UPDATE, optional: true },
            externalNameValidator,
        );

        this.mount(
            'type',
            { group: ValidatorGroup.CREATE },
            createValidator(z.enum(RegistryProjectType)),
        );
    }
}
