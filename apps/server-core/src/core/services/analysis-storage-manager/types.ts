/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis, AnalysisBucketType } from '@privateaim/core-kit';

/**
 * Port for managing storage buckets.
 * Implemented by BucketComponentCaller in server-storage-kit.
 */
export interface IBucketCaller {
    callCreate(data: {
        name: string; 
        realmId: string; 
        refType?: string; 
        refId?: string 
    }, meta?: { correlationId?: string }): Promise<void>;
    callDelete(data: { id: string }, meta?: { correlationId?: string }): Promise<void>;
    callClear(data: { id: string }, meta?: { correlationId?: string }): Promise<void>;
}

/**
 * Port for managing async tasks.
 * Implemented by TaskManager in app layer.
 */
export interface ITaskManager {
    create(type: string, data: Record<string, any>): Promise<string>;
}

export type AnalysisStorageMangerCheckOptions = {
    type?: `${AnalysisBucketType}`;
};

export type AnalysisStorageMangerRemoveOptions = {
    type?: `${AnalysisBucketType}`;
};

export type AnalysisStorageMangerClearOptions = {
    type?: `${AnalysisBucketType}`;
};

export interface IAnalysisStorageManager {
    check(input: string | Analysis, options?: AnalysisStorageMangerCheckOptions): Promise<Analysis>;
    remove(input: string | Analysis, options?: AnalysisStorageMangerRemoveOptions): Promise<Analysis>;
    /**
     * Empty the analysis' buckets (files removed, buckets kept).
     */
    clear(input: string | Analysis, options?: AnalysisStorageMangerClearOptions): Promise<Analysis>;
}
