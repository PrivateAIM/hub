/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { EntityType, EventRecord, Permission } from '@authup/core-kit';
import { useDataSource } from 'typeorm-extension';
import { AnalysisPermissionEntity } from '../../../domains';

export async function handleAuthupPermissionEvent(
    context: EventRecord<EntityType.PERMISSION, Permission>,
) {
    if (context.event !== 'deleted') {
        return;
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisPermissionEntity);
    const entities = await repository.findBy({
        permission_id: context.data.id,
    });

    await repository.remove(entities);
}
