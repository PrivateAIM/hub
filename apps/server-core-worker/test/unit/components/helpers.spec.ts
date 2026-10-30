/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS, ANALYSIS_PROCESS_HEARTBEAT_MAX_SILENCE_MS } from '../../../src/app/components/constants';
import { startHeartbeat } from '../../../src/app/components/helpers';

describe('startHeartbeat', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should beat on the interval until stopped', async () => {
        let beats = 0;
        const { stop } = startHeartbeat(async () => {
            beats++;
        });

        await vi.advanceTimersByTimeAsync(ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS - 1);
        expect(beats).toBe(0);

        await vi.advanceTimersByTimeAsync(1);
        expect(beats).toBe(1);

        await vi.advanceTimersByTimeAsync(ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS);
        expect(beats).toBe(2);

        stop();
        await vi.advanceTimersByTimeAsync(ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS * 3);
        expect(beats).toBe(2);
    });

    it('should keep beating after a failed beat', async () => {
        let beats = 0;
        const { stop } = startHeartbeat(async () => {
            beats++;

            throw new Error('bus down');
        });

        await vi.advanceTimersByTimeAsync(ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS * 2);
        expect(beats).toBe(2);

        stop();
    });

    it('should stop beating after the max silence, until touched again', async () => {
        let beats = 0;
        const heartbeat = startHeartbeat(async () => {
            beats++;
        });

        const perSilence = Math.floor(ANALYSIS_PROCESS_HEARTBEAT_MAX_SILENCE_MS / ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS);

        await vi.advanceTimersByTimeAsync(ANALYSIS_PROCESS_HEARTBEAT_MAX_SILENCE_MS * 2);
        expect(beats).toBe(perSilence);

        heartbeat.touch();
        await vi.advanceTimersByTimeAsync(ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS);
        expect(beats).toBe(perSilence + 1);

        heartbeat.stop();
    });

    it('should stay below the server-core stale threshold', () => {
        // server-core's ANALYSIS_PROCESS_STALE_THRESHOLD_MS (15 min); not
        // imported, the worker does not depend on server-core.
        expect(ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS * 2).toBeLessThan(15 * 60 * 1000);
    });
});
