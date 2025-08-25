/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImagesPushCommandPayload } from '@privateaim/server-core-worker-kit';
import {
    MasterImagesEvent, useMasterImageQueueService,
} from '@privateaim/server-core-worker-kit';
import {
    buildDockerAuthConfigFromRegistry,
    useCoreClient,
    useDocker,
    waitForDockerActionStream,
} from '../../../../core';

async function pushMasterImage(tag: string, registryId: string) {
    const coreClient = useCoreClient();
    const docker = useDocker();

    const registry = await coreClient.registry.getOne(registryId, {
        fields: ['+account_secret'],
    });

    const image = docker.getImage(tag);

    const stream = await image.push({
        authconfig: buildDockerAuthConfigFromRegistry(registry),
    });

    await waitForDockerActionStream(stream);
}
export async function executeMasterImagesPushCommand(
    payload: MasterImagesPushCommandPayload,
) {
    const queue = useMasterImageQueueService();
    await queue.publishEvent({
        event: MasterImagesEvent.PUSHING,
        data: {
            id: payload.id,
            tags: payload.tags,
        },
    });

    const promises : Promise<unknown>[] = [];
    for (let i = 0; i < payload.tags.length; i++) {
        promises.push(pushMasterImage(payload.tags[i].name, payload.tags[i].registryId));
    }

    await Promise.all(promises);

    await queue.publishEvent({
        event: MasterImagesEvent.PUSHED,
        data: {
            id: payload.id,
            tags: payload.tags,
        },
    });

    return payload;
}
