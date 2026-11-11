/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { AnalysisStorageTokenValidator } from '../../src';

describe('AnalysisStorageTokenValidator', () => {
    const validator = new AnalysisStorageTokenValidator();

    it('accepts a cap list', async () => {
        await expect(validator.run({ cap: ['bucket:B:read'] })).resolves.toEqual({ cap: ['bucket:B:read'] });
        await expect(validator.run({ cap: ['bucket:B:read'], lifetime: 3600 })).resolves.toBeDefined();
    });

    it.each([
        { cap: [] },
        { cap: Array.from({ length: 33 }, (_, i) => `bucket:${i}:read`) },
        { cap: ['bucket:B:read'], lifetime: 0 },
        { cap: ['bucket:B:read'], lifetime: 3601 },
        { cap: ['bucket:B:read'], lifetime: 1.5 },
    ])('rejects %#', async (input) => {
        await expect(validator.run(input)).rejects.toBeDefined();
    });
});
