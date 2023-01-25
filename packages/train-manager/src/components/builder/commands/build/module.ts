/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import {
    HTTPClient,
    REGISTRY_ARTIFACT_TAG_LATEST,
    TrainContainerFileName,
    TrainManagerBuilderBuildPayload,
    TrainManagerQueuePayloadExtended,
} from '@personalhealthtrain/central-common';

import { useClient } from 'hapic';
import { useDocker } from '../../../../modules/docker';
import { buildTrainDockerFile, packContainerWithTrain } from '../../helpers';
import { useLogger } from '../../../../modules/log';
import { buildDockerImage } from '../../../../modules/docker/image-build';
import {
    buildDockerAuthConfig,
    buildRemoteDockerImageURL,
} from '../../../../config';
import { BuilderError } from '../../error';

export async function processBuildCommand(message: Message) {
    const data = message.data as TrainManagerQueuePayloadExtended<TrainManagerBuilderBuildPayload>;

    if (!data.entity) {
        throw BuilderError.notFound();
    }

    if (!data.registry) {
        throw BuilderError.registryNotFound();
    }

    if (!data.entity.incoming_registry_project_id) {
        throw BuilderError.registryProjectNotFound();
    }

    // -----------------------------------------------------------------------------------

    const { content: dockerFile, masterImagePath } = await buildTrainDockerFile({
        entity: data.entity,
        hostname: data.registry.host,
    });

    // -----------------------------------------------------------------------------------

    useLogger().debug('Building image...', {
        component: 'building',
    });

    const client = useClient<HTTPClient>();
    const incomingProject = await client.registryProject.getOne(data.entity.incoming_registry_project_id);

    data.registryProject = incomingProject;
    data.registryProjectId = incomingProject.id;

    const imageURL = buildRemoteDockerImageURL({
        hostname: data.registry.host,
        projectName: incomingProject.external_name,
        repositoryName: data.entity.id,
        tagOrDigest: REGISTRY_ARTIFACT_TAG_LATEST,
    });

    const authConfig = buildDockerAuthConfig({
        host: data.registry.host,
        user: data.registry.account_name,
        password: data.registry.account_secret,
    });

    await buildDockerImage({
        content: dockerFile,
        imageName: imageURL,
        authConfig,
    });

    // -----------------------------------------------------------------------------------

    useLogger().debug('Creating container...', {
        component: 'building',
        imageURL,
    });

    const container = await useDocker()
        .createContainer({ Image: imageURL });

    // -----------------------------------------------------------------------------------

    useLogger().debug(`Building ${TrainContainerFileName.CONFIG}`, {
        component: 'building',
    });

    await packContainerWithTrain(container, {
        train: data.entity,
        masterImagePath,
    });

    // -----------------------------------------------------------------------------------

    useLogger().debug('Tagging container', {
        component: 'building',
    });

    await container.commit({
        repo: imageURL,
        tag: 'latest',
    });

    await container.commit({
        repo: imageURL,
        tag: 'base',
    });

    await container.remove({
        force: true,
    });

    return message;
}