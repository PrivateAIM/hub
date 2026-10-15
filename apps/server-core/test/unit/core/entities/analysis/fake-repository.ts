/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type { EntityPersistContext } from '@privateaim/server-kit';
import type { IAnalysisRepository } from '../../../../../src/core/entities/analysis/types.ts';
import { FakeEntityRepository } from '@privateaim/server-test-kit';

export class FakeAnalysisRepository extends FakeEntityRepository<Analysis> implements IAnalysisRepository {
    /**
     * Runs right before the locked read — stands in for another replica
     * committing a change between a service's early read and its lock.
     */
    beforeLockedUpdate: ((id: string) => Promise<void>) | undefined;

    /**
     * Runs right after an unlocked `findOneBy` read — stands in for another
     * replica committing a change while a service still holds that copy.
     */
    afterUnlockedRead: ((id: string) => Promise<void>) | undefined;

    async findOneBy(where: Record<string, any>): Promise<Analysis | null> {
        const row = await super.findOneBy(where);
        if (!row) {
            return null;
        }

        const copy = { ...row };
        await this.afterUnlockedRead?.(row.id);

        return copy;
    }

    async findOneWithProject(id: string): Promise<Analysis | null> {
        return this.findOneById(id);
    }

    async findManyInProgressUpdatedBefore(updatedBefore: Date): Promise<Analysis[]> {
        const inProgress = (status: string | null) => status === ProcessStatus.STARTING ||
            status === ProcessStatus.STARTED;

        return this.getAll().filter((entity) => (inProgress(entity.buildStatus) || inProgress(entity.distributionStatus)) &&
            new Date(entity.updatedAt).getTime() < updatedBefore.getTime());
    }

    async countByProject(projectId: string): Promise<number> {
        return this.getAll().filter((entity) => entity.projectId === projectId).length;
    }

    /**
     * Single-threaded, so find -> fn -> save is atomic. `fn` works on a copy:
     * a throw leaves the stored row untouched, as a rollback would.
     */
    async updateLocked(
        id: string,
        fn: (entity: Analysis) => boolean,
        ctx?: EntityPersistContext,
    ): Promise<Analysis | null> {
        await this.beforeLockedUpdate?.(id);

        const row = await this.findOneById(id);
        if (!row) {
            return null;
        }

        const entity = { ...row };
        if (!fn(entity)) {
            return null;
        }

        return this.save(entity, ctx);
    }
}
