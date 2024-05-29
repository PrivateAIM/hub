/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    buildRegistryClientConnectionStringFromRegistry,
} from '@privateaim/core';
import { isClientErrorWithStatusCode } from 'hapic';

import { BuilderCommand } from '@privateaim/server-analysis-manager-kit';
import type { BuilderCheckPayload } from '@privateaim/server-analysis-manager-kit';
import { createBasicHarborAPIClient, useCoreClient } from '../../../../core';
import type { ComponentPayloadExtended } from '../../../type';
import { extendPayload } from '../../../utils';
import { BuilderError } from '../../error';
import { writeBuiltEvent, writeNoneEvent } from '../../events';

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
        await writeNoneEvent({
            command: BuilderCommand.CHECK,
            data,
        });

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
        await writeNoneEvent({
            command: BuilderCommand.CHECK,
            data,
        });

        return data;
    }

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
            await writeBuiltEvent({
                data,
                command: BuilderCommand.CHECK,
            });

            return data;
        }
    } catch (e) {
        if (!isClientErrorWithStatusCode(e, 404)) {
            throw e;
        }
    }

    await writeNoneEvent({
        command: BuilderCommand.CHECK,
        data,
    });

    return data;
}
