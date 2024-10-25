/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImagesPushCommandPayloadTag } from '../push';

export type MasterImagesBuildCommandPayload = {
    id: string,
    path: string,
    virtualPath: string
};

export type MasterImagesBuildingEventPayload = {
    id: string
};

export type MasterImagesBuiltEventPayload = {
    id: string,
    tags: MasterImagesPushCommandPayloadTag[]
};
