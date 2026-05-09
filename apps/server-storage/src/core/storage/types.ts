/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Readable } from 'node:stream';

export interface IStorageAdapter {
    bucketExists(name: string): Promise<boolean>;
    makeBucket(name: string, region?: string): Promise<void>;
    removeBucket(name: string): Promise<void>;

    putObject(bucket: string, key: string, data: Buffer, size: number): Promise<void>;
    getObject(bucket: string, key: string): Promise<Readable>;
    removeObject(bucket: string, key: string): Promise<void>;
    removeObjects(bucket: string, keys: string[]): Promise<void>;
    listObjects(bucket: string, prefix?: string): Promise<string[]>;
}
