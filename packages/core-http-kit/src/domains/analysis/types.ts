/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Analysis,
    AnalysisCommand,
    AnalysisStorageToken,
    AnalysisStorageTokenCreatePayload,
} from '@privateaim/core-kit';
import type { APIRequestOptions, EntityRecordResponse, IEntityAPI } from '../types';

export type AnalysisCreatePayload =    & Pick<Analysis, 'projectId'> &
    Partial<Pick<Analysis, 'name' | 'displayName' | 'description' | 'masterImageId' | 'registryId' | 'imageCommandArguments'>>;

export type AnalysisUpdatePayload = Partial<AnalysisCreatePayload>;

export interface IAnalysisAPI extends IEntityAPI<Analysis, AnalysisCreatePayload, AnalysisUpdatePayload> {
    getResultDownloadPath(id: Analysis['id']) : string;
    getResultDownloadURL(id: Analysis['id']) : string;
    getFilesDownloadPath(id: Analysis['id']) : string;
    getFileDownloadURL(id: Analysis['id']) : string;

    runCommand(
        id: Analysis['id'],
        command: `${AnalysisCommand}`,
        data?: Record<string, any>,
        options?: APIRequestOptions,
    ) : Promise<EntityRecordResponse<Analysis>>;

    /**
     * Mint a storage capability token for buckets of this analysis. Credential
     * endpoint: the body is flat, without the `{ data, meta }` envelope.
     */
    createStorageToken(
        id: Analysis['id'],
        data: AnalysisStorageTokenCreatePayload,
        options?: APIRequestOptions,
    ) : Promise<AnalysisStorageToken>;

    /**
     * `responseType: 'stream'` hands back the raw response body. Declared as
     * `ReadableStream` to match the same operation in `@privateaim/storage-kit`
     * (`IBucketAPI.stream` / `IBucketFileAPI.stream`) — the established
     * convention for a stream verb in this monorepo. The call sends
     * `timeout: 0` unless `options.timeout` is set: the deadline would keep
     * running while the caller reads the body.
     */
    streamFiles(id: Analysis['id'], options?: APIRequestOptions) : Promise<ReadableStream<any>>;
    downloadResult(id: Analysis['id'], options?: APIRequestOptions) : Promise<ReadableStream<any>>;
}
