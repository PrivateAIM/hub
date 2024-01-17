/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_ARTIFACT_TAG_BASE,
} from '@personalhealthtrain/core';
import { RouterCommand, RouterErrorCode } from '../../../constants';
import { useRouterLogger } from '../../../utils';
import type { RouteContextExtended } from '../type';
import { transferInternal } from '../transfer/internal';
import { transferOutgoing } from '../transfer/outgoing';
import { RouterError } from '../../../error';

export async function routeStationProject(context: RouteContextExtended) : Promise<void> {
    const index = context.items.findIndex((station) => station.registry_project_id === context.project.id);
    if (index === -1) {
        throw RouterError.registryProjectNotFound({
            type: RouterErrorCode.UNKNOWN,
            message: 'The current station could not be found.',
        });
    }

    const currentStation = context.items[index];

    if (
        currentStation.registry_project.account_name !== context.payload.operator ||
        context.payload.artifactTag === REGISTRY_ARTIFACT_TAG_BASE
    ) {
        return;
    }

    useRouterLogger().debug(`Handle station project ${context.project.name}.`, {
        command: RouterCommand.ROUTE,
    });

    const nextIndex = context.items.findIndex((station) => station.index === currentStation.index + 1);
    if (nextIndex === -1) {
        await transferOutgoing({
            project: currentStation.registry_project,
            repositoryName: context.payload.repositoryName,
            artifactTag: context.payload.artifactTag,
        });
    } else {
        const nextStation = context.items[nextIndex];

        await transferInternal({
            source: {
                project: currentStation.registry_project,
                repositoryName: context.payload.repositoryName,
                artifactTag: context.payload.artifactTag,
            },
            destination: {
                project: nextStation.registry_project,
                repositoryName: context.payload.repositoryName,
            },
        });
    }
}
