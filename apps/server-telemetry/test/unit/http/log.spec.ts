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
} from 'vitest';
import { wait } from '@privateaim/kit';
import { createAdminAuthorizationHeader } from '@privateaim/server-test-kit';
import { LogChannel, LogLevel } from '@privateaim/telemetry-kit';
import { createTestSuite } from '../../utils';

describe('log HTTP endpoints', () => {
    const suite = createTestSuite();
    let baseURL: string;
    let authorization: string;

    beforeAll(async () => {
        await suite.setup();
        baseURL = suite.client().getBaseURL().replace(/\/+$/, '');
        authorization = await createAdminAuthorizationHeader();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    const logPayload = {
        message: 'Test log entry',
        level: LogLevel.INFORMATIONAL,
        service: 'test-service',
        channel: LogChannel.HTTP,
        labels: { foo: 'bar', ref_type: 'analysis' },
    };

    describe('POST /logs', () => {
        it('should create log with 201 status', async () => {
            const response = await fetch(`${baseURL}/logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authorization,
                },
                body: JSON.stringify(logPayload),
            });

            expect(response.status).toBe(201);
        });

        it('should return log entity with time and message', async () => {
            const response = await fetch(`${baseURL}/logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authorization,
                },
                body: JSON.stringify(logPayload),
            });

            const body = await response.json();
            expect(body.time).toBeDefined();
            expect(body.message).toBe(logPayload.message);
            expect(body.level).toBe(logPayload.level);
            expect(body.channel).toBe(logPayload.channel);
            expect(body.labels).toBeDefined();
            expect(body.labels.foo).toBe('bar');
            expect(body.labels.ref_type).toBe('analysis');
        });
    });

    describe('GET /logs', () => {
        it('should return collection with label filter', async () => {
            // VictoriaLogs buffers before writing to disk
            await wait(1_000);

            const response = await fetch(`${baseURL}/logs?filter[foo]=bar`, {
                method: 'GET',
                headers: { Authorization: authorization },
            });

            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body.data).toBeDefined();
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.data.length).toBeGreaterThanOrEqual(1);
            expect(body.meta).toBeDefined();
            expect(body.meta.total).toBeDefined();
            expect(body.meta.limit).toBeDefined();
            expect(body.meta.offset).toBeDefined();
        });

        it('should return 400 when no filter labels provided', async () => {
            const response = await fetch(`${baseURL}/logs`, {
                method: 'GET',
                headers: { Authorization: authorization },
            });

            expect(response.status).toBe(400);
        });

        it('should support pagination params', async () => {
            // VictoriaLogs buffers before writing to disk
            await wait(1_000);

            const response = await fetch(`${baseURL}/logs?filter[foo]=bar&page[limit]=1&page[offset]=0`, {
                method: 'GET',
                headers: { Authorization: authorization },
            });

            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body.data.length).toBeLessThanOrEqual(1);
            expect(body.meta.limit).toBe(1);
            expect(body.meta.offset).toBe(0);
        });
    });

    describe('DELETE /logs', () => {
        it('should delete logs with 202 status', async () => {
            const response = await fetch(`${baseURL}/logs?filter[foo]=bar`, {
                method: 'DELETE',
                headers: { Authorization: authorization },
            });

            expect(response.status).toBe(202);
        });

        it('should return 400 when no filter labels provided', async () => {
            const response = await fetch(`${baseURL}/logs`, {
                method: 'DELETE',
                headers: { Authorization: authorization },
            });

            expect(response.status).toBe(400);
        });
    });
});
