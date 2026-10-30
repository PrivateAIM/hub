/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { createFakeClient } from '@privateaim/core-http-kit/testing';
import type { Client as DockerClient } from 'docken';
import { AnalysisDistributorCommand, AnalysisDistributorEvent } from '@privateaim/server-core-worker-kit';
import { describe, expect, it } from 'vitest';
import { AnalysisDistributorExecuteHandler } from '../../../../src/app/components/analysis-distributor/handlers/execute/module';
import { FakeComponentHandlerContext } from '../fakes/fake-component-handler-context';
import { FakeDockerClient } from '../fakes/fake-docker-client';
import { FakeDockerError } from '../fakes/fake-docker-error';

const ANALYSIS_ID = '11111111-1111-1111-1111-111111111111';
const NODE_ID = '22222222-2222-2222-2222-222222222222';
const REGISTRY_ID = '33333333-3333-3333-3333-333333333333';
const SOURCE_IMAGE = `${ANALYSIS_ID}:latest`;

function createCoreClient() {
    return createFakeClient({
        handlers: {
            [`GET /analyses/${ANALYSIS_ID}`]: () => ({ data: { id: ANALYSIS_ID, registryId: REGISTRY_ID }, meta: {} }),
            'GET /analysis-nodes': () => ({
                data: [{
                    id: 'an-1', 
                    analysisId: ANALYSIS_ID, 
                    nodeId: NODE_ID, 
                }],
                meta: { total: 1 }, 
            }),
            'GET /nodes': () => ({
                data: [{
                    id: NODE_ID, 
                    name: 'node-a', 
                    registryProject: { id: 'rp-1', externalName: 'project-a' }, 
                }],
                meta: { total: 1 },
            }),
            [`GET /registries/${REGISTRY_ID}`]: () => ({
                data: {
                    id: REGISTRY_ID, 
                    host: 'registry.fake.test', 
                    accountName: 'robot', 
                    accountSecret: 'secret',
                },
                meta: {},
            }),
        },
    });
}

async function run(docker: FakeDockerClient) {
    const context = new FakeComponentHandlerContext(AnalysisDistributorCommand.EXECUTE);
    // `docken`'s `Client` is a concrete class, not a port — the cast the architecture forces.
    const handler = new AnalysisDistributorExecuteHandler({
        coreClient: createCoreClient(),
        docker: docker as unknown as DockerClient,
    });

    let error: unknown;

    try {
        await handler.handle({ id: ANALYSIS_ID }, context);
    } catch (e) {
        error = e;
    }

    return { context, error };
}

describe('AnalysisDistributorExecuteHandler', () => {
    it('should keep the source image and rethrow on a transient push failure', async () => {
        const docker = new FakeDockerClient({ pushError: new FakeDockerError(503) });
        const { context, error } = await run(docker);

        expect(error).toBeInstanceOf(FakeDockerError);
        expect(context.eventsOf(AnalysisDistributorEvent.EXECUTION_FAILED)).toHaveLength(0);
        expect(docker.removed()).not.toContain(SOURCE_IMAGE);
    });

    it('should remove the source image and report a permanent push failure', async () => {
        const docker = new FakeDockerClient({ pushError: new FakeDockerError(400) });
        const { context, error } = await run(docker);

        expect(error).toBeUndefined();
        expect(context.eventsOf(AnalysisDistributorEvent.EXECUTION_FAILED)).toHaveLength(1);
        expect(docker.removed()).toContain(SOURCE_IMAGE);
    });

    it('should remove the source image after a successful push', async () => {
        const docker = new FakeDockerClient();
        const { context, error } = await run(docker);

        expect(error).toBeUndefined();
        expect(context.eventsOf(AnalysisDistributorEvent.EXECUTION_FINISHED)).toHaveLength(1);
        expect(docker.calls.filter((call) => call.operation === 'push')).toHaveLength(1);
        expect(docker.removed()).toContain(SOURCE_IMAGE);
    });
});
