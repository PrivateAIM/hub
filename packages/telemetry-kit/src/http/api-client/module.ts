/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from 'hapic';
import { Client, HookName, isClientError } from 'hapic';
import {
    EventAPI,
    LogAPI,
} from '../../domains';

export class APIClient extends Client {
    public readonly event : EventAPI;

    public readonly log : LogAPI;

    constructor(config: RequestBaseOptions) {
        super(config);

        this.event = new EventAPI({ client: this });
        this.log = new LogAPI({ client: this });

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
