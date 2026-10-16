/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createFakeClient, fakeResponse } from '@privateaim/core-http-kit/testing';
import { createFakeClient as createFakeStorageClient } from '@privateaim/storage-kit/testing';
import { AnalysisBuilderCommand, AnalysisBuilderEvent } from '@privateaim/server-core-worker-kit';
import { MESSAGE_BUS_MAX_ATTEMPTS } from '@privateaim/server-kit';
import type { Client as DockerClient } from 'docken';
import { createClientError } from 'hapic';
import { describe, expect, it } from 'vitest';
import { AnalysisBuilderExecuteHandler } from '../../../src/app/components/analysis-builder/handlers/execute/module';
import { isRetryableFailure, isTransientError } from '../../../src/app/components/helpers';
import { FakeComponentHandlerContext } from './fakes/fake-component-handler-context';
import { FakeDockerClient } from './fakes/fake-docker-client';
import { FakeDockerError } from './fakes/fake-docker-error';

const ANALYSIS_ID = '99999999-9999-9999-9999-999999999999';

function createNodeError(code: string, syscall?: string) {
    return Object.assign(new Error(code), { code, syscall });
}

function createHttpError(status: number) {
    return createClientError({
        request: { url: '/analyses' },
        response: new Response(null, { status }),
    });
}

describe('isTransientError', () => {
    it.each([
        ['a request that got no response', createClientError({ request: { url: '/analyses' } })],
        ['an HTTP 503', createHttpError(503)],
        ['an HTTP 429', createHttpError(429)],
        ['a docker daemon 500', new FakeDockerError(500)],
        ['a refused connection', createNodeError('ECONNREFUSED', 'connect')],
        ['a socket hang up', createNodeError('ECONNRESET')],
        ['a missing docker socket', createNodeError('ENOENT', 'connect')],
    ])('should classify %s as transient', (_, error) => {
        expect(isTransientError(error)).toBe(true);
    });

    it.each([
        ['an HTTP 404', createHttpError(404)],
        ['an HTTP 400', createHttpError(400)],
        ['a docker 404', new FakeDockerError(404)],
        ['a missing file', createNodeError('ENOENT', 'open')],
        ['a build error', new Error('The command \'/bin/sh -c exit 1\' returned a non-zero code: 1')],
        ['a non-error', 'boom'],
    ])('should classify %s as permanent', (_, error) => {
        expect(isTransientError(error)).toBe(false);
    });
});

describe('isRetryableFailure', () => {
    const transient = new FakeDockerError(503);

    const delivery = (attempt: number) => ({ delivery: { attempt, maxAttempts: MESSAGE_BUS_MAX_ATTEMPTS } });

    it('should retry a transient error before the last attempt', () => {
        expect(isRetryableFailure(transient, delivery(1))).toBe(true);
        expect(isRetryableFailure(transient, delivery(MESSAGE_BUS_MAX_ATTEMPTS - 1))).toBe(true);
    });

    it('should not retry on the last attempt', () => {
        expect(isRetryableFailure(transient, delivery(MESSAGE_BUS_MAX_ATTEMPTS))).toBe(false);
    });

    it('should not retry without a delivery (no driver retries it)', () => {
        expect(isRetryableFailure(transient, {})).toBe(false);
    });

    it('should not retry a permanent error', () => {
        expect(isRetryableFailure(new FakeDockerError(404), delivery(1))).toBe(false);
    });
});

describe('AnalysisBuilderExecuteHandler failure classification', () => {
    function run(status: number, attempt = 1) {
        const handler = new AnalysisBuilderExecuteHandler({
            coreClient: createFakeClient({ handlers: { 'GET /analyses/:id': () => fakeResponse(status, { message: 'core' }) } }),
            storageClient: createFakeStorageClient(),
            // `docken`'s Client is a concrete class, not a port.
            docker: new FakeDockerClient({ inspectError: new FakeDockerError(404) }) as unknown as DockerClient,
        });
        const context = new FakeComponentHandlerContext(AnalysisBuilderCommand.EXECUTE);
        context.metadata.delivery = { attempt, maxAttempts: MESSAGE_BUS_MAX_ATTEMPTS };

        return { promise: handler.handle({ id: ANALYSIS_ID }, context), context };
    }

    it('should rethrow a transient error for the message bus to retry', async () => {
        const { promise, context } = run(503);

        await expect(promise).rejects.toThrow();
        expect(context.eventsOf(AnalysisBuilderEvent.EXECUTION_FAILED)).toHaveLength(0);
    });

    it('should report a permanent error as EXECUTION_FAILED', async () => {
        const { promise, context } = run(404);

        await expect(promise).resolves.toBeUndefined();
        expect(context.eventsOf(AnalysisBuilderEvent.EXECUTION_FAILED)).toHaveLength(1);
    });

    it('should report a transient error on the last attempt as EXECUTION_FAILED', async () => {
        const { promise, context } = run(503, MESSAGE_BUS_MAX_ATTEMPTS);

        await expect(promise).resolves.toBeUndefined();
        expect(context.eventsOf(AnalysisBuilderEvent.EXECUTION_FAILED)).toHaveLength(1);
    });
});
