/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_ARTIFACT_TAG_BASE,
} from '@personalhealthtrain/core';
import { RouterCommand } from '../../../constants';
import { useRouterLogger } from '../../../utils';
import { transferInternal } from '../transfer/internal';
import type { RouteContextExtended } from '../type';

export async function routeIncomingProject(context: RouteContextExtended) : Promise<void> {
    // move to station repo with index 0.
    const nextIndex = context.items.findIndex((station) => station.index === 0);
    if (nextIndex === -1) {
        useRouterLogger().debug('Route has no first project index', {
            command: RouterCommand.ROUTE,
        });

        return;
    }

    if (context.payload.artifactTag === REGISTRY_ARTIFACT_TAG_BASE) {
        return;
    }

    const nextStation = context.items[nextIndex];

    await transferInternal(
        {
            source: {
                project: context.project,
                repositoryName: context.payload.repositoryName,
                artifactTag: context.payload.artifactTag,
            },
            destination: {
                project: nextStation.registry_project,
                repositoryName: context.payload.repositoryName,
            },
        },
    );
}
