/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, User } from '@authup/core-kit';
import type { DomainType } from '../constants';
import type { MasterImage } from '../master-image';
import type { DomainEventBaseContext } from '../types-base';

export interface Project {
    id: string;

    name: string;

    analyses: number;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    user_id: User['id'];

    master_image_id: MasterImage['id'] | null;

    master_image: MasterImage | null;
}

export type ProjectEventContext = DomainEventBaseContext & {
    type: `${DomainType.PROJECT}`,
    data: Project
};
