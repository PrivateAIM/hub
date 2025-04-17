/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage } from '../master-image';

export interface MasterImageEventLog {
    id: string;

    name: string;

    data: unknown | null;

    // ------------------------------------------------------------------

    expiring: boolean;

    expires_at: string;

    // ------------------------------------------------------------------

    master_image_id: string | null;

    master_image: MasterImage | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;
}
