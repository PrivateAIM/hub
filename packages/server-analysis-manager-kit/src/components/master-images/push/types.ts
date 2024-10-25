/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImagesCommand, MasterImagesEvent } from '../constants';

export type MasterImagesPushCommandPayloadTag = { name: string, registryId: string };
export type MasterImagesPushCommandPayload = {
    id: string,
    tags: MasterImagesPushCommandPayloadTag[]
};

export type MasterImagesPushCommandContext = {
    command: `${MasterImagesCommand.PUSH}`,
    data: MasterImagesPushCommandPayload,
};

export type MasterImagesPushEventPayload = {
    id: string
};

export type MasterImagesPushEventContext = {
    data: MasterImagesPushEventPayload,
    event: `${MasterImagesEvent.PUSHING}` |
        `${MasterImagesEvent.PUSHED}`;
};
