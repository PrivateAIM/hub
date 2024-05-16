/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Abilities } from '@authup/kit';

export type RequestEnv = {
    abilities?: Abilities,

    realmId?: string,
    realmName?: string,
    realm?: { id?: string, name?: string },

    userId?: string,
    userName?: string,

    robotId?: string,
    robotName?: string
};
