/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { isEqual } from 'smob';
import type { IAnalysisRepository } from './analysis/types.ts';

export class AnalysisRecalcQueue {
    private promises = new Map<string, Promise<void>>();

    private pending = new Set<string>();

    private readonly handler: (analysisId: string) => Promise<Analysis>;

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
        try {
            while (this.pending.has(analysisId)) {
                this.pending.delete(analysisId);

                await this.handler(analysisId);
            }
        } finally {
            this.promises.delete(analysisId);
        }
    }
}

export function hasAnalysisChanged(a: Analysis, b: Analysis): boolean {
    const excludeKeys: (keyof Analysis)[] = [
        'updatedAt',
        'createdAt',
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

/**
 * Persist recalculated metadata by applying `patch` to the locked row, not by
 * saving the copy it was computed from: save() diffs against the database, so
 * that copy's build/distribution status — read before a concurrent transition
 * committed — would be written back over it.
 */
export async function saveAnalysisPatch(
    repository: IAnalysisRepository,
    entity: Analysis,
    patch: Partial<Analysis>,
): Promise<Analysis> {
    const cloned = { ...entity };

    Object.assign(entity, patch);

    if (!hasAnalysisChanged(cloned, entity)) {
        return entity;
    }

    const saved = await repository.updateLocked(entity.id, (locked) => {
        Object.assign(locked, patch);

        return true;
    });

    return saved ?? entity;
}
