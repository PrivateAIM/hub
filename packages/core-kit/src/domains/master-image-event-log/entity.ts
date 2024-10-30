/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainType } from '../constants';
import type { MasterImage } from '../master-image';
import type { DomainEventBaseContext } from '../types-base';

export interface MasterImageEventLog {
    id: string;

    name: string;

    data: unknown | null;

    // ------------------------------------------------------------------

    expiring: boolean;

    expires_at: Date;

    // ------------------------------------------------------------------

    master_image_id: string | null;

    master_image: MasterImage | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;
}

export type MasterImageEventLogEventContext = DomainEventBaseContext & {
    type: `${DomainType.MASTER_IMAGE_EVENT_LOG}`,
    data: MasterImageEventLog
};
