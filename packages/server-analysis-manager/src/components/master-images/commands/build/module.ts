/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { REGISTRY_MASTER_IMAGE_PROJECT_NAME } from '@privateaim/core-kit';
import path from 'node:path';
import tar from 'tar-fs';
import type {
    MasterImagesBuildCommandPayload,
    MasterImagesPushCommandPayloadTag,
} from '@privateaim/server-analysis-manager-kit';
import { MasterImagesEvent, useMasterImageQueueService } from '@privateaim/server-analysis-manager-kit';
import {
    buildRemoteDockerImageURL, useCoreClient, useDocker, waitForDockerActionStream,
} from '../../../../core';
import { MASTER_IMAGES_DATA_DIRECTORY_PATH } from '../../../../constants';

export async function executeMasterImagesBuildCommand(
    payload: MasterImagesBuildCommandPayload,
) {
    const coreClient = useCoreClient();
    const docker = useDocker();
    const queue = useMasterImageQueueService();

    const promises : Promise<unknown>[] = [];

    const { data: registries } = await coreClient.registry.getMany();

    await queue.publishEvent({
        event: MasterImagesEvent.BUILDING,
        data: {
            id: payload.id,
        },
    });

    const tags : MasterImagesPushCommandPayloadTag[] = [];
    const imageFilePath = path.join(MASTER_IMAGES_DATA_DIRECTORY_PATH, payload.path);

    for (let j = 0; j < registries.length; j++) {
        const imageTag = buildRemoteDockerImageURL({
            hostname: registries[j].host,
            projectName: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
            repositoryName: payload.virtualPath,
            tagOrDigest: 'latest',
        });

        tags.push({
            name: imageTag,
            registryId: registries[j].id,
        });

        const pack = tar.pack(imageFilePath);
        const promise = docker
            .buildImage(pack, {
                t: imageTag,
            })
            .then((stream) => waitForDockerActionStream(stream));

        promises.push(promise);
    }

    await Promise.all(promises);

    await queue.publishEvent({
        event: MasterImagesEvent.BUILT,
        data: {
            id: payload.id,
            tags,
        },
    });

    return payload;
}
