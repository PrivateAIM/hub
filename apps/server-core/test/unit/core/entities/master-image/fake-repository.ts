/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage } from '@privateaim/core-kit';
import type { EntityPersistContext } from '@privateaim/server-kit';
import { FakeEntityRepository } from '@privateaim/server-test-kit';
import type { IMasterImageRepository } from '../../../../../src/core/entities/master-image/types.ts';

export class FakeMasterImageRepository extends FakeEntityRepository<MasterImage> implements IMasterImageRepository {
    /**
     * Runs right after an unlocked `findManyBy` read — stands in for another
     * replica committing a change while a service still holds those rows.
     */
    afterUnlockedRead: (() => Promise<void>) | undefined;

    async findManyBy(where: Record<string, any>): Promise<MasterImage[]> {
        const rows = (await super.findManyBy(where)).map((row) => ({ ...row }));
        await this.afterUnlockedRead?.();

        return rows;
    }

    /**
     * Single-threaded, so find -> fn -> save is atomic. `fn` works on a copy:
     * a throw leaves the stored row untouched, as a rollback would.
     */
    async updateLocked(
        id: string,
        fn: (entity: MasterImage) => boolean,
        ctx?: EntityPersistContext,
    ): Promise<MasterImage | null> {
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
