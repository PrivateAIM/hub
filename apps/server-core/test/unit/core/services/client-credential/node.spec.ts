/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Node } from '@privateaim/core-kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import { createAllowAllActor, createDenyAllActor } from '@privateaim/server-test-kit';
import { describe, expect, it } from 'vitest';
import { NodeClientCredentialService } from '../../../../../src/core/services/client-credential/index.ts';
import type { INodeRepository } from '../../../../../src/core/index.ts';
import { FakeClientCredentialReader } from './fake-credential-reader.ts';

function createNodeRepository(nodes: Partial<Node>[]): INodeRepository {
    return { findOneById: async (id: string) => nodes.find((n) => n.id === id) ?? null } as unknown as INodeRepository;
}

/**
 * A logged-in actor that holds NODE_UPDATE but belongs to a specific
 * (non-master) realm — used to exercise the realm-writable gate.
 */
function realmManagerActor(realmId: string): ActorContext {
    return {
        realm: { id: realmId, name: realmId },
        identity: { type: 'user', id: randomUUID() },
        permissionChecker: { preCheck: async () => { /* permitted */ } },
    } as unknown as ActorContext;
}

const NODE_ID = randomUUID();

function buildService(opts: { node?: Partial<Node>; secret?: string | null }) {
    const reader = new FakeClientCredentialReader(opts.secret);
    const service = new NodeClientCredentialService({
        repository: createNodeRepository(opts.node ? [opts.node] : []),
        credentialReader: reader,
    });
    return { service, reader };
}

function baseNode(overrides: Partial<Node> = {}): Partial<Node> {
    return {
        id: NODE_ID,
        realm_id: 'realm-b',
        client_id: 'node-client-1',
        ...overrides,
    };
}

describe('NodeClientCredentialService', () => {
    it('should return the credentials of the node client for a master-realm member', async () => {
        const { service, reader } = buildService({ node: baseNode() });

        const credentials = await service.getCredentials(NODE_ID, createAllowAllActor());

        expect(credentials).toEqual({ id: 'node-client-1', secret: 'the-secret' });
        expect(reader.calls).toEqual(['node-client-1']);
    });

    it('should return credentials for a same-realm manager', async () => {
        const { service } = buildService({ node: baseNode({ realm_id: 'realm-b' }) });

        const credentials = await service.getCredentials(NODE_ID, realmManagerActor('realm-b'));
        expect(credentials.secret).toBe('the-secret');
    });

    it('should deny a manager from a different realm', async () => {
        const { service, reader } = buildService({ node: baseNode({ realm_id: 'realm-b' }) });

        await expect(
            service.getCredentials(NODE_ID, realmManagerActor('realm-a')),
        ).rejects.toThrow(PermissionDeniedError);
        expect(reader.calls).toHaveLength(0);
    });

    it('should deny an actor without permission', async () => {
        const { service } = buildService({ node: baseNode() });

        await expect(
            service.getCredentials(NODE_ID, createDenyAllActor()),
        ).rejects.toThrow();
    });

    it('should reject when the node has no client provisioned', async () => {
        const { service } = buildService({ node: baseNode({ client_id: null }) });

        await expect(
            service.getCredentials(NODE_ID, createAllowAllActor()),
        ).rejects.toThrow(BadRequestError);
    });

    it('should 404 for an unknown node', async () => {
        const { service } = buildService({});

        await expect(
            service.getCredentials(randomUUID(), createAllowAllActor()),
        ).rejects.toThrow(EntityNotFoundError);
    });

    it('should authorize before exposing provisioning state', async () => {
        // A denied actor on an unprovisioned node must be rejected by the auth
        // gate, never leak provisioning state via BadRequestError.
        const { service, reader } = buildService({ node: baseNode({ client_id: null }) });

        await expect(
            service.getCredentials(NODE_ID, createDenyAllActor()),
        ).rejects.not.toBeInstanceOf(BadRequestError);
        expect(reader.calls).toHaveLength(0);
    });
});
