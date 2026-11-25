/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '@privateaim/core-kit';
import type { EntityPersistContext } from '@privateaim/server-kit';
import type { INodeRepository, NodeClientBinding } from '../../../../../src/core/entities/node/types.ts';
import { FakeEntityRepository } from '@privateaim/server-test-kit';

export class FakeNodeRepository extends FakeEntityRepository<Node> implements INodeRepository {
    async findOneByClientBinding(clientId: string, realmId: string): Promise<NodeClientBinding | null> {
        const row = this.getAll().find((entity) => entity.clientId === clientId && entity.realmId === realmId);

        if (!row) {
            return null;
        }

        return {
            id: row.id,
            clientId: row.clientId,
            realmId: row.realmId,
            registryProjectId: row.registryProjectId,
        };
    }

    async findOneWithExternalName(id: string): Promise<Node | null> {
        return this.findOneById(id);
    }

    /**
     * Runs right before the locked read: stands in for another writer
     * committing a change between a service's early read and its lock.
     */
    beforeLockedUpdate: ((id: string) => Promise<void>) | undefined;

    /**
     * Single-threaded, so find -> fn -> save is atomic. `fn` works on a copy:
     * a throw leaves the stored row untouched, as a rollback would.
     */
    async updateLocked(
        id: string,
        fn: (entity: Node) => boolean,
        ctx?: EntityPersistContext,
    ): Promise<Node | null> {
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
