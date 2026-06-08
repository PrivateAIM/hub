/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from './entity.ts';
import { NodeType } from './constants.ts';
import { Container } from 'validup';
import { createValidator } from '@validup/zod';
import { z } from 'zod';
import { ValidatorGroup } from '@privateaim/kit';

export class NodeValidator extends Container<Node> {
    protected initialize() {
        super.initialize();

        this.mount(
            'name',
            { group: ValidatorGroup.CREATE },
            createValidator(z.string().min(3).max(128)),
        );

        this.mount(
            'name',
            { group: ValidatorGroup.UPDATE, optional: true },
            createValidator(z.string().min(3).max(128).nullable()),
        );

        this.mount(
            'type',
            { optional: true },
            createValidator(z.enum(NodeType).nullable()),
        );

        this.mount(
            'hidden',
            { optional: true },
            createValidator(z.boolean().nullable()),
        );

        this.mount(
            'public_key',
            { optional: true },
            createValidator(z.string().min(5).max(4096).nullable()),
        );

        this.mount(
            'external_name',
            { optional: true },
            createValidator(z.string().min(1).max(64).regex(/^[a-z0-9-_]*$/).nullable()),
        );

        this.mount(
            'registry_id',
            { optional: true },
            createValidator(z.uuid().nullable()),
        );

        this.mount(
            'client_id',
            { optional: true },
            createValidator(z.uuid().nullable()),
        );

        this.mount(
            'realm_id',
            { group: ValidatorGroup.CREATE, optional: true },
            createValidator(z.uuid().nullable()),
        );
    }
}
