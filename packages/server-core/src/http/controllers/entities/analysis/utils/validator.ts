/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import { createValidationChain, createValidator } from '@validup/adapter-validator';
import type { Analysis } from '@privateaim/core-kit';
import { HTTPHandlerOperation } from '@privateaim/server-http-kit';
import { ImageAttributeCommandArgumentsValidator } from './validator-image-command-argument.ts';

export class AnalysisValidator extends Container<Analysis> {
    protected initialize() {
        super.initialize();

        this.mount(
            'project_id',
            { group: HTTPHandlerOperation.CREATE },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .exists()
                    .notEmpty()
                    .isUUID();
            }),
        );

        this.mount(
            'name',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .isString()
                    .isLength({ min: 3, max: 128 })
                    .optional({ values: 'null' });
            }),
        );

        this.mount(
            'description',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .isString()
                    .isLength({ min: 5, max: 4096 })
                    .optional({ values: 'null' });
            }),
        );

        this.mount(
            'master_image_id',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .isUUID()
                    .optional({ values: 'null' });
            }),
        );

        this.mount(
            'registry_id',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .isUUID()
                    .optional({ values: 'null' });
            }),
        );

        const commandArgumentValidator = new ImageAttributeCommandArgumentsValidator();
        // image_command_executable
        this.mount('image_command_arguments', { optional: true }, (ctx) => {
            if (!Array.isArray(ctx.value)) {
                // todo: throw error
                return undefined;
            }

            const promises = ctx.value.map((child) => commandArgumentValidator.run(child, {
                group: ctx.group,
                flat: false,
                path: ctx.pathAbsolute,
            }));

            return Promise.all(promises);
        });
    }
}
