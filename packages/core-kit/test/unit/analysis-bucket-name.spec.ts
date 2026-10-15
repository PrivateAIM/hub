/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { AnalysisBucketType } from '../../src/domains/analysis-bucket/constants';
import { buildAnalysisBucketName, parseAnalysisBucketName } from '../../src/domains/analysis-bucket/utils';

describe('parseAnalysisBucketName', () => {
    const analysisId = '4a3f0c2e-9b1d-4e7a-8c5f-1d2e3f4a5b6c';

    it.each(Object.values(AnalysisBucketType))('should invert buildAnalysisBucketName for %s', (type) => {
        expect(parseAnalysisBucketName(buildAnalysisBucketName(type, analysisId)))
            .toEqual({ type, analysisId });
    });

    it.each([
        '',
        'analysis',
        'analysis-code-files',
        'analysis-code-files.',
        'analysis-foo-files.abc',
        'Analysis-code-files.abc',
        'x-analysis-code-files.abc',
        analysisId,
    ])('should return null for %j', (name) => {
        expect(parseAnalysisBucketName(name)).toBeNull();
    });
});
