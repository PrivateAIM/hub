/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName } from '@privateaim/kit';
import { AnalysisCommand } from '../constants';

/**
 * The permission an analysis command requires. Shared by server-core, which
 * enforces it, and client-vue, which decides whether to offer the command —
 * one definition, so the UI cannot show a command the server refuses.
 */
export function getAnalysisCommandPermissionName(
    command: `${AnalysisCommand}`,
): PermissionName.ANALYSIS_EXECUTION_START | PermissionName.ANALYSIS_UPDATE {
    if (
        command === AnalysisCommand.BUILD_START ||
        command === AnalysisCommand.DISTRIBUTION_START
    ) {
        return PermissionName.ANALYSIS_EXECUTION_START;
    }

    return PermissionName.ANALYSIS_UPDATE;
}
