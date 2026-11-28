/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeComponent, NodeComponentReport } from '@privateaim/core-kit';

export function mergeNodeComponent(
    stored: NodeComponent | undefined,
    report: NodeComponentReport,
    reportedAt: string,
): Partial<NodeComponent> {
    return {
        status: report.status,
        version: report.version ?? stored?.version ?? null,
        message: report.message ?? null,
        uptime: report.uptime ?? stored?.uptime ?? null,
        latency: report.latency ?? stored?.latency ?? null,
        checksTotal: report.checksTotal ?? stored?.checksTotal ?? null,
        checksSuccessful: report.checksSuccessful ?? stored?.checksSuccessful ?? null,
        reportedAt,
    };
}
