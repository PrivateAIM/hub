/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    DomainType, EventRecord, Policy,
} from '@authup/core-kit';
import { useDataSource } from 'typeorm-extension';
import { AnalysisPermissionEntity } from '../../../domains';

export async function handleAuthupPolicyEvent(
    context: EventRecord<DomainType.POLICY, Policy>,
) {
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
