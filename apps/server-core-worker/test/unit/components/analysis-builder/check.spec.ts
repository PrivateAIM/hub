/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import type { ICoreClient } from '@privateaim/core-http-kit';
import { createFakeClient } from '@privateaim/core-http-kit/testing';
import type { Client as DockerClient } from 'docken';
import type { AnalysisBuilderCheckPayload } from '@privateaim/server-core-worker-kit';
import { AnalysisBuilderEvent } from '@privateaim/server-core-worker-kit';
import { describe, expect, it } from 'vitest';
import { ANALYSIS_PROCESS_STALE_THRESHOLD_MS } from '../../../../src/app/components/constants';
import { AnalysisBuilderCheckHandler } from '../../../../src/app/components/analysis-builder/handlers/check/module';
import { FakeComponentHandlerContext } from '../fakes/fake-component-handler-context';
import { FakeDockerClient } from '../fakes/fake-docker-client';
import { FakeDockerError } from '../fakes/fake-docker-error';

// Constructed DIRECTLY — no container, no message bus, no docker daemon. The
// HTTP boundary is a real `Client` on a `MemoryTransport`.

const ANALYSIS_ID = '11111111-1111-1111-1111-111111111111';

const IMAGE_MISSING = new FakeDockerError(404, 'no such image');

function createCoreClient(analysis: Record<string, any> = {}) {
    return createFakeClient({
        handlers: {
            [`GET /analyses/${ANALYSIS_ID}`]: () => ({
                data: {
                    id: ANALYSIS_ID,
                    buildStatus: null,
                    distributionStatus: null,
                    updatedAt: new Date().toISOString(),
                    ...analysis,
                },
                meta: {},
            }),
        },
    });
}

const PAYLOAD: AnalysisBuilderCheckPayload = { id: ANALYSIS_ID };

function run(coreClient: ICoreClient, docker: FakeDockerClient) {
    const context = new FakeComponentHandlerContext();
    const handler = new AnalysisBuilderCheckHandler({
        coreClient,
        // `docken`'s Client is a concrete class, not a port, so the fake cannot
        // structurally satisfy it — the one cast the architecture forces.
        docker: docker as unknown as DockerClient,
    });

    return handler.handle(PAYLOAD, context).then(() => context);
}

describe('AnalysisBuilderCheckHandler', () => {
    it('should report EXECUTED with the image metadata when the local image exists', async () => {
        const docker = new FakeDockerClient({
            inspectInfo: {
                Id: 'sha256:abc', 
                Os: 'linux', 
                Size: 1234, 
            }, 
        });

        const context = await run(createCoreClient(), docker);

        expect(context.lastEvent()).toMatchObject({
            event: AnalysisBuilderEvent.CHECK_FINISHED,
            payload: {
                status: ProcessStatus.EXECUTED,
                hash: 'sha256:abc',
                os: 'linux',
                size: 1234,
            },
        });
        expect(docker.calls[0].name).toContain(ANALYSIS_ID);
    });

    it('should report FAILED when the image is absent and no build ever ran', async () => {
        const docker = new FakeDockerClient({ inspectError: IMAGE_MISSING });

        const context = await run(createCoreClient({ buildStatus: null }), docker);

        expect(context.lastEvent()).toMatchObject({
            event: AnalysisBuilderEvent.CHECK_FINISHED,
            payload: { status: ProcessStatus.FAILED },
        });
    });

    it('should keep an in-flight build status when the image is absent but fresh', async () => {
        const docker = new FakeDockerClient({ inspectError: IMAGE_MISSING });

        const context = await run(
            createCoreClient({ buildStatus: ProcessStatus.STARTED, updatedAt: new Date().toISOString() }),
            docker,
        );

        expect(context.lastEvent().payload.status).toBe(ProcessStatus.STARTED);
    });

    it('should recover a stale in-flight build as FAILED', async () => {
        const docker = new FakeDockerClient({ inspectError: IMAGE_MISSING });

        const context = await run(
            createCoreClient({
                buildStatus: ProcessStatus.STARTING,
                updatedAt: new Date(Date.now() - ANALYSIS_PROCESS_STALE_THRESHOLD_MS - 1000).toISOString(),
            }),
            docker,
        );

        expect(context.lastEvent().payload.status).toBe(ProcessStatus.FAILED);
    });

    it('should FAIL a previously-executed build whose image vanished with no distribution to explain it', async () => {
        // Fail-safe branch: the local image may only be missing while a
        // distribution accounts for its removal.
        const docker = new FakeDockerClient({ inspectError: IMAGE_MISSING });

        const context = await run(
            createCoreClient({ buildStatus: ProcessStatus.EXECUTED, distributionStatus: null }),
            docker,
        );

        expect(context.lastEvent().payload.status).toBe(ProcessStatus.FAILED);
    });

    it.each([
        ProcessStatus.FAILED,
        ProcessStatus.STOPPED,
    ])('should FAIL a previously-executed build when distribution is %s', async (distributionStatus) => {
        const docker = new FakeDockerClient({ inspectError: IMAGE_MISSING });

        const context = await run(
            createCoreClient({ buildStatus: ProcessStatus.EXECUTED, distributionStatus }),
            docker,
        );

        expect(context.lastEvent().payload.status).toBe(ProcessStatus.FAILED);
    });

    it('should keep EXECUTED when a live distribution explains the missing image', async () => {
        const docker = new FakeDockerClient({ inspectError: IMAGE_MISSING });

        const context = await run(
            createCoreClient({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTED,
            }),
            docker,
        );

        expect(context.lastEvent().payload.status).toBe(ProcessStatus.EXECUTED);
    });

    it('should fail the check when docker itself is unreachable', async () => {
        // Anything but "no such image" means the image state is unknown, so no
        // verdict may be made — it must propagate, not be downgraded to FAILED.
        const docker = new FakeDockerClient({ inspectError: new FakeDockerError(500, 'daemon down') });

        const context = await run(createCoreClient(), docker);

        expect(context.lastEvent().event).toBe(AnalysisBuilderEvent.CHECK_FAILED);
        expect(context.eventsOf(AnalysisBuilderEvent.CHECK_FINISHED)).toHaveLength(0);
    });

    it('should emit CHECK_STARTED before doing any work', async () => {
        const context = await run(createCoreClient(), new FakeDockerClient({ inspectError: IMAGE_MISSING }));

        expect(context.emitted[0].event).toBe(AnalysisBuilderEvent.CHECK_STARTED);
    });
});
