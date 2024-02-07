/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { APIClient } from '@privateaim/core';
import {
    REGISTRY_ARTIFACT_TAG_LATEST,
} from '@privateaim/core';
import { useClient } from 'hapic';
import {
    buildDockerAuthConfig, buildRemoteDockerImageURL, pushDockerImage, useDocker,
} from '../../../../core';
import type { ComponentPayloadExtended } from '../../../type';
import { extendPayload } from '../../../utils';
import { BuilderCommand } from '../../constants';
import { BuilderError } from '../../error';
import type { BuilderBuildPayload } from '../../type';
import { useBuilderLogger } from '../../utils';

export async function executePushCommand(
    input: BuilderBuildPayload,
) : Promise<ComponentPayloadExtended<BuilderBuildPayload>> {
    const data = await extendPayload(input);

    if (!data.entity) {
        throw BuilderError.notFound();
    }

    if (!data.registry) {
        throw BuilderError.registryNotFound();
    }

    if (!data.registryProject) {
        throw BuilderError.registryProjectNotFound();
    }

    // -----------------------------------------------------------------------------------

    const authConfig = buildDockerAuthConfig({
        host: data.registry.host,
        user: data.registry.account_name,
        password: data.registry.account_secret,
    });

    const client = useClient<APIClient>();
    const { data: analysisNodes } = await client.analysisNode.getMany({
        filter: {
            analysis_id: data.entity.id,
        },
        sort: {
            index: 'ASC',
        },
    });

    if (analysisNodes.length === 0) {
        // todo: custom error
        throw BuilderError.notFound();
    }

    const { data: nodes } = await client.node.getMany({
        filter: {
            id: analysisNodes.map((analysisNode) => analysisNode.node_id),
        },
        relations: {
            registry_project: true,
        },
    });

    // -----------------------------------------------------------------------------------

    useBuilderLogger().debug('Tagging image for nodes', {
        command: BuilderCommand.BUILD,
    });

    const localImageUrl = `${data.id}:${REGISTRY_ARTIFACT_TAG_LATEST}`;

    const image = await useDocker()
        .getImage(localImageUrl);

    for (let i = 0; i < nodes.length; i++) {
        const nodeImageURL = buildRemoteDockerImageURL({
            hostname: data.registry.host,
            projectName: nodes[i].registry_project.external_name,
            repositoryName: data.entity.id,
            tagOrDigest: REGISTRY_ARTIFACT_TAG_LATEST,
        });

        await image.tag({
            repo: nodeImageURL,
            tag: REGISTRY_ARTIFACT_TAG_LATEST,
        });
    }

    await image.remove({
        force: true,
    });

    // -----------------------------------------------------------------------------------

    useBuilderLogger().debug('Pushing image for nodes', {
        command: BuilderCommand.BUILD,
    });

    for (let i = 0; i < nodes.length; i++) {
        const nodeImageURL = buildRemoteDockerImageURL({
            hostname: data.registry.host,
            projectName: nodes[i].registry_project.external_name,
            repositoryName: data.entity.id,
            tagOrDigest: REGISTRY_ARTIFACT_TAG_LATEST,
        });

        await pushDockerImage(nodeImageURL, authConfig);
    }

    return data;
}
