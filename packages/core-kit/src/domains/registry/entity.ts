/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export interface Registry {
    id: string;

    name: string;

    host: string;

    // ------------------------------------------------------------------

    accountName: string | null;

    accountSecret: string | null;

    // ------------------------------------------------------------------

    createdAt: string;

    updatedAt: string;
}
