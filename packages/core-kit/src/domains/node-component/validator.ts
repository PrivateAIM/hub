/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/zod';
import { z } from 'zod';
import { TypedContainer } from '@privateaim/kit';
import { reportShape } from './schemas.ts';
import type { NodeComponentProbeReport, NodeComponentReport } from './types.ts';

// probe keys are mounted only to be rejected
type ComponentReportInput = NodeComponentReport & Pick<NodeComponentProbeReport, 'latency' | 'checksTotal' | 'checksSuccessful'>;

export class NodeComponentReportValidator extends TypedContainer<ComponentReportInput> {
    protected override initialize() {
        super.initialize();

        this.mount('status', createValidator(reportShape.status));
        this.mount('version', { optional: true }, createValidator(reportShape.version));
        this.mount('message', { optional: true }, createValidator(reportShape.message));
        this.mount('uptime', { optional: true }, createValidator(reportShape.uptime));

        // probe fields are measured by the node's adapter and sent in a snapshot, never on a component report
        for (const key of ['latency', 'checksTotal', 'checksSuccessful'] as const) {
            this.mount(
                key,
                { optional: true },
                createValidator(z.never({ error: 'probe fields are not accepted on a component report' })),
            );
        }
    }
}
