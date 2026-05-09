/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import type { Readable } from 'node:stream';
import type { IStorageAdapter } from '../../core/storage/types.ts';

export class FsStorageAdapter implements IStorageAdapter {
    protected basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    async bucketExists(name: string): Promise<boolean> {
        try {
            await fs.access(path.join(this.basePath, name));
            return true;
        } catch {
            return false;
        }
    }

    async makeBucket(name: string): Promise<void> {
        await fs.mkdir(path.join(this.basePath, name), { recursive: true });
    }

    async removeBucket(name: string): Promise<void> {
        await fs.rm(path.join(this.basePath, name), { recursive: true, force: true });
    }

    async putObject(bucket: string, key: string, data: Buffer): Promise<void> {
        const filePath = path.join(this.basePath, bucket, key);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, data);
    }

    async getObject(bucket: string, key: string): Promise<Readable> {
        const filePath = path.join(this.basePath, bucket, key);
        await fs.access(filePath);
        return createReadStream(filePath);
    }

    async removeObject(bucket: string, key: string): Promise<void> {
        try {
            await fs.unlink(path.join(this.basePath, bucket, key));
        } catch (err) {
            if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
                return;
            }
            throw err;
        }
    }

    async removeObjects(bucket: string, keys: string[]): Promise<void> {
        await Promise.all(keys.map((k) => this.removeObject(bucket, k)));
    }

    async listObjects(bucket: string, prefix?: string): Promise<string[]> {
        const dir = path.join(this.basePath, bucket);
        try {
            const entries = await fs.readdir(dir, { recursive: true });
            return prefix ? entries.filter((e) => e.startsWith(prefix)) : entries;
        } catch {
            return [];
        }
    }
}
