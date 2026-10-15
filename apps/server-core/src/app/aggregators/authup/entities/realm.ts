/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    EntityType,
    EventRecord,
    Realm,
} from '@authup/core-kit';
import type { AuthupAggregatorRepositories } from '../types.ts';

export async function handleAuthupRealmEvent(
    context: EventRecord<EntityType.REALM, Realm>,
    repositories: AuthupAggregatorRepositories,
) {
    if (!context.data.id) {
        return;
    }

    if (context.event === 'deleted') {
        const where = { realmId: context.data.id };

        const projects = await repositories.projectRepository.findManyBy(where);
        await repositories.projectRepository.removeMany(projects);

        const registryProjects = await repositories.registryProjectRepository.findManyBy(where);
        await repositories.registryProjectRepository.removeMany(registryProjects);

        const nodes = await repositories.nodeRepository.findManyBy(where);
        await repositories.nodeRepository.removeMany(nodes);

        const analyses = await repositories.analysisRepository.findManyBy(where);
        await repositories.analysisRepository.removeMany(analyses);
    }
}
