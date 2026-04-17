/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import type { DataSource, EntitySubscriberInterface, InsertEvent  } from 'typeorm';
import { MasterImageGroupEntity } from '../../../src/adapters/database/entities/master-image-group.ts';
import { createTestDatabaseApplication } from '../../app';
import { DatabaseInjectionKey } from '../../../src/app/modules/database/index.ts';

class SpySubscriber implements EntitySubscriberInterface<MasterImageGroupEntity> {
    afterInsertFn = vi.fn();

    listenTo() {
        return MasterImageGroupEntity;
    }

    async afterInsert(event: InsertEvent<MasterImageGroupEntity>) {
        this.afterInsertFn(event.entity);
    }
}

describe('typeorm subscriber: push after initialize', () => {
    let dataSource: DataSource;
    const spy = new SpySubscriber();
    const suite = createTestDatabaseApplication();

    beforeAll(async () => {
        await suite.setup();

        dataSource = suite.container.resolve(DatabaseInjectionKey.DataSource);

        // Push subscriber AFTER initialize (simulating the production fix)
        dataSource.subscribers.push(spy);
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it('should fire subscriber afterInsert when entity is saved', async () => {
        const repo = dataSource.getRepository(MasterImageGroupEntity);
        const entity = repo.create({
            name: 'test-group',
            path: '/test',
            virtual_path: '/test',
        });
        await repo.save(entity);

        expect(spy.afterInsertFn).toHaveBeenCalledTimes(1);
        expect(spy.afterInsertFn.mock.calls[0][0].id).toBe(entity.id);
    });
});
