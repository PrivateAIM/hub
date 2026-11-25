/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeComponent, NodeComponentProbeReport, NodeComponentReport } from '@privateaim/core-kit';

function isProbeReport(
    report: NodeComponentReport | NodeComponentProbeReport,
): report is NodeComponentProbeReport {
    return 'name' in report;
}

/**
 * Merge a report into the stored row: omitted or null fields keep the stored value,
 * except message, which is always replaced together with status.
 */
export function mergeNodeComponent(
    stored: NodeComponent | undefined,
    report: NodeComponentReport | NodeComponentProbeReport,
    reportedAt: string,
): Partial<NodeComponent> {
    const probe = isProbeReport(report) ? report : undefined;

    return {
        status: report.status,
        version: report.version ?? stored?.version ?? null,
        message: report.message ?? null,
        uptime: report.uptime ?? stored?.uptime ?? null,
        latency: probe?.latency ?? stored?.latency ?? null,
        checksTotal: probe?.checksTotal ?? stored?.checksTotal ?? null,
        checksSuccessful: probe?.checksSuccessful ?? stored?.checksSuccessful ?? null,
        reportedAt,
    };
}
