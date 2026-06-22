/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from 'hapic';
import { Client as BaseClient, HookName, isClientError } from 'hapic';
import { MessageAPI } from '../domains';

export class Client extends BaseClient {
    public readonly message : MessageAPI;

    constructor(config: RequestBaseOptions) {
        super(config);

        this.message = new MessageAPI({ client: this });

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
