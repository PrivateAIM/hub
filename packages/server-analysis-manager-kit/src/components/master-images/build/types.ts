/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImagesCommand, MasterImagesEvent } from '../constants';
import type { MasterImagesPushCommandPayloadTag } from '../push';

export type MasterImagesBuildCommandPayload = {
    id: string,
    path: string,
    virtualPath: string
};
export type MasterImagesBuildCommandContext = {
    command: `${MasterImagesCommand.BUILD}`,
    data: MasterImagesBuildCommandPayload,
};

export type MasterImagesBuildingEventPayload = {
    id: string
};

export type MasterImagesBuildingEventContext = {
    data: MasterImagesBuildingEventPayload,
    event: `${MasterImagesEvent.BUILDING}`
};

export type MasterImagesBuiltEventPayload = {
    id: string,
    tags: MasterImagesPushCommandPayloadTag[]
};

export type MasterImagesBuiltEventContext = {
    data: MasterImagesBuiltEventPayload,
    event: `${MasterImagesEvent.BUILT}`;
};

export type MasterImagesBuildEventContext = MasterImagesBuildingEventContext |
MasterImagesBuiltEventContext;
