/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import { createFakeClient } from '@privateaim/core-http-kit/testing';
import { AnalysisDistributorEvent } from '@privateaim/server-core-worker-kit';
import { describe, expect, it } from 'vitest';
import { ANALYSIS_PROCESS_STALE_THRESHOLD_MS } from '../../../../src/app/components/constants';
import { AnalysisDistributorCheckHandler } from '../../../../src/app/components/analysis-distributor/handlers/check/module';
import { FakeComponentHandlerContext } from '../fakes/fake-component-handler-context';
import { FakeDockerClient } from '../fakes/fake-docker-client';
import { FakeDockerError } from '../fakes/fake-docker-error';

// Constructed DIRECTLY — the worker components are already constructor-injected,
// so no container, no message bus and no docker daemon are involved. The HTTP
// boundary is a real `Client` on a `MemoryTransport`.

const ANALYSIS_ID = '11111111-1111-1111-1111-111111111111';
const NODE_ID = '22222222-2222-2222-2222-222222222222';
const REGISTRY_ID = '33333333-3333-3333-3333-333333333333';

type Overrides = {
    analysis?: Record<string, any>,
    analysisNodes?: Record<string, any>[],
    nodes?: Record<string, any>[]
};

function createCoreClient(overrides: Overrides = {}) {
    const analysis = {
        id: ANALYSIS_ID,
        registry_id: REGISTRY_ID,
        distribution_status: null,
        updated_at: new Date().toISOString(),
        ...overrides.analysis,
    };

    const analysisNodes = overrides.analysisNodes ?? [{
        id: 'an-1', 
        analysis_id: ANALYSIS_ID, 
        node_id: NODE_ID, 
    }];
    const nodes = overrides.nodes ?? [{
        id: NODE_ID,
        name: 'node-a',
        registry_project: { id: 'rp-1', external_name: 'project-a' },
    }];

    return createFakeClient({
        handlers: {
            [`GET /analyses/${ANALYSIS_ID}`]: () => ({ data: analysis, meta: {} }),
            // `getManyAll` pages until `offset >= meta.total`, so `total` MUST
            // agree with the rows emitted or the loop never terminates.
            'GET /analysis-nodes': () => ({ data: analysisNodes, meta: { total: analysisNodes.length } }),
            'GET /nodes': () => ({ data: nodes, meta: { total: nodes.length } }),
            [`GET /registries/${REGISTRY_ID}`]: () => ({
                data: {
                    id: REGISTRY_ID,
                    host: 'registry.fake.test',
                    account_name: 'robot',
                    account_secret: 'secret',
                },
                meta: {},
            }),
        },
    });
}

function createHandler(coreClient: any, docker: FakeDockerClient) {
    return new AnalysisDistributorCheckHandler({ coreClient, docker: docker as any });
}

