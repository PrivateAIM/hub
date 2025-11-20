/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    EntityType, EventRecord, Robot,
} from '@authup/core-kit';
import { ServiceID } from '@privateaim/core-kit';
import { useDataSource } from 'typeorm-extension';
import { useLogger } from '@privateaim/server-kit';
import {
    RegistryCommand,
    useRegistryComponentCaller,
} from '../../../components';
import { RegistryProjectEntity } from '../../../database';

export async function handleAuthupRobotEvent(context: EventRecord<EntityType.ROBOT, Robot>) {
    if (!context.data.id) {
        useLogger().warn('ID in authup robot event handler is missing.');
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

    const dataSource = await useDataSource();

    const projectRepository = dataSource.getRepository(RegistryProjectEntity);
    const projects = await projectRepository.find({
        select: ['id'],
    });

    const caller = useRegistryComponentCaller();

    for (let i = 0; i < projects.length; i++) {
        await caller.call(
            RegistryCommand.PROJECT_LINK,
            {
                id: projects[i].id,
            },
            {},
        );
    }
}
