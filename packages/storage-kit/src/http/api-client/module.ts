/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, HookName, isClientError } from 'hapic';
import { BucketAPI, BucketFileAPI } from '../../domains';
import type { ClientOptions, IStorageClient, StorageAuthorizationResolver } from './types';

export class APIClient extends Client implements IStorageClient {
    public readonly bucket : BucketAPI;

    public readonly bucketFile : BucketFileAPI;

    constructor(config: ClientOptions = {}) {
        super(config);

        this.bucket = new BucketAPI({ client: this });
        this.bucketFile = new BucketFileAPI({ client: this });

        this.on(HookName.RESPONSE_ERROR, ((error) => {
            if (
                isClientError(error) &&
                error.response &&
                error.response.data &&
                typeof error.response.data.message === 'string'
            ) {
                error.message = error.response.data.message;
            }

            throw error;
        }));
    }

    withAuthorization(resolve: StorageAuthorizationResolver) : IStorageClient {
        const client = this.createScopedClient();

        client.on(HookName.REQUEST, async (options) => {
            // a stream request dispatches without a method, which means GET
            const method = (options.method ?? 'GET').toUpperCase();
            const token = await resolve({ method });

            const headers = new Headers(options.headers);

            headers.set('Authorization', `Bearer ${token}`);
            options.headers = headers;

            return options;
        });

        return client;
    }

    /**
     * Seam for the testing FakeClient, which has to keep its transport.
     */
    protected createScopedClient() : APIClient {
        return new APIClient({ baseURL: this.getBaseURL() });
    }
}
