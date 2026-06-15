/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNode } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';

export function getAnalysisNodeExecutionProgress(item: AnalysisNode): number {
    if (item.execution_status === ProcessStatus.EXECUTED) {
        return 100;
    }

    return item.execution_progress || 0;
}

export function getAnalysisNodeExecutionProgressColor(item: AnalysisNode): string {
    switch (item.execution_status) {
        case ProcessStatus.EXECUTED:
            return 'bg-success-600';
        case ProcessStatus.FAILED:
            return 'bg-error-600';
        case ProcessStatus.STOPPED:
        case ProcessStatus.STOPPING:
            return 'bg-warning-500';
        default:
            return 'bg-primary-600';
    }
}
