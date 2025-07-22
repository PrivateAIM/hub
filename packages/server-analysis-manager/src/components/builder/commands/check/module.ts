/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    buildRegistryClientConnectionStringFromRegistry,
} from '@privateaim/core-kit';
import { isClientErrorWithStatusCode } from 'hapic';
import type { BuilderCheckPayload } from '@privateaim/server-analysis-manager-kit';
import { BuilderCommand } from '@privateaim/server-analysis-manager-kit';
import { createBasicHarborAPIClient, useCoreClient } from '../../../../core';
import type { ComponentPayloadExtended } from '../../../type';
import { extendPayload } from '../../../utils';
import { BuilderError } from '../../error';
import { writeNoneEvent } from '../../queue';
import { useBuilderLogger } from '../../utils';

export async function executeBuilderCheckCommand(
    input: BuilderCheckPayload,
) : Promise<ComponentPayloadExtended<BuilderCheckPayload>> {
    const data = await extendPayload(input);

    if (!data.entity) {
        throw BuilderError.notFound();
    }

    if (!data.registry) {
        throw BuilderError.registryNotFound();
    }

    // -----------------------------------------------------------------------------------

    const client = useCoreClient();
    const { data: analysisNodes } = await client.analysisNode.getMany({
        filter: {
            analysis_id: data.entity.id,
        },
        page: {
            limit: 1,
        },
    });

    if (analysisNodes.length === 0) {
        await writeNoneEvent(data);

        return data;
    }

    const { data: nodes } = await client.node.getMany({
        filter: {
            id: analysisNodes.map((analysisNode) => analysisNode.node_id),
        },
        relations: {
            registry_project: true,
        },
    });

    const [node] = nodes;

    if (typeof node === 'undefined') {
        await writeNoneEvent(data);

        return data;
    }

    useBuilderLogger().info({
        message: `Checking docker registry ${data.registry.host}}`,
        command: BuilderCommand.CHECK,
        analysis_id: data.id,
    });

    const connectionString = buildRegistryClientConnectionStringFromRegistry(data.registry);
    const harborClient = createBasicHarborAPIClient(connectionString);

    try {
        const harborRepository = await harborClient.projectRepository
            .getOne({
                projectName: node.registry_project.external_name,
                repositoryName: data.id,
            });

        if (
            harborRepository &&
            harborRepository.artifact_count > 0
        ) {
            useBuilderLogger().info({
                message: `Found docker image ${data.id} in ${node.registry_project.external_name} of registry ${data.registry.name}}`,
                command: BuilderCommand.CHECK,
                analysis_id: data.id,
                node_id: node.id,
            });
        }
    } catch (e) {
        if (!isClientErrorWithStatusCode(e, 404)) {
            throw e;
        }
    }

    await writeNoneEvent(data);

    return data;
}
