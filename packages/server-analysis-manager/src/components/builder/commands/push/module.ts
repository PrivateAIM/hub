/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_ARTIFACT_TAG_LATEST,
} from '@privateaim/core-kit';
import { BuilderCommand } from '@privateaim/server-analysis-manager-kit';
import type { BuilderBuildPayload } from '@privateaim/server-analysis-manager-kit';
import {
    buildDockerAuthConfigFromRegistry,
    buildRemoteDockerImageURL,
    cleanupDockerImages,
    pushDockerImage,
    useCoreClient,
    useDocker,
} from '../../../../core';
import type { ComponentPayloadExtended } from '../../../type';
import { extendPayload } from '../../../utils';
import { BuilderError } from '../../error';
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

    // -----------------------------------------------------------------------------------

    const authConfig = buildDockerAuthConfigFromRegistry(data.registry);

    const client = useCoreClient();
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

    const image = useDocker()
        .getImage(localImageUrl);

    await image.inspect();

    const imageURLs : string[] = [];
    for (let i = 0; i < nodes.length; i++) {
        const nodeImageURL = buildRemoteDockerImageURL({
            hostname: data.registry.host,
            projectName: nodes[i].registry_project.external_name,
            repositoryName: data.entity.id,
            tagOrDigest: REGISTRY_ARTIFACT_TAG_LATEST,
        });

        imageURLs.push(nodeImageURL);
    }

    try {
        for (let i = 0; i < imageURLs.length; i++) {
            await image.tag({
                repo: imageURLs[i],
                tag: REGISTRY_ARTIFACT_TAG_LATEST,
            });
        }
    } catch (e) {
        await cleanupDockerImages(imageURLs);

        throw e;
    } finally {
        await image.remove({
            force: true,
        });
    }

    useBuilderLogger().debug('Tagged image for nodes', {
        command: BuilderCommand.BUILD,
    });

    // -----------------------------------------------------------------------------------

    useBuilderLogger().debug('Pushing image for nodes', {
        command: BuilderCommand.BUILD,
    });

    try {
        for (let i = 0; i < imageURLs.length; i++) {
            await pushDockerImage(imageURLs[i], authConfig);
        }
    } catch (e) {
        await cleanupDockerImages(imageURLs);

        throw e;
    }

    useBuilderLogger().debug('Pushed image for nodes', {
        command: BuilderCommand.BUILD,
    });

    return data;
}
