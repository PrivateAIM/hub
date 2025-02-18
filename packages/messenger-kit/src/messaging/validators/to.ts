/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { z } from 'zod';
import { createValidator } from '@validup/adapter-zod';
import { Container } from 'validup';
import type { CTSMessagingParty } from '../types';

export class CTSMessagingPartyValidator extends Container<CTSMessagingParty> {
    protected initialize() {
        super.initialize();

        this.mount(
            'id',
            createValidator(
                z.string().uuid(),
            ),
        );

        this.mount(
            'type',
            createValidator(
                z.enum(['user', 'robot', 'client']),
            ),
        );
    }
}
