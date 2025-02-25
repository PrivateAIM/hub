/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import { createValidator } from '@validup/adapter-zod';
import { z } from 'zod';
import type { MasterImageCommandArgument } from '@privateaim/core-kit';

export class ImageAttributeCommandArgumentsValidator extends Container<MasterImageCommandArgument> {
    protected initialize() {
        super.initialize();

        this.mount(
            'value',
            createValidator(
                z.string()
                    .min(2)
                    .max(512),
            ),
        );

        this.mount(
            'position',
            { optional: true },
            createValidator(
                z.literal('before')
                    .or(z.literal('after'))
                    .or(z.null())
                    .or(z.undefined())
                    .optional(),
            ),
        );
    }
}
