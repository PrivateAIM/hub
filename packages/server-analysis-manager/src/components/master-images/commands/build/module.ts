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
    MasterImagesBuildCommandPayload, MasterImagesPushCommandPayloadTag,
} from '@privateaim/server-analysis-manager-kit';
import {
    buildRemoteDockerImageURL, useCoreClient, useDocker, waitForDockerActionStream,
} from '../../../../core';
import { writePushCommand } from '../../queue';

export async function executeMasterImagesBuildCommand(
    payload: MasterImagesBuildCommandPayload,
) {
    const coreClient = useCoreClient();
    const docker = useDocker();
    const promises : Promise<unknown>[] = [];

    const { data: registries } = await coreClient.registry.getMany();

    const tags : MasterImagesPushCommandPayloadTag[] = [];

    for (let i = 0; i < payload.images.length; i++) {
        const imagePath = path.join(payload.directory, payload.images[i].path);

        for (let j = 0; j < registries.length; j++) {
            const imageTag = buildRemoteDockerImageURL({
                hostname: registries[j].host,
                projectName: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
                repositoryName: payload.images[i].virtualPath,
                tagOrDigest: 'latest',
            });

            tags.push({
                name: imageTag,
                registryId: registries[j].id,
            });

            const pack = tar.pack(imagePath);
            const promise = docker
                .buildImage(pack, {
                    t: imageTag,
                })
                .then((stream) => waitForDockerActionStream(stream));

            promises.push(promise);
        }
    }

    await Promise.all(promises);

    await writePushCommand({
        tags,
    });

    return payload;
}
