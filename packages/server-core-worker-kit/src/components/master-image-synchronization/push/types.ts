/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type MasterImagesPushCommandPayloadTag = {
    name: string,
    registryId: string
};
export type MasterImagesPushCommandPayload = {
    id: string,
    tags: MasterImagesPushCommandPayloadTag[]
};

export type MasterImagesPushFailedEventPayload = {
    id: string,
    error: Error
};

export type MasterImagesPushEventPayload = {
    id: string,
    tags: MasterImagesPushCommandPayloadTag[]
};
