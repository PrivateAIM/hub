/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { TypedContainer } from '@privateaim/kit';
import { createValidator } from '@validup/zod';
import { z } from 'zod';
import type { DockenGroupAttributes } from '../types';

export class DockenGroupAttributesValidator extends TypedContainer<DockenGroupAttributes> {
    protected initialize() {
        super.initialize();

        this.mount(
            'name',
            createValidator(
                z.string()
                    .min(1)
                    .max(128)
                    .or(z.null())
                    .or(z.undefined())
                    .optional(),
            ),
        );
    }
}
