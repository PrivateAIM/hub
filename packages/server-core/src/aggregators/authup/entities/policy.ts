/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    EntityType, EventRecord, Policy,
} from '@authup/core-kit';
import { useDataSource } from 'typeorm-extension';
import { useLogger } from '@privateaim/server-kit';
import { AnalysisPermissionEntity } from '../../../database/domains/index.ts';

export async function handleAuthupPolicyEvent(
    context: EventRecord<EntityType.POLICY, Policy>,
) {
    if (!context.data.id) {
        useLogger().warn('ID in authup policy event handler is missing.');
        return;
    }

    if (context.event !== 'deleted') {
        return;
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisPermissionEntity);
    await repository.update({
        policy_id: context.data.id,
    }, {
        policy_id: null,
    });
}
