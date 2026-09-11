/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { resolveDownloadTarget, resolveDownloadUrl } from '../../server/utils/download-target.ts';

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

    it('rejects types that only resolve through the prototype chain', () => {
        // A plain-object allow-list would let these through: `{}['constructor']`
        // is `Object` (truthy), and `{}['__proto__']` is `Object.prototype`
        // (also truthy, but not callable). Both must miss cleanly.
        expect(resolveDownloadTarget('constructor', 'abc-123')).toBeUndefined();
        expect(resolveDownloadTarget('__proto__', 'abc-123')).toBeUndefined();
        expect(resolveDownloadTarget('toString', 'abc-123')).toBeUndefined();
        expect(resolveDownloadTarget('hasOwnProperty', 'abc-123')).toBeUndefined();
    });
});

describe('resolveDownloadUrl', () => {
    it('appends to a storage URL with no path', () => {
        expect(resolveDownloadUrl('buckets/abc/stream', 'https://storage.example.net'))
            .toBe('https://storage.example.net/buckets/abc/stream');
    });

    it('appends to a path-prefixed storage URL missing a trailing slash', () => {
        // The WHATWG URL constructor resolves a relative path against a
        // slash-less base by REPLACING its last path segment, not appending —
        // exactly the deployment shape the reverse-proxy docs describe.
        expect(resolveDownloadUrl('buckets/abc/stream', 'http://host/storage'))
            .toBe('http://host/storage/buckets/abc/stream');
    });

    it('does not double the slash when the storage URL already ends with one', () => {
        expect(resolveDownloadUrl('buckets/abc/stream', 'http://host/storage/'))
            .toBe('http://host/storage/buckets/abc/stream');
    });
});
