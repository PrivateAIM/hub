/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/zod';
import { z } from 'zod';
import { TypedContainer } from '@privateaim/kit';
import { NODE_COMPONENTS_REPORT_MAX } from './constants.ts';
import type { NodeComponentsReport } from './types.ts';
import { NodeComponentReportValidator } from './validator.ts';

export class NodeComponentsReportValidator extends TypedContainer<NodeComponentsReport> {
    protected override initialize() {
        super.initialize();

        this.mount('deployment', { optional: true }, createValidator(z.object({
            name: z.string().min(1).max(64),
            version: z.string().min(1).max(64),
        })));

        this.mount('components', createValidator(
            z.array(z.object({ name: z.unknown() }))
                .min(1)
                .max(NODE_COMPONENTS_REPORT_MAX)
                .refine(
                    (list) => new Set(list.map((c) => c.name)).size === list.length,
                    { message: 'component names must be unique' },
                ),
        ));

        this.mount('components.*', new NodeComponentReportValidator());
    }
}
