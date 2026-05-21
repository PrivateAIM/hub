/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { humanFileSize } from '../../../src/utils/file-size';

describe('humanFileSize', () => {
    describe('null/undefined/invalid input', () => {
        it('returns empty string for null', () => {
            expect(humanFileSize(null)).toBe('');
        });

        it('returns empty string for undefined', () => {
            expect(humanFileSize(undefined)).toBe('');
        });

        it('returns empty string for a non-numeric string', () => {
            expect(humanFileSize('not-a-number')).toBe('');
        });

        it('returns empty string for an empty string', () => {
            expect(humanFileSize('')).toBe('');
        });

        it('returns empty string for whitespace-only string', () => {
            expect(humanFileSize('   ')).toBe('');
        });

        it('returns empty string for NaN', () => {
            expect(humanFileSize(Number.NaN)).toBe('');
        });

        it('returns empty string for Infinity', () => {
            expect(humanFileSize(Number.POSITIVE_INFINITY)).toBe('');
        });
    });

    describe('number input (binary units, default)', () => {
        it('returns bytes when under threshold', () => {
            expect(humanFileSize(0)).toBe('0 B');
            expect(humanFileSize(512)).toBe('512 B');
            expect(humanFileSize(1023)).toBe('1023 B');
        });

        it('returns KiB at 1024 bytes', () => {
            expect(humanFileSize(1024)).toBe('1.0 KiB');
        });

        it('returns MiB at 1024^2 bytes', () => {
            expect(humanFileSize(1024 * 1024)).toBe('1.0 MiB');
        });

        it('returns GiB at 1024^3 bytes', () => {
            expect(humanFileSize(1024 ** 3)).toBe('1.0 GiB');
        });

        it('rounds to the requested decimal places', () => {
            expect(humanFileSize(1536, false, 1)).toBe('1.5 KiB');
            expect(humanFileSize(1536, false, 2)).toBe('1.50 KiB');
            expect(humanFileSize(1536, false, 0)).toBe('2 KiB');
        });

        it('handles negative values', () => {
            expect(humanFileSize(-2048)).toBe('-2.0 KiB');
        });
    });

    describe('number input (SI units)', () => {
        it('returns kB at 1000 bytes when si=true', () => {
            expect(humanFileSize(1000, true)).toBe('1.0 kB');
        });

        it('returns GB at 1e9 bytes when si=true', () => {
            expect(humanFileSize(1_000_000_000, true)).toBe('1.0 GB');
        });
    });

    describe('string input (stringified bigint)', () => {
        it('parses a small numeric string', () => {
            expect(humanFileSize('2048')).toBe('2.0 KiB');
        });

        it('parses the issue #1507 overflow value (~13 GB)', () => {
            // 13_039_739_469 bytes — what triggered the original int overflow
            expect(humanFileSize('13039739469')).toBe('12.1 GiB');
        });

        it('parses values up to Number.MAX_SAFE_INTEGER', () => {
            // 9_007_199_254_740_991 bytes ≈ 8 PiB — upper end of safe integer
            const safeMax = String(Number.MAX_SAFE_INTEGER);
            expect(humanFileSize(safeMax)).toBe('8.0 PiB');
        });
    });

    describe('bigint input', () => {
        it('formats a small bigint', () => {
            expect(humanFileSize(2048n)).toBe('2.0 KiB');
        });

        it('formats a bigint at the issue #1507 value', () => {
            expect(humanFileSize(13_039_739_469n)).toBe('12.1 GiB');
        });

        it('formats a bigint beyond MAX_SAFE_INTEGER (lossy but reasonable)', () => {
            // Above MAX_SAFE_INTEGER, Number() loses precision but the label
            // (in PiB/EiB) is still meaningful for human display.
            const huge = BigInt(Number.MAX_SAFE_INTEGER) * 4n;
            expect(humanFileSize(huge)).toBe('32.0 PiB');
        });
    });
});
