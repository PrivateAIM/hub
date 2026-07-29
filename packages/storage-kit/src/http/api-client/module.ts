/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, HookName, isClientError } from 'hapic';
import {
    BucketAPI,
    BucketFileAPI,
} from '../../domains';
import type { ClientOptions, IStorageClient } from './types';

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
}
