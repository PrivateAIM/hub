/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { ANALYSIS_PROCESS_STALE_THRESHOLD_MS } from '../../../src/app/components/constants';
import { isAnalysisProcessStale } from '../../../src/app/components/helpers';

describe('isAnalysisProcessStale', () => {
    it('should not be stale when updated within the threshold', () => {
        const updatedAt = new Date(Date.now() - 60 * 1000);

        expect(isAnalysisProcessStale(updatedAt)).toBe(false);
    });

    it('should be stale when not updated for longer than the threshold', () => {
        const updatedAt = new Date(Date.now() - ANALYSIS_PROCESS_STALE_THRESHOLD_MS - 1000);

        expect(isAnalysisProcessStale(updatedAt)).toBe(true);
    });

    it('should accept an ISO string timestamp (HTTP payloads)', () => {
        const updatedAt = new Date(Date.now() - ANALYSIS_PROCESS_STALE_THRESHOLD_MS - 1000).toISOString();

        expect(isAnalysisProcessStale(updatedAt)).toBe(true);
    });

    it('should respect a custom threshold', () => {
        const updatedAt = new Date(Date.now() - 5 * 1000);

        expect(isAnalysisProcessStale(updatedAt, 1000)).toBe(true);
        expect(isAnalysisProcessStale(updatedAt, 60 * 1000)).toBe(false);
    });

    it('should not be stale for an invalid timestamp', () => {
        expect(isAnalysisProcessStale('not-a-date')).toBe(false);
    });
});
