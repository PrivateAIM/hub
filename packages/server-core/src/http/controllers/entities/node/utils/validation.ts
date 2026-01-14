/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '@privateaim/core-kit';
import { NodeType } from '@privateaim/core-kit';
import { Container } from 'validup';
import { createValidationChain, createValidator } from '@validup/adapter-validator';
import { HTTPHandlerOperation } from '@privateaim/server-http-kit';

export class NodeValidator extends Container<Node> {
    protected initialize() {
        super.initialize();

        this.mount(
            'name',
            { group: HTTPHandlerOperation.CREATE },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .isLength({ min: 3, max: 128 })
                    .exists()
                    .notEmpty();
            }),
        );

        this.mount(
            'name',
            { group: HTTPHandlerOperation.UPDATE, optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .isLength({ min: 3, max: 128 })
                    .optional({ values: 'null' });
            }),
        );

        this.mount(
            'type',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();

                return chain
                    .isIn(Object.values(NodeType))
                    .optional({ values: 'null' });
            }),
        );

        this.mount(
            'hidden',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .isBoolean()
                    .optional({ values: 'null' });
            }),
        );

        this.mount(
            'public_key',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .isLength({ min: 5, max: 4096 })
                    .exists()
                    .optional({ values: 'null' });
            }),
        );

        this.mount(
            'external_name',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .isLength({ min: 1, max: 64 })
                    .exists()
                    .matches(/^[a-z0-9-_]*$/)
                    .optional({ nullable: true });
            }),
        );

        this.mount(
            'registry_id',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .isUUID()
                    .optional({ nullable: true });
            }),
        );

        this.mount(
            'client_id',
            { optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .isUUID()
                    .optional({ nullable: true });
            }),
        );

        this.mount(
            'realm_id',
            { group: HTTPHandlerOperation.CREATE, optional: true },
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .exists()
                    .isUUID()
                    .optional({ nullable: true });
            }),
        );
    }
}
