/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { resolveDownloadTarget } from '../../server/utils/download-target.ts';

/**
 * The download proxy builds its upstream URL with `new URL(target, storageUrl)`,
 * which RESOLVES `..` segments. Anything this function lets through is a path
 * the browser can aim the proxy at, so the allow-list and the id check are the
 * whole trust boundary.
 */
describe('resolveDownloadTarget', () => {
    it('resolves the two allowed endpoints', () => {
        expect(resolveDownloadTarget('bucket-file', 'abc-123')).toBe('bucket-files/abc-123/stream');
        expect(resolveDownloadTarget('bucket', 'abc-123')).toBe('buckets/abc-123/stream');
    });

    it('rejects an unknown type', () => {
        expect(resolveDownloadTarget('buckets', 'abc-123')).toBeUndefined();
        expect(resolveDownloadTarget(undefined, 'abc-123')).toBeUndefined();
    });

    it('rejects ids that would escape the endpoint', () => {
        expect(resolveDownloadTarget('bucket-file', '..')).toBeUndefined();
        expect(resolveDownloadTarget('bucket-file', '../../buckets')).toBeUndefined();
        expect(resolveDownloadTarget('bucket-file', '')).toBeUndefined();
        expect(resolveDownloadTarget('bucket-file', undefined)).toBeUndefined();
    });
});
