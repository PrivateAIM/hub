/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Client,
    EntityType,
    EventRecord,
} from '@authup/core-kit';
import { ServiceID } from '@privateaim/core-kit';
import type { IRegistryDispatcher } from '../../../../core/harbor/types.ts';
import {
    RegistryCommand,
} from '../../../components/index.ts';
import type { AuthupAggregatorRepositories } from '../types.ts';

// Since @authup v1.0.0-beta.53 robots are unified into clients — the
// registry service identity is now a confidential client named
// `ServiceID.REGISTRY`, so this handler reacts to CLIENT events.
export async function handleAuthupRobotEvent(
    context: EventRecord<EntityType.CLIENT, Client>,
    repositories: AuthupAggregatorRepositories,
    dispatcher?: IRegistryDispatcher,
) {
    if (!context.data.id) {
        return;
    }

    if (
        context.event !== 'created' &&
        context.event !== 'updated'
    ) {
        return;
    }
    if (context.data.name !== ServiceID.REGISTRY) {
        return;
    }

    const projects = await repositories.registryProjectRepository.findManyBy({});

    if (!dispatcher) {
        return;
    }

    for (const project of projects) {
        await dispatcher.dispatch(
            RegistryCommand.PROJECT_LINK,
            { id: project.id },
            {},
        );
    }
}
