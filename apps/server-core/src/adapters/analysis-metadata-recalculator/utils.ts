/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { isEqual } from 'smob';

export class RecalcQueue {
    private promises = new Map<string, Promise<void>>();

    private pending = new Set<string>();

    private handler: (analysisId: string) => Promise<Analysis>;

    constructor(handler: (analysisId: string) => Promise<Analysis>) {
        this.handler = handler;
    }

    enqueue(analysisId: string): Promise<void> {
        this.pending.add(analysisId);

        const existing = this.promises.get(analysisId);
        if (existing) {
            return existing;
        }

        const promise = this.processNext(analysisId);
        this.promises.set(analysisId, promise);

        return promise;
    }

    private async processNext(analysisId: string): Promise<void> {
        while (this.pending.has(analysisId)) {
            this.pending.delete(analysisId);

            await this.handler(analysisId);
        }

        this.promises.delete(analysisId);
    }
}

export function hasChanged(a: Analysis, b: Analysis): boolean {
    const excludeKeys: (keyof Analysis)[] = [
        'updated_at',
        'created_at',
    ];

    const keys = Object.keys(a);

    for (const key of keys) {
        if (excludeKeys.includes(key as keyof Analysis)) {
            continue;
        }

        if (!isEqual(a[key], b[key])) {
            return true;
        }
    }

    return false;
}
