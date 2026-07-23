/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from './entity.ts';
import { RegistryProjectType } from './constants.ts';
import { Container } from 'validup';
import { createValidator } from '@validup/zod';
import { z } from 'zod';
import { ValidatorGroup } from '@privateaim/kit';

export class RegistryProjectValidator extends Container<RegistryProject> {
    protected override initialize() {
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

        // max(64) matches the varchar(64) column — anything longer used to
        // pass validation and blow up in the database instead; min(3)
        // mirrors the pre-migration form rule.
        const externalNameValidator = createValidator(z.string().min(3).max(64).regex(/^[a-z0-9-_]*$/));
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
