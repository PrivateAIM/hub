/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// eslint-disable-next-line max-classes-per-file
import type { Analysis } from '@privateaim/core-kit';
import type { IAnalysisMetadataRecalculator } from '../../../../src/core/entities/analysis/types.ts';
import type { IAnalysisNodeMetadataRecalculator } from '../../../../src/core/entities/analysis-node/types.ts';
import type { IAnalysisFileMetadataRecalculator } from '../../../../src/core/entities/analysis-bucket-file/types.ts';
import type { IEntityRepository } from '../../../../src/core/entities/types.ts';

export class FakeAnalysisMetadataRecalculator implements IAnalysisMetadataRecalculator {
    private repository: IEntityRepository<Analysis>;

    private calls: string[] = [];

    private debouncedCalls: string[] = [];

    constructor(repository: IEntityRepository<Analysis>) {
        this.repository = repository;
    }

    async recalc(analysisId: string): Promise<Analysis> {
        this.calls.push(analysisId);
        const entity = await this.repository.findOneById(analysisId);
        if (!entity) {
            throw new Error(`Analysis ${analysisId} not found`);
        }
        return entity;
    }

    async recalcDebounced(analysisId: string): Promise<void> {
        this.debouncedCalls.push(analysisId);
    }

    getCalls(): string[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    getDebouncedCalls(): string[] {
        return [...this.debouncedCalls];
    }

    getDebouncedCallCount(): number {
        return this.debouncedCalls.length;
    }

    clear(): void {
        this.calls = [];
        this.debouncedCalls = [];
    }
}

export class FakeAnalysisNodeMetadataRecalculator implements IAnalysisNodeMetadataRecalculator {
    private repository: IEntityRepository<Analysis>;

    private calls: string[] = [];

    private debouncedCalls: string[] = [];

    constructor(repository: IEntityRepository<Analysis>) {
        this.repository = repository;
    }

    async recalc(analysisId: string): Promise<Analysis> {
        this.calls.push(analysisId);
        const entity = await this.repository.findOneById(analysisId);
        if (!entity) {
            throw new Error(`Analysis ${analysisId} not found`);
        }
        return entity;
    }

    async recalcDebounced(analysisId: string): Promise<void> {
        this.debouncedCalls.push(analysisId);
    }

    getCalls(): string[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    getDebouncedCalls(): string[] {
        return [...this.debouncedCalls];
    }

    getDebouncedCallCount(): number {
        return this.debouncedCalls.length;
    }

    clear(): void {
        this.calls = [];
        this.debouncedCalls = [];
    }
}

export class FakeAnalysisFileMetadataRecalculator implements IAnalysisFileMetadataRecalculator {
    private repository: IEntityRepository<Analysis>;

    private calls: string[] = [];

    private debouncedCalls: string[] = [];

    constructor(repository: IEntityRepository<Analysis>) {
        this.repository = repository;
    }

    async recalc(analysisId: string): Promise<Analysis> {
        this.calls.push(analysisId);
        const entity = await this.repository.findOneById(analysisId);
        if (!entity) {
            throw new Error(`Analysis ${analysisId} not found`);
        }
        return entity;
    }

    async recalcDebounced(analysisId: string): Promise<void> {
        this.debouncedCalls.push(analysisId);
    }

    getCalls(): string[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    getDebouncedCalls(): string[] {
        return [...this.debouncedCalls];
    }

    getDebouncedCallCount(): number {
        return this.debouncedCalls.length;
    }

    clear(): void {
        this.calls = [];
        this.debouncedCalls = [];
    }
}
