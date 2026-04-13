/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from '@privateaim/core-kit';
import { RegistryProjectType } from '@privateaim/core-kit';
import { Container } from 'validup';
import { createValidationChain, createValidator } from '@validup/adapter-validator';
import { HTTPHandlerOperation } from '@privateaim/server-http-kit';

export class RegistryProjectValidator extends Container<RegistryProject> {
    protected initialize() {
        super.initialize();

        this.mount(
            'registry_id',
            { group: HTTPHandlerOperation.CREATE },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .exists()
                    .notEmpty()
                    .isUUID();
            }),
        );

        const nameValidator = createValidator(() => {
            const chain = createValidationChain();
            return chain
                .exists()
                .isLength({ min: 5, max: 128 });
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

        const externalNameValidator = createValidator(() => {
            const chain = createValidationChain();
            return chain
                .isLength({ min: 1, max: 255 })
                .exists()
                .matches(/^[a-z0-9-_]*$/);
        });
        this.mount(
            'external_name',
            { group: HTTPHandlerOperation.CREATE },
            externalNameValidator,
        );

        this.mount(
            'external_name',
            { group: HTTPHandlerOperation.UPDATE, optional: true },
            externalNameValidator,
        );

        this.mount(
            'type',
            { group: HTTPHandlerOperation.CREATE },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .exists()
                    .isIn(Object.values(RegistryProjectType));
            }),
        );
    }
}
