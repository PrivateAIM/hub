/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import {
    assertStorageCapabilityEntry,
    capabilityBucketFileIds,
    capabilityBucketIds,
    capabilityCoversBucket,
    capabilityCoversBucketFile,
} from '../../src';

describe('storage capability', () => {
    const bucketRead = {
        type: 'bucket', 
        id: 'B', 
        actions: ['read'], 
    };

    it('covers a file through its bucket entry', () => {
        expect(capabilityCoversBucketFile([bucketRead], { id: 'F', bucketId: 'B' }, 'read')).toBe(true);
        expect(capabilityCoversBucketFile([bucketRead], { id: 'F', bucketId: 'B' }, 'delete')).toBe(false);
        expect(capabilityCoversBucketFile([bucketRead], { id: 'F', bucketId: 'X' }, 'read')).toBe(false);
    });

    it('covers a file through its own entry only', () => {
        const entries = [{
            type: 'bucket-file', 
            id: 'F', 
            actions: ['read'], 
        }];

        expect(capabilityCoversBucketFile(entries, { id: 'F', bucketId: 'B' }, 'read')).toBe(true);
        expect(capabilityCoversBucketFile(entries, { id: 'G', bucketId: 'B' }, 'read')).toBe(false);
        expect(capabilityCoversBucket(entries, 'B', 'read')).toBe(false);
    });

    it('covers a bucket', () => {
        expect(capabilityCoversBucket([bucketRead], 'B', 'read')).toBe(true);
        expect(capabilityCoversBucket([bucketRead], 'B', 'write')).toBe(false);
    });

    it('lists ids by action', () => {
        const entries = [
            bucketRead,
            {
                type: 'bucket', 
                id: 'C', 
                actions: ['write'], 
            },
            {
                type: 'bucket-file', 
                id: 'F', 
                actions: ['read', 'delete'], 
            },
        ];

        expect(capabilityBucketIds(entries, 'read')).toEqual(['B']);
        expect(capabilityBucketFileIds(entries, 'delete')).toEqual(['F']);
        expect(capabilityBucketFileIds(entries, 'write')).toEqual([]);
    });

    it('asserts entries', () => {
        expect(() => assertStorageCapabilityEntry({
            type: 'bucket', 
            id: 'B', 
            actions: ['read', 'write', 'delete'], 
        })).not.toThrow();
        expect(() => assertStorageCapabilityEntry({
            type: 'bucket-file', 
            id: 'F', 
            actions: ['read', 'delete'], 
        })).not.toThrow();
        expect(() => assertStorageCapabilityEntry({
            type: 'bucket-file', 
            id: 'F', 
            actions: ['write'], 
        })).toThrow(TypeError);
        expect(() => assertStorageCapabilityEntry({
            type: 'analysis', 
            id: '1', 
            actions: ['read'], 
        })).toThrow(TypeError);
        expect(() => assertStorageCapabilityEntry({
            type: 'bucket', 
            id: 'B', 
            actions: ['admin'], 
        })).toThrow(TypeError);
    });
});
