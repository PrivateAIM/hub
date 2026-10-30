/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IClient as IBaseClient, RequestBaseOptions } from 'hapic';

export type BaseAPIContext = {
    /**
     * hapic client INTERFACE, not its concrete class — see the identical note
     * in @privateaim/core-http-kit.
     */
    client?: IBaseClient | RequestBaseOptions
};
