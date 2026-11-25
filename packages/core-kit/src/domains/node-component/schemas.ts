/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { z } from 'zod';
import { NODE_COMPONENT_INTEGER_MAX, NODE_COMPONENT_NAME_PATTERN, NodeComponentStatus } from './constants.ts';

export const reportShape = {
    status: z.enum(NodeComponentStatus),
    version: z.string().min(1).max(64).nullish(),
    message: z.string().max(1024).nullish(),
    uptime: z.number().int().min(0).max(NODE_COMPONENT_INTEGER_MAX).nullish(),
};

export const probeReportSchema = z.object({
    ...reportShape,
    name: z.string().min(1).max(64).regex(NODE_COMPONENT_NAME_PATTERN),
    latency: z.number().min(0).nullish(),
    checksTotal: z.number().int().min(0).max(NODE_COMPONENT_INTEGER_MAX).nullish(),
    checksSuccessful: z.number().int().min(0).max(NODE_COMPONENT_INTEGER_MAX).nullish(),
}).strict().refine(
    (c) => c.checksTotal == null || c.checksSuccessful == null || c.checksSuccessful <= c.checksTotal,
    { message: 'checksSuccessful must not exceed checksTotal', path: ['checksSuccessful'] },
);