describe('AnalysisDistributorCheckHandler', () => {
    it('should report EXECUTED when every node image resolves', async () => {
        const coreClient = createCoreClient();
        const docker = new FakeDockerClient();
        const context = new FakeComponentHandlerContext();

        await createHandler(coreClient, docker).handle({ id: ANALYSIS_ID } as any, context as any);

        expect(context.lastEvent()).toMatchObject({
            event: AnalysisDistributorEvent.CHECK_FINISHED,
            payload: { status: ProcessStatus.EXECUTED },
        });

        // The image URL is assembled from registry host + registry project
        // external name + analysis id.
        expect(docker.calls).toHaveLength(1);
        expect(docker.calls[0].name).toContain(`registry.fake.test/project-a/${  ANALYSIS_ID}`);
    });

    it('should request the registry secret explicitly and pass it to docker', async () => {
        const coreClient = createCoreClient();
        const docker = new FakeDockerClient();
        const context = new FakeComponentHandlerContext();

        await createHandler(coreClient, docker).handle({ id: ANALYSIS_ID } as any, context as any);

        // `account_secret` is `select: false` server-side, so the worker has to
        // opt in via `fields=+account_secret`.
        const registryRequest = coreClient.requests.find((request) => request.url.includes('/registries/'));
        expect(decodeURIComponent(registryRequest.url)).toContain('account_secret');

        expect(docker.calls[0].authconfig).toMatchObject({ username: 'robot', password: 'secret' });
    });

    it('should finish early when the analysis has no nodes', async () => {
        const coreClient = createCoreClient({ analysisNodes: [] });
        const docker = new FakeDockerClient();
        const context = new FakeComponentHandlerContext();

        await createHandler(coreClient, docker).handle({ id: ANALYSIS_ID } as any, context as any);

        expect(context.lastEvent().event).toBe(AnalysisDistributorEvent.CHECK_FINISHED);
        expect(context.lastEvent().payload.status).toBeUndefined();
        expect(docker.calls).toHaveLength(0);
    });

    it('should finish early when no node records resolve', async () => {
        const coreClient = createCoreClient({ nodes: [] });
        const docker = new FakeDockerClient();
        const context = new FakeComponentHandlerContext();

        await createHandler(coreClient, docker).handle({ id: ANALYSIS_ID } as any, context as any);

        expect(context.lastEvent().event).toBe(AnalysisDistributorEvent.CHECK_FINISHED);
        expect(docker.calls).toHaveLength(0);
    });

    it('should fail the check when the analysis has no registry assigned', async () => {
        // `analysis.registry_id` is nullable and the FK detaches on SET NULL.
        const coreClient = createCoreClient({ analysis: { registry_id: null } });
        const docker = new FakeDockerClient();
        const context = new FakeComponentHandlerContext();

        await createHandler(coreClient, docker).handle({ id: ANALYSIS_ID } as any, context as any);

        expect(context.lastEvent().event).toBe(AnalysisDistributorEvent.CHECK_FAILED);
        expect(coreClient.requests.some((request) => request.url.includes('/registries/null'))).toBe(false);
    });

    it('should fail the check when a node has no registry project', async () => {
        const coreClient = createCoreClient({
            nodes: [{
                id: NODE_ID, 
                name: 'node-a', 
                registry_project: null, 
            }], 
        });
        const docker = new FakeDockerClient();
        const context = new FakeComponentHandlerContext();

        await createHandler(coreClient, docker).handle({ id: ANALYSIS_ID } as any, context as any);

        expect(context.lastEvent().event).toBe(AnalysisDistributorEvent.CHECK_FAILED);
    });

    it('should report FAILED when the image is missing and no distribution is in flight', async () => {
        const coreClient = createCoreClient();
        const docker = new FakeDockerClient({ distributionError: new FakeDockerError(404) });
        const context = new FakeComponentHandlerContext();

        await createHandler(coreClient, docker).handle({ id: ANALYSIS_ID } as any, context as any);

        expect(context.lastEvent()).toMatchObject({
            event: AnalysisDistributorEvent.CHECK_FINISHED,
            payload: { status: ProcessStatus.FAILED },
        });
    });

    it('should keep an in-flight distribution status when the image is missing but fresh', async () => {
        const coreClient = createCoreClient({
            analysis: {
                distribution_status: ProcessStatus.STARTED,
                updated_at: new Date().toISOString(),
            },
        });
        const docker = new FakeDockerClient({ distributionError: new FakeDockerError(404) });
        const context = new FakeComponentHandlerContext();

        await createHandler(coreClient, docker).handle({ id: ANALYSIS_ID } as any, context as any);

        expect(context.lastEvent().payload.status).toBe(ProcessStatus.STARTED);
    });

    it('should recover a stale in-flight distribution as FAILED', async () => {
        const coreClient = createCoreClient({
            analysis: {
                distribution_status: ProcessStatus.STARTED,
                updated_at: new Date(Date.now() - ANALYSIS_PROCESS_STALE_THRESHOLD_MS - 1000).toISOString(),
            },
        });
        const docker = new FakeDockerClient({ distributionError: new FakeDockerError(404) });
        const context = new FakeComponentHandlerContext();

        await createHandler(coreClient, docker).handle({ id: ANALYSIS_ID } as any, context as any);

        expect(context.lastEvent().payload.status).toBe(ProcessStatus.FAILED);
    });

    it('should fail the check when docker itself is unreachable', async () => {
        // Anything but a missing-image response means the image state is
        // unknown, so no verdict may be made — it must propagate, not be
        // silently downgraded to FAILED.
        const coreClient = createCoreClient();
        const docker = new FakeDockerClient({ distributionError: new FakeDockerError(500, 'daemon down') });
        const context = new FakeComponentHandlerContext();

        await createHandler(coreClient, docker).handle({ id: ANALYSIS_ID } as any, context as any);

        expect(context.lastEvent().event).toBe(AnalysisDistributorEvent.CHECK_FAILED);
        expect(context.eventsOf(AnalysisDistributorEvent.CHECK_FINISHED)).toHaveLength(0);
    });

    it('should emit CHECK_STARTED before doing any work', async () => {
        const coreClient = createCoreClient();
        const docker = new FakeDockerClient();
        const context = new FakeComponentHandlerContext();

        await createHandler(coreClient, docker).handle({ id: ANALYSIS_ID } as any, context as any);

        expect(context.emitted[0].event).toBe(AnalysisDistributorEvent.CHECK_STARTED);
    });
});
