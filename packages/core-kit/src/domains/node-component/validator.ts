/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/zod';
import { z } from 'zod';
import { TypedContainer } from '@privateaim/kit';
import { NODE_COMPONENT_INTEGER_MAX, NODE_COMPONENT_NAME_PATTERN, NodeComponentStatus } from './constants.ts';
import type { NodeComponentReport } from './types.ts';

const count = () => z.number().int().min(0).max(NODE_COMPONENT_INTEGER_MAX).nullish();

export class NodeComponentReportValidator extends TypedContainer<NodeComponentReport> {
    protected override initialize() {
        super.initialize();

        this.mount('name', createValidator(z.string().min(1).max(64).regex(NODE_COMPONENT_NAME_PATTERN)));
        this.mount('status', createValidator(z.enum(NodeComponentStatus)));
        this.mount('version', { optional: true }, createValidator(z.string().min(1).max(64).nullish()));
        this.mount('message', { optional: true }, createValidator(z.string().max(1024).nullish()));
        this.mount('latency', { optional: true }, createValidator(z.number().min(0).nullish()));
        this.mount('uptime', { optional: true }, createValidator(count()));
        this.mount('checksTotal', { optional: true }, createValidator(count()));
        this.mount('checksSuccessful', { optional: true }, createValidator((ctx) => count().refine(
            (value) => value == null || ctx.data.checksTotal == null || value <= ctx.data.checksTotal,
            { message: 'checksSuccessful must not exceed checksTotal' },
        )));
    }
}
