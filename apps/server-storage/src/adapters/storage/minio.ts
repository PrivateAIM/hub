/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from 'minio';
import type { Readable } from 'node:stream';
import type { StorageAdapter } from '../../core/storage/types.ts';

export class MinioStorageAdapter implements StorageAdapter {
    protected client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async bucketExists(name: string): Promise<boolean> {
        return this.client.bucketExists(name);
    }

    async makeBucket(name: string, region?: string): Promise<void> {
        if (region) {
            await this.client.makeBucket(name, region);
        } else {
            await this.client.makeBucket(name);
        }
    }

    async removeBucket(name: string): Promise<void> {
        await this.client.removeBucket(name);
    }

    async putObject(bucket: string, key: string, data: Buffer, size: number): Promise<void> {
        await this.client.putObject(bucket, key, data, size);
    }

    async getObject(bucket: string, key: string): Promise<Readable> {
        return this.client.getObject(bucket, key);
    }

    async removeObject(bucket: string, key: string): Promise<void> {
        await this.client.removeObject(bucket, key);
    }

    async removeObjects(bucket: string, keys: string[]): Promise<void> {
        await this.client.removeObjects(bucket, keys);
    }

    async listObjects(bucket: string, prefix?: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const objects: string[] = [];
            const stream = this.client.listObjects(bucket, prefix || '', true);
            stream.on('data', (obj) => { if (obj.name) objects.push(obj.name); });
            stream.on('end', () => resolve(objects));
            stream.on('error', (err) => reject(err));
        });
    }
}
