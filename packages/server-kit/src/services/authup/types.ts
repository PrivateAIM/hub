/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ClientOptions,
    TokenCreator,
    TokenCreatorOptions,
} from '@authup/core-http-kit';

export type AuthupClientOptions = ClientOptions & {
    tokenCreator?: TokenCreator | TokenCreatorOptions
};
