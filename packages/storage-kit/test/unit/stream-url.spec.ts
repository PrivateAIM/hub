/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { APIClient } from '../../src';

describe('getStreamURL', () => {
    it.each(['https://host/storage', 'https://host/storage/'])('should keep the path prefix of %s', (baseURL) => {
        const client = new APIClient({ baseURL });

        expect(client.bucketFile.getStreamURL('f1')).toBe('https://host/storage/bucket-files/f1/stream');
        expect(client.bucket.getStreamURL('b1')).toBe('https://host/storage/buckets/b1/stream');
    });
});
