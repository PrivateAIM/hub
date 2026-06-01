/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { generateAnalysisName, slugify } from '../../../../../src/core/entities/analysis/generate-name.ts';

describe('slugify', () => {
    it('should lowercase and hyphenate non-alphanumeric runs', () => {
        expect(slugify('My Analysis')).toBe('my-analysis');
        expect(slugify('  Hello   World!! ')).toBe('hello-world');
        expect(slugify('already-slug')).toBe('already-slug');
    });
});

describe('generateAnalysisName', () => {
    it('should always produce a valid url-friendly name', () => {
        for (let i = 0; i < 100; i++) {
            const name = generateAnalysisName();

            expect(name).toMatch(/^[a-z0-9-_.]+$/);
            expect(name.length).toBeGreaterThanOrEqual(3);
            expect(name.length).toBeLessThanOrEqual(128);
        }
    });
});
