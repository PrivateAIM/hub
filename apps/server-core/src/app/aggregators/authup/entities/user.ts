/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { EntityType, EventRecord, User } from '@authup/core-kit';
import type { AuthupAggregatorRepositories } from '../types.ts';

export async function handleAuthupUserEvent(
    context: EventRecord<EntityType.USER, Pick<User, 'id'>>,
    repositories: AuthupAggregatorRepositories,
) {
    if (!context.data.id) {
        return;
    }

    if (context.event === 'deleted') {
        const where = { userId: context.data.id };

        const projects = await repositories.projectRepository.findManyBy(where);
        for (const project of projects) {
            project.userId = null;
        }
        await repositories.projectRepository.saveMany(projects);

        // on the locked row: a full-copy save would write a stale status back
        // over one a concurrent worker event committed meanwhile.
        const analyses = await repositories.analysisRepository.findManyBy(where);
        for (const analysis of analyses) {
            await repositories.analysisRepository.updateLocked(analysis.id, (locked) => {
                locked.userId = null;
                return true;
            });
        }

        // A file belongs to an analysis that outlives its uploader, so it is
        // detached like the analysis itself, never removed.
        const analysisFiles = await repositories.analysisBucketFileRepository.findManyBy(where);
        for (const analysisFile of analysisFiles) {
            analysisFile.userId = null;
        }
        await repositories.analysisBucketFileRepository.saveMany(analysisFiles);
    }
}
