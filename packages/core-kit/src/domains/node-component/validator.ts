/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/zod';
import { z } from 'zod';
import { TypedContainer } from '@privateaim/kit';
import { NODE_COMPONENT_NAME_PATTERN, NodeComponentStatus } from './constants.ts';
import type { NodeComponentReport } from './types.ts';

export const reportShape = {
    status: z.enum(NodeComponentStatus),
    version: z.string().min(1).max(64).nullish(),
    message: z.string().max(1024).nullish(),
    uptime: z.number().int().min(0).nullish(),
};

const strictReportSchema = z.object(reportShape).strict();

export const probeReportSchema = z.object({
    ...reportShape,
    name: z.string().min(1).max(64).regex(NODE_COMPONENT_NAME_PATTERN),
    latency: z.number().min(0).nullish(),
    checksTotal: z.number().int().min(0).nullish(),
    checksSuccessful: z.number().int().min(0).nullish(),
}).strict().refine(
    (c) => c.checksTotal == null || c.checksSuccessful == null || c.checksSuccessful <= c.checksTotal,
    { message: 'checksSuccessful must not exceed checksTotal', path: ['checksSuccessful'] },
);

export class NodeComponentReportValidator extends TypedContainer<NodeComponentReport> {
    protected override initialize() {
        super.initialize();

        this.mount('status', createValidator(reportShape.status));
        this.mount('version', { optional: true }, createValidator(reportShape.version));
        this.mount('message', { optional: true }, createValidator(reportShape.message));
        this.mount('uptime', { optional: true }, createValidator(reportShape.uptime));
    }

    // Mounted keys ignore unknown input keys; the strict schema rejects them (e.g. probe fields).
    override async run(...args: Parameters<TypedContainer<NodeComponentReport>['run']>) {
        strictReportSchema.parse(args[0]);

        return super.run(...args);
    }
}
