/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HarborClient } from '@hapic/harbor';
import { createFakeAuthupClient } from '@privateaim/server-test-kit';
import { MemoryTransport } from 'hapic';
import type { MemoryResponseInit, TransportRequest } from 'hapic';
import { describe, expect, it } from 'vitest';
import { ensureRemoteRegistryProject } from '../../../../../src/app/components/registry/handlers/helpers/remote.ts';
import { ensureRemoteRegistryProjectAccount } from '../../../../../src/app/components/registry/handlers/helpers/remote-robot-account.ts';
import { saveRemoteRegistryProjectWebhook } from '../../../../../src/app/components/registry/handlers/helpers/remote-webhook.ts';

type Handler = (method: string, path: string) => MemoryResponseInit | undefined;

function createHarbor(handler: Handler) {
    const requests: TransportRequest[] = [];
    const transport = new MemoryTransport({
        fetch: (request): MemoryResponseInit => {
            requests.push(request);

            const path = new URL(request.url).pathname.replace('/api/v2.0/', '');
            const response = handler(request.method, path);

            if (!response) {
                throw new Error(`Unexpected Harbor operation: ${request.method} ${path}`);
            }

            return response;
        },
    });

    return {
        client: new HarborClient({ request: { baseURL: 'https://harbor.test/api/v2.0/', transport } }),
        requests,
        body: (method: string, path: string) => {
            const request = requests.find((entry) => entry.method === method &&
                new URL(entry.url).pathname === `/api/v2.0/${path}`);

            return request ? JSON.parse(String(request.body)) : undefined;
        },
    };
}

describe('registry remote helpers (real Harbor client, memory transport)', () => {
    it('updates only the public metadata flag of an existing project', async () => {
        const harbor = createHarbor((method, path) => {
            if (method === 'POST' && path === 'projects') {
                return { status: 409, body: { errors: [{ code: 'CONFLICT', message: 'exists' }] } };
            }

            if (method === 'PUT' && path === 'projects/node') {
                return { status: 200 };
            }

            if (method === 'GET' && path === 'projects/node') {
                return { status: 200, body: { name: 'node', project_id: 7 } };
            }

            return undefined;
        });

        const project = await ensureRemoteRegistryProject(harbor.client, {
            remoteName: 'node',
            remoteOptions: { public: true },
        });

        expect(project.project_id).toBe(7);
        expect(harbor.body('POST', 'projects')).toEqual({ project_name: 'node', public: true });
        expect(harbor.body('PUT', 'projects/node')).toEqual({ metadata: { public: 'true' } });
    });

    it('sends the private flag as a metadata string on re-link', async () => {
        const harbor = createHarbor((method, path) => {
            if (method === 'POST' && path === 'projects') {
                return { status: 409 };
            }

            if (method === 'PUT' && path === 'projects/node') {
                return { status: 200 };
            }

            if (method === 'GET' && path === 'projects/node') {
                return { status: 200, body: { name: 'node', project_id: 7 } };
            }

            return undefined;
        });

        await ensureRemoteRegistryProject(harbor.client, { remoteName: 'node' });

        expect(harbor.body('PUT', 'projects/node')).toEqual({ metadata: { public: 'false' } });
    });

    it('creates a system-level robot account', async () => {
        const harbor = createHarbor((method, path) => {
            if (method === 'POST' && path === 'robots') {
                return {
                    status: 201,
                    body: {
                        id: 3,
                        name: 'robot$node',
                        secret: 'secret',
                    },
                };
            }

            return undefined;
        });

        const robot = await ensureRemoteRegistryProjectAccount(harbor.client, {
            name: 'node',
            account: {},
        });

        expect(robot).toMatchObject({
            id: 3, 
            name: 'robot$node', 
            secret: 'secret', 
        });
        expect(harbor.body('POST', 'robots')).toMatchObject({
            name: 'node',
            level: 'system',
            duration: -1,
            permissions: [expect.objectContaining({ namespace: 'node', kind: 'project' })],
        });
    });

    it('sends the push event type on webhook create and on the conflict update', async () => {
        const harbor = createHarbor((method, path) => {
            if (method === 'POST' && path === 'projects/node/webhook/policies') {
                return { status: 409 };
            }

            if (method === 'GET' && path === 'projects/node/webhook/policies') {
                return { status: 200, body: [{ id: 5, name: 'api' }] };
            }

            if (method === 'PUT' && path === 'projects/node/webhook/policies/5') {
                return { status: 200 };
            }

            return undefined;
        });

        const authupClient = createFakeAuthupClient({ fallback: () => ({ data: { id: 'service-id', secret: 'service-secret' } }) });
        const result = await saveRemoteRegistryProjectWebhook(harbor.client, {
            publicURL: 'https://hub.test/',
            projectIdOrName: 'node',
            isProjectName: true,
            authupClient,
        });

        expect(result).toEqual({ id: 5 });
        expect(harbor.body('POST', 'projects/node/webhook/policies')).toMatchObject({ name: 'api', event_types: ['PUSH_ARTIFACT'] });
        expect(harbor.body('PUT', 'projects/node/webhook/policies/5')).toMatchObject({
            id: 5,
            name: 'api',
            event_types: ['PUSH_ARTIFACT'],
            targets: [expect.objectContaining({ address: 'https://hub.test/services/registry/hook' })],
        });
    });
});
