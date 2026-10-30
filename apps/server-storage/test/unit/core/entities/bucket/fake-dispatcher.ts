/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Bucket } from '@privateaim/storage-kit';
import type { IBucketDispatcher } from '../../../../../src/core/entities/bucket/types.ts';

export class FakeBucketDispatcher implements IBucketDispatcher {
    private createCalls: Record<string, any>[] = [];

    private deleteCalls: string[] = [];

    private clearCalls: string[] = [];

    async create(data: Record<string, any>): Promise<Bucket> {
        this.createCalls.push(data);

        return {
            id: randomUUID(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Bucket;
    }

    async delete(id: string): Promise<Bucket> {
        this.deleteCalls.push(id);

        return { id } as Bucket;
    }

    async clear(id: string): Promise<Bucket> {
        this.clearCalls.push(id);

        return { id } as Bucket;
    }

    getCreateCalls(): Record<string, any>[] {
        return [...this.createCalls];
    }

    getDeleteCalls(): string[] {
        return [...this.deleteCalls];
    }

    getClearCalls(): string[] {
        return [...this.clearCalls];
    }
}
