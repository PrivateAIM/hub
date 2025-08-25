/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_ARTIFACT_TAG_LATEST,
} from '@privateaim/core-kit';
import { BuilderCommand } from '@privateaim/server-core-worker-kit';
import type { BuilderBuildPayload } from '@privateaim/server-core-worker-kit';
import {
    pullDockerImage,
    useDocker,
} from '../../../../core';
import type { ComponentPayloadExtended } from '../../../type';
import { extendPayload } from '../../../utils';
import { bundleDockerFile, packContainerWithAnalysis } from '../../helpers';
import { buildDockerImage } from '../../../../core/docker/image-build';
import { BuilderError } from '../../error';
import { useBuilderLogger } from '../../utils';

export async function executeBuilderBuildCommand(
    input: BuilderBuildPayload,
) : Promise<ComponentPayloadExtended<BuilderBuildPayload>> {
    const data = await extendPayload(input);

    if (!data.entity) {
        throw BuilderError.notFound();
    }

    if (!data.registry) {
        throw BuilderError.registryNotFound();
    }

    // -----------------------------------------------------------------------------------

    const { content: dockerFile, masterImagePath } = await bundleDockerFile({
        entity: data.entity,
        hostname: data.registry.host,
    });

    // -----------------------------------------------------------------------------------

    useBuilderLogger().info({
        message: `Pulling docker image ${masterImagePath}:latest`,
        command: BuilderCommand.BUILD,
        analysis_id: data.id,
    });

    await pullDockerImage(`${masterImagePath}:${REGISTRY_ARTIFACT_TAG_LATEST}`);

    // -----------------------------------------------------------------------------------

    useBuilderLogger().info({
        message: 'Building docker image.',
        command: BuilderCommand.BUILD,
        analysis_id: data.id,
    });

    const imageURL = data.entity.id;

    await buildDockerImage({
        content: dockerFile,
        imageName: imageURL,
    });

    // -----------------------------------------------------------------------------------

    useBuilderLogger().info({
        message: `Creating docker container ${imageURL}:${REGISTRY_ARTIFACT_TAG_LATEST}`,
        command: BuilderCommand.BUILD,
        analysis_id: data.id,
    });

    const container = await useDocker()
        .createContainer({ Image: imageURL });

    try {
        // -----------------------------------------------------------------------------------

        await packContainerWithAnalysis(container, {
            entity: data.entity,
            masterImagePath,
        });

        // -----------------------------------------------------------------------------------

        useBuilderLogger().info({
            message: `Commiting docker container ${imageURL}:${REGISTRY_ARTIFACT_TAG_LATEST}`,
            command: BuilderCommand.BUILD,
            analysis_id: data.id,
        });

        await container.commit({
            repo: imageURL,
            tag: REGISTRY_ARTIFACT_TAG_LATEST,
        });
    } finally {
        await container.remove({
            force: true,
        });
    }

    return data;
}
