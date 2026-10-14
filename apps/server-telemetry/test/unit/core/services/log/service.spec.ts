/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, PermissionDeniedError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import { createAllowAllActor, createDenyAllActor } from '@privateaim/server-test-kit';
import { LogChannel, LogLevel } from '@privateaim/telemetry-kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { LogService } from '../../../../../src/core/index.ts';
import { FakeLogStore } from './fake-log-store.ts';

describe('LogService', () => {
    let store: FakeLogStore;
    let service: LogService;

    beforeEach(() => {
        store = new FakeLogStore();
        service = new LogService({ store });
    });

    describe('create', () => {
        const input = {
            message: 'hello',
            level: LogLevel.INFORMATIONAL,
            service: 'test',
            channel: LogChannel.HTTP,
            labels: { foo: 'bar' },
        };

        it('should check LOG_CREATE and write the validated log', async () => {
            const actor = createAllowAllActor();
            const log = await service.create(input, actor);

            expect(log.message).toBe('hello');
            expect(store.items).toHaveLength(1);
            expect(actor.permissionEvaluator.preEvaluateCalls[0].name).toBe(PermissionName.LOG_CREATE);
        });

        it('should deny without permission and not write', async () => {
            await expect(service.create(input, createDenyAllActor())).rejects.toThrow(PermissionDeniedError);
            expect(store.items).toHaveLength(0);
        });
    });

    describe('getMany', () => {
        it('should accept either LOG_READ or LOG_DELETE', async () => {
            const actor = createAllowAllActor();
            await service.getMany({ filter: { foo: 'bar' } }, actor);

            expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0].name)
                .toEqual([PermissionName.LOG_READ, PermissionName.LOG_DELETE]);
        });

        it('should query by labels and cap the limit at 100', async () => {
            const result = await service.getMany({ filter: { foo: 'bar' }, page: { limit: 500, offset: 2 } }, createAllowAllActor());

            expect(result.meta).toEqual({
                total: 0,
                limit: 100,
                offset: 2,
            });
            expect(store.queryCalls[0]).toEqual({
                labels: { foo: 'bar' },
                limit: 100,
                offset: 2,
                sort: 'DESC',
            });
        });

        it('should reject a query without labels', async () => {
            await expect(service.getMany({}, createAllowAllActor())).rejects.toThrow(BadRequestError);
            expect(store.queryCalls).toHaveLength(0);
        });

        it('should deny without permission', async () => {
            await expect(service.getMany({ filter: { foo: 'bar' } }, createDenyAllActor())).rejects.toThrow(PermissionDeniedError);
            expect(store.queryCalls).toHaveLength(0);
        });
    });

    describe('deleteMany', () => {
        it('should check LOG_DELETE and delete by labels from the given time', async () => {
            const actor = createAllowAllActor();
            await service.deleteMany({ filter: { foo: 'bar', time: '123' } }, actor);

            expect(actor.permissionEvaluator.preEvaluateCalls[0].name).toBe(PermissionName.LOG_DELETE);
            expect(store.deleteCalls[0]).toEqual({ start: 123, labels: { foo: 'bar' } });
        });

        it('should reject a time that is not a number', async () => {
            await expect(service.deleteMany({ filter: { foo: 'bar', time: 'x' } }, createAllowAllActor()))
                .rejects.toThrow(BadRequestError);
            expect(store.deleteCalls).toHaveLength(0);
        });

        it('should reject a query without labels', async () => {
            await expect(service.deleteMany({ filter: { time: '1' } }, createAllowAllActor())).rejects.toThrow(BadRequestError);
            expect(store.deleteCalls).toHaveLength(0);
        });

        it('should deny without permission', async () => {
            await expect(service.deleteMany({ filter: { foo: 'bar' } }, createDenyAllActor())).rejects.toThrow(PermissionDeniedError);
            expect(store.deleteCalls).toHaveLength(0);
        });
    });
});
