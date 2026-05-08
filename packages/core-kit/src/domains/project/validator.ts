/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import { createValidator } from '@validup/adapter-zod';
import { z } from 'zod';
import { ValidatorGroup } from '@privateaim/kit';
import type { Project } from './entity.ts';

export class ProjectValidator extends Container<Project> {
    protected initialize() {
        super.initialize();

        const nameValidator = createValidator(z.string().min(5).max(100));
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

        this.mount(
            'description',
            { optional: true },
            createValidator(z.string().min(5).max(4096).nullable()),
        );

        this.mount(
            'master_image_id',
            { optional: true },
            createValidator(z.uuid().nullable()),
        );
    }
}
