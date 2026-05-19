/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Readable } from 'node:stream';
import type { IStorageAdapter } from '../../../../../src/core/storage/types.ts';

type MakeBucketCall = {
    name: string;
    region?: string;
};

export class FakeStorageAdapter implements IStorageAdapter {
    private buckets: Set<string> = new Set();

    private objects: Map<string, Buffer> = new Map();

    private makeBucketCalls: MakeBucketCall[] = [];

    async bucketExists(name: string): Promise<boolean> {
        return this.buckets.has(name);
    }

    async makeBucket(name: string, region?: string): Promise<void> {
        this.makeBucketCalls.push({ name, region });
        this.buckets.add(name);
    }

    async removeBucket(name: string): Promise<void> {
        this.buckets.delete(name);

        for (const key of this.objects.keys()) {
            if (key.startsWith(`${name}/`)) {
                this.objects.delete(key);
            }
        }
    }

    async putObject(bucket: string, key: string, data: Buffer | Readable): Promise<void> {
        let buffer: Buffer;
        if (Buffer.isBuffer(data)) {
            buffer = data;
        } else {
            const chunks: Buffer[] = [];
            for await (const chunk of data) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            buffer = Buffer.concat(chunks);
        }
        this.objects.set(`${bucket}/${key}`, buffer);
    }

    async getObject(bucket: string, key: string): Promise<Readable> {
        const data = this.objects.get(`${bucket}/${key}`);
        if (!data) {
            throw new Error(`Object not found: ${bucket}/${key}`);
        }

        return Readable.from(data);
    }

    async removeObject(bucket: string, key: string): Promise<void> {
        this.objects.delete(`${bucket}/${key}`);
    }

    async removeObjects(bucket: string, keys: string[]): Promise<void> {
        for (const key of keys) {
            this.objects.delete(`${bucket}/${key}`);
        }
    }

    async listObjects(bucket: string, prefix?: string): Promise<string[]> {
        const bucketPrefix = `${bucket}/`;
        const result: string[] = [];
        for (const key of this.objects.keys()) {
            if (key.startsWith(bucketPrefix)) {
                const objectKey = key.substring(bucketPrefix.length);
                if (!prefix || objectKey.startsWith(prefix)) {
                    result.push(objectKey);
                }
            }
        }
        return result;
    }

    // --- Test helpers ---

    getBuckets(): string[] {
        return [...this.buckets];
    }

    getMakeBucketCalls(): MakeBucketCall[] {
        return [...this.makeBucketCalls];
    }

    addBucket(name: string): void {
        this.buckets.add(name);
    }

    getStoredObjects(): Map<string, Buffer> {
        return new Map(this.objects);
    }
}
