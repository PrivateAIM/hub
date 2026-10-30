/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

// eslint-disable-next-line max-classes-per-file
import { createFakeClient } from '@privateaim/core-http-kit/testing';
import { createFakeClient as createFakeStorageClient } from '@privateaim/storage-kit/testing';
import type { AnalysisBuilderExecutePayload, AnalysisDistributorExecutePayload } from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderCommand,
    AnalysisBuilderEvent,
    AnalysisDistributorCommand,
    AnalysisDistributorEvent,
} from '@privateaim/server-core-worker-kit';
import type { Client as DockerClient, Progress } from 'docken';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { AnalysisBuilderExecuteHandler } from '../../../src/app/components/analysis-builder/handlers/execute/module';
import { AnalysisDistributorExecuteHandler } from '../../../src/app/components/analysis-distributor/handlers/execute/module';
import { ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS } from '../../../src/app/components/constants';
import { FakeComponentHandlerContext } from './fakes/fake-component-handler-context';

// Pins the heartbeat WIRING in both execute handlers: started in handle(),
// fed by onProgress, stopped in finally. `handleInternal` is replaced by a
// step that reports progress and then hangs until released — the one long
// docker step the heartbeat exists for. No docker daemon is reached.

const ANALYSIS_ID = '88888888-8888-8888-8888-888888888888';
const PROGRESS: Progress = {
    percent: 42,
    current: 42,
    total: 100,
};

type Release = () => void;

function hangAfterProgress(onProgress: ((progress: Progress) => void) | undefined, setRelease: (release: Release) => void) {
    onProgress?.(PROGRESS);

    return new Promise<void>((resolve) => {
        setRelease(resolve);
    });
}

class HangingBuilderHandler extends AnalysisBuilderExecuteHandler {
    release: Release = () => {};

    async handleInternal(
        _value: AnalysisBuilderExecutePayload,
        _context: unknown,
        onProgress?: (progress: Progress) => void,
    ): Promise<void> {
        await hangAfterProgress(onProgress, (release) => {
            this.release = release;
        });
    }
}

class HangingDistributorHandler extends AnalysisDistributorExecuteHandler {
    release: Release = () => {};

    async handleInternal(
        _value: AnalysisDistributorExecutePayload,
        _context: unknown,
        onProgress?: (progress: Progress) => void,
    ): Promise<void> {
        await hangAfterProgress(onProgress, (release) => {
            this.release = release;
        });
    }
}

// `docken`'s `Client` is a concrete class, not a port; the replaced
// `handleInternal` never reaches it.
const docker = undefined as unknown as DockerClient;

describe('execute handler heartbeat', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should re-emit the builder\'s last progress while a step hangs, and stop after', async () => {
        const handler = new HangingBuilderHandler({
            coreClient: createFakeClient(),
            storageClient: createFakeStorageClient(),
            docker,
        });
        const context = new FakeComponentHandlerContext(AnalysisBuilderCommand.EXECUTE);

        const promise = handler.handle({ id: ANALYSIS_ID }, context);

        await vi.advanceTimersByTimeAsync(ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS);
        expect(context.eventsOf(AnalysisBuilderEvent.EXECUTION_PROGRESS)).toEqual([
            expect.objectContaining({ payload: { id: ANALYSIS_ID, progress: PROGRESS } }),
        ]);

        handler.release();
        await promise;

        await vi.advanceTimersByTimeAsync(ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS * 3);
        expect(context.eventsOf(AnalysisBuilderEvent.EXECUTION_PROGRESS)).toHaveLength(1);
    });

    it('should re-emit the distributor\'s last progress while a step hangs, and stop after', async () => {
        const handler = new HangingDistributorHandler({ coreClient: createFakeClient(), docker });
        const context = new FakeComponentHandlerContext(AnalysisDistributorCommand.EXECUTE);

        const promise = handler.handle({ id: ANALYSIS_ID }, context);

        await vi.advanceTimersByTimeAsync(ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS);
        expect(context.eventsOf(AnalysisDistributorEvent.EXECUTION_PROGRESS)).toEqual([
            expect.objectContaining({ payload: { id: ANALYSIS_ID, progress: PROGRESS } }),
        ]);

        handler.release();
        await promise;

        await vi.advanceTimersByTimeAsync(ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS * 3);
        expect(context.eventsOf(AnalysisDistributorEvent.EXECUTION_PROGRESS)).toHaveLength(1);
    });
});
