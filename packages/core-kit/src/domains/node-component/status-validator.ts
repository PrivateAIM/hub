/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/zod';
import { z } from 'zod';
import { TypedContainer } from '@privateaim/kit';
import { NODE_STATUS_REPORT_COMPONENTS_MAX } from './constants.ts';
import { probeReportSchema } from './schemas.ts';
import type { NodeStatusReport } from './types.ts';

export class NodeStatusReportValidator extends TypedContainer<NodeStatusReport> {
    protected override initialize() {
        super.initialize();

        this.mount(
            'deployment',
            { optional: true },
            createValidator(z.object({
                name: z.string().min(1).max(64),
                version: z.string().min(1).max(64),
            }).strict()),
        );

        this.mount(
            'components',
            createValidator(
                z.array(probeReportSchema)
                    .min(1)
                    .max(NODE_STATUS_REPORT_COMPONENTS_MAX)
                    .refine(
                        (list) => new Set(list.map((c) => c.name)).size === list.length,
                        { message: 'component names must be unique' },
                    ),
            ),
        );
    }
}
