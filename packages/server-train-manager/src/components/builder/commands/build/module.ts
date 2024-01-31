/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_ARTIFACT_TAG_LATEST,
} from '@personalhealthtrain/core';
import {
    pullDockerImage,
    useDocker,
} from '../../../../core';
import type { ComponentPayloadExtended } from '../../../type';
import { extendPayload } from '../../../utils';
import { BuilderCommand } from '../../constants';
import { buildTrainDockerFile, packContainerWithTrain } from '../../helpers';
import { buildDockerImage } from '../../../../core/docker/image-build';
import { BuilderError } from '../../error';
import type { BuilderBuildPayload } from '../../type';
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

    const { content: dockerFile, masterImagePath } = await buildTrainDockerFile({
        entity: data.entity,
        hostname: data.registry.host,
    });

    // -----------------------------------------------------------------------------------

    useBuilderLogger().debug('Pulling image...', {
        command: BuilderCommand.BUILD,
        image: `${masterImagePath}:latest`,
    });

    await pullDockerImage(`${masterImagePath}:latest`);

    // -----------------------------------------------------------------------------------

    useBuilderLogger().debug('Building image...', {
        command: BuilderCommand.BUILD,
    });

    const imageURL = data.entity.id;

    await buildDockerImage({
        content: dockerFile,
        imageName: imageURL,
    });

    // -----------------------------------------------------------------------------------

    useBuilderLogger().debug('Creating container...', {
        command: BuilderCommand.BUILD,
        imageURL,
    });

    const container = await useDocker()
        .createContainer({ Image: imageURL });

    // -----------------------------------------------------------------------------------

    await packContainerWithTrain(container, {
        train: data.entity,
        masterImagePath,
    });

    // -----------------------------------------------------------------------------------

    useBuilderLogger().debug('Committing container', {
        command: BuilderCommand.BUILD,
    });

    await container.commit({
        repo: imageURL,
        tag: REGISTRY_ARTIFACT_TAG_LATEST,
    });

    await container.remove({
        force: true,
    });

    return data;
}
