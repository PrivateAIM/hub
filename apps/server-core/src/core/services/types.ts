/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';

/**
 * Port for recalculating analysis metadata.
 * Implemented by AnalysisMetadataComponentCaller in app layer.
 */
export interface IAnalysisMetadataCaller {
    callRecalcDirect(data: { analysisId: string }): Promise<Analysis>;
}

/**
 * Port for triggering analysis build operations on the worker.
 * Implemented by AnalysisBuilderComponentCaller in server-core-worker-kit.
 */
export interface IAnalysisBuilderCaller {
    callExecute(data: { id: string }): Promise<void>;
    callCheck(data: { id: string }): Promise<void>;
}

/**
 * Port for triggering analysis distribution operations on the worker.
 * Implemented by AnalysisDistributorComponentCaller in server-core-worker-kit.
 */
export interface IAnalysisDistributorCaller {
    callExecute(data: { id: string }): Promise<void>;
    callCheck(data: { id: string }): Promise<void>;
}

/**
 * Port for managing storage buckets.
 * Implemented by BucketComponentCaller in server-storage-kit.
 */
export interface IBucketCaller {
    callCreate(data: { name: string; realm_id: string }, meta?: { correlationId?: string }): Promise<void>;
    callDelete(data: { id: string }, meta?: { correlationId?: string }): Promise<void>;
}

/**
 * Port for managing async tasks.
 * Implemented by TaskManager in app layer.
 */
export interface ITaskManager {
    create(type: string, data: Record<string, any>): Promise<string>;
}

/**
 * Port for registry setup operations.
 * Implemented by RegistryComponentCaller in app layer.
 */
export interface IRegistryCaller {
    call(command: string, data: Record<string, any>, meta: Record<string, any>): Promise<void>;
}
