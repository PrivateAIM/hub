/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@privateaim/errors';
import { Container } from 'validup';
import { createValidator } from '@validup/adapter-zod';
import { z } from 'zod';
import type { Analysis } from './entity.ts';
import { ValidatorGroup } from '@privateaim/kit';
import { ImageAttributeCommandArgumentsValidator } from './validator-image-command-argument.ts';

export class AnalysisValidator extends Container<Analysis> {
    protected initialize() {
        super.initialize();

        this.mount(
            'project_id',
            { group: ValidatorGroup.CREATE },
            createValidator(z.uuid()),
        );

        this.mount(
            'name',
            { optional: true },
            createValidator(z.string().min(3).max(128).nullable()),
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

        this.mount(
            'registry_id',
            { optional: true },
            createValidator(z.uuid().nullable()),
        );

        const commandArgumentValidator = new ImageAttributeCommandArgumentsValidator();
        // image_command_executable
        this.mount('image_command_arguments', { optional: true }, (ctx) => {
            if (ctx.value == null) {
                return ctx.value;
            }

            if (!Array.isArray(ctx.value)) {
                throw new BadRequestError('image_command_arguments must be an array.');
            }

            const promises = ctx.value.map((child) => commandArgumentValidator.run(child, {
                group: ctx.group,
                flat: false,
                path: ctx.path,
            }));

            return Promise.all(promises);
        });
    }
}
