/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/zod';
import { z } from 'zod';
import { CAPABILITY_MAX_ENTRIES, TypedContainer } from '@privateaim/kit';
import type { AnalysisStorageTokenCreatePayload } from './types.ts';

export class AnalysisStorageTokenValidator extends TypedContainer<AnalysisStorageTokenCreatePayload> {
    protected override initialize() {
        super.initialize();

        this.mount(
            'cap',
            createValidator(z.array(z.string()).min(1).max(CAPABILITY_MAX_ENTRIES)),
        );

        this.mount(
            'lifetime',
            { optional: true },
            createValidator(z.number().int().min(1).max(3600)),
        );
    }
}
