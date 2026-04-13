/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import { createValidationChain, createValidator } from '@validup/adapter-validator';
import { HTTPHandlerOperation } from '@privateaim/server-http-kit';
import type { Project } from '@privateaim/core-kit';

export class ProjectValidator extends Container<Project> {
    protected initialize() {
        super.initialize();

        const nameValidator = createValidator(() => {
            const chain = createValidationChain();
            return chain
                .exists()
                .isLength({ min: 5, max: 100 });
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
                    .optional({ nullable: true });
            }),
        );
    }
}
