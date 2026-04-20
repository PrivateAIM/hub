/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import type { IAnalysisMetadataCaller } from '../../../../src/core/services/analysis-builder/types.ts';
import type { IEntityRepository } from '../../../../src/core/entities/types.ts';

export class FakeAnalysisMetadataCaller implements IAnalysisMetadataCaller {
    private repository: IEntityRepository<Analysis>;

    private calls: Array<{ analysisId: string }> = [];

    constructor(repository: IEntityRepository<Analysis>) {
        this.repository = repository;
    }

    async callRecalcDirect(data: { analysisId: string }): Promise<Analysis> {
        this.calls.push(data);
        const entity = await this.repository.findOneById(data.analysisId);
        if (!entity) {
            throw new Error(`Analysis ${data.analysisId} not found in fake metadata caller`);
        }
        return entity;
    }

    getCalls(): Array<{ analysisId: string }> {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    clear(): void {
        this.calls = [];
    }
}
