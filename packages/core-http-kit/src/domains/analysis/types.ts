/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from 'hapic';
import type { Analysis, AnalysisCommand } from '@privateaim/core-kit';
import type { EntityQueryInput } from '../../utils';
import type { EntityRecordResponse, IEntityAPI } from '../types-base';

export type AnalysisCreatePayload =    & Pick<Analysis, 'project_id'> &
    Partial<Pick<Analysis, 'name' | 'display_name' | 'description' | 'master_image_id' | 'registry_id' | 'image_command_arguments'>>;

export type AnalysisUpdatePayload = Partial<AnalysisCreatePayload>;

export interface IAnalysisAPI extends IEntityAPI<Analysis, AnalysisCreatePayload, AnalysisUpdatePayload> {
    getResultDownloadPath(id: Analysis['id']) : string;
    getResultDownloadURL(id: Analysis['id']) : string;
    getFilesDownloadPath(id: Analysis['id']) : string;
    getFileDownloadURL(id: Analysis['id']) : string;

    /**
     * Unique in this package: a third `requestConfig` argument, used to pass a
     * per-call authorization header from the worker.
     */
    getOne(
        id: Analysis['id'],
        options?: EntityQueryInput<Analysis>,
        requestConfig?: RequestBaseOptions,
    ) : Promise<EntityRecordResponse<Analysis>>;

    runCommand(
        id: Analysis['id'],
        command: `${AnalysisCommand}`,
        data?: Record<string, any>,
    ) : Promise<EntityRecordResponse<Analysis>>;

    /**
     * `responseType: 'stream'` hands back the raw response body. Declared as
     * `ReadableStream` to match the same operation in `@privateaim/storage-kit`
     * (`IBucketAPI.stream` / `IBucketFileAPI.stream`) — the established
     * convention for a stream verb in this monorepo.
     */
    streamFiles(id: Analysis['id']) : Promise<ReadableStream<any>>;
    downloadResult(id: Analysis['id']) : Promise<ReadableStream<any>>;
}
