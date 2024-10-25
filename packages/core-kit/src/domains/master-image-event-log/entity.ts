/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export interface MasterImageEventLog {
    id: string;

    name: string;

    description: string | null;

    expiring: boolean;

    // ------------------------------------------------------------------

    expires_at: Date;

    created_at: Date;

    updated_at: Date;
}
