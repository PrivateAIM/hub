/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName } from '@privateaim/kit';
import { describe, expect, it } from 'vitest';
import { AnalysisCommand } from '../../src/domains/analysis/constants';
import { getAnalysisCommandPermissionName } from '../../src/domains/analysis/helpers';

describe('getAnalysisCommandPermissionName', () => {
    it.each([AnalysisCommand.BUILD_START, AnalysisCommand.DISTRIBUTION_START])('should require analysis_execution_start for %s', (command) => {
        expect(getAnalysisCommandPermissionName(command)).toEqual(PermissionName.ANALYSIS_EXECUTION_START);
    });

    it.each([
        AnalysisCommand.BUILD_CHECK,
        AnalysisCommand.DISTRIBUTION_CHECK,
        AnalysisCommand.CONFIGURATION_LOCK,
        AnalysisCommand.CONFIGURATION_UNLOCK,
        AnalysisCommand.STORAGE_CHECK,
    ])('should require analysis_update for %s', (command) => {
        expect(getAnalysisCommandPermissionName(command)).toEqual(PermissionName.ANALYSIS_UPDATE);
    });
});
