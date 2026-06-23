/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import type { Node, Registry, RegistryProject } from '@privateaim/core-kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import { createAllowAllActor } from '@privateaim/server-test-kit';
import { describe, expect, it } from 'vitest';
import { NodeRegistryCredentialService } from '../../../../../src/core/services/registry-credential/index.ts';
import type {
    INodeRepository,
    IRegistryProjectRepository,
    IRegistryRepository,
} from '../../../../../src/core/index.ts';

function createNodeRepository(nodes: Partial<Node>[]): INodeRepository {
    return { findOneById: async (id: string) => nodes.find((n) => n.id === id) ?? null } as unknown as INodeRepository;
}

function createRegistryRepository(registries: Partial<Registry>[]): IRegistryRepository {
    return { findOneById: async (id: string) => registries.find((r) => r.id === id) ?? null } as unknown as IRegistryRepository;
}

function createRegistryProjectRepository(projects: Partial<RegistryProject>[]): IRegistryProjectRepository {
    return { findOneWithSecret: async (id: string) => projects.find((p) => p.id === id) ?? null } as unknown as IRegistryProjectRepository;
}

/**
 * The node's own OAuth2 client — a client-type identity that holds no
 * management permission, in a non-master realm.
 */
function nodeClientActor(clientId: string): ActorContext {
    return {
        realm: { name: 'node-realm' },
        identity: { type: 'client', id: clientId },
        permissionChecker: { preCheck: async () => { throw new Error('forbidden'); } },
    } as unknown as ActorContext;
}

function userActor(): ActorContext {
    return {
        realm: { name: 'some-realm' },
        identity: { type: 'user', id: randomUUID() },
        // A plain user without REGISTRY_MANAGE.
        permissionChecker: { preCheck: async () => { throw new Error('forbidden'); } },
    } as unknown as ActorContext;
}

/**
 * A master-realm member who does NOT hold REGISTRY_MANAGE — used to prove that
 * realm membership alone never grants access.
 */
function masterRealmWithoutPermissionActor(): ActorContext {
    return {
        realm: { name: REALM_MASTER_NAME },
        identity: { type: 'user', id: randomUUID() },
        permissionChecker: { preCheck: async () => { throw new Error('forbidden'); } },
    } as unknown as ActorContext;
}

const NODE_ID = randomUUID();
const REGISTRY_ID = randomUUID();
const REGISTRY_PROJECT_ID = randomUUID();

function buildService(opts: {
    node?: Partial<Node>;
    registry?: Partial<Registry>;
    registryProject?: Partial<RegistryProject>;
}) {
    return new NodeRegistryCredentialService({
        repository: createNodeRepository(opts.node ? [opts.node] : []),
        registryRepository: createRegistryRepository(opts.registry ? [opts.registry] : []),
        registryProjectRepository: createRegistryProjectRepository(opts.registryProject ? [opts.registryProject] : []),
    });
}

function baseNode(overrides: Partial<Node> = {}): Partial<Node> {
    return {
        id: NODE_ID,
        realm_id: 'realm-b',
        client_id: 'node-client-1',
        registry_project_id: REGISTRY_PROJECT_ID,
        ...overrides,
    };
}

function baseRegistry(overrides: Partial<Registry> = {}): Partial<Registry> {
    return {
        id: REGISTRY_ID,
        host: 'registry.example.com',
        ...overrides,
    };
}

function baseRegistryProject(overrides: Partial<RegistryProject> = {}): Partial<RegistryProject> {
    return {
        id: REGISTRY_PROJECT_ID,
        registry_id: REGISTRY_ID,
        external_name: 'node-project',
        account_name: 'robot$node-project',
        account_secret: 'the-secret',
        ...overrides,
    };
}

function fullSetup(node: Partial<Node> = baseNode()) {
    return buildService({
        node,
        registry: baseRegistry(),
        registryProject: baseRegistryProject(),
    });
}

describe('NodeRegistryCredentialService', () => {
    it('should return the registry credentials for a permitted manager', async () => {
        const service = fullSetup();

        const credentials = await service.getCredentials(NODE_ID, createAllowAllActor());

        expect(credentials).toEqual({
            host: 'registry.example.com',
            external_name: 'node-project',
            account_name: 'robot$node-project',
            account_secret: 'the-secret',
        });
    });

    it('should deny a master-realm member that lacks the permission', async () => {
        // Realm membership is not a permission: without REGISTRY_MANAGE, even a
        // master-realm member must be denied.
        const service = fullSetup();

        await expect(
            service.getCredentials(NODE_ID, masterRealmWithoutPermissionActor()),
        ).rejects.toThrow(PermissionDeniedError);
    });

    it('should return the registry credentials for the node\'s own client', async () => {
        const service = fullSetup();

        const credentials = await service.getCredentials(NODE_ID, nodeClientActor('node-client-1'));

        expect(credentials.account_secret).toBe('the-secret');
        expect(credentials.host).toBe('registry.example.com');
    });

    it('should deny a different client', async () => {
        const service = fullSetup();

        await expect(
            service.getCredentials(NODE_ID, nodeClientActor('some-other-client')),
        ).rejects.toThrow(PermissionDeniedError);
    });

    it('should deny a non-master user', async () => {
        const service = fullSetup();

        await expect(
            service.getCredentials(NODE_ID, userActor()),
        ).rejects.toThrow(PermissionDeniedError);
    });

    it('should deny the node\'s own client when the node has no client provisioned', async () => {
        // A null client_id must never match a (also nullish) actor id.
        const service = fullSetup(baseNode({ client_id: null }));

        await expect(
            service.getCredentials(NODE_ID, nodeClientActor('node-client-1')),
        ).rejects.toThrow(PermissionDeniedError);
    });

    it('should 404 for an unknown node', async () => {
        const service = fullSetup();

        await expect(
            service.getCredentials(randomUUID(), createAllowAllActor()),
        ).rejects.toThrow(EntityNotFoundError);
    });

    it('should reject when the node has no registry project provisioned', async () => {
        const service = buildService({
            node: baseNode({ registry_project_id: null }),
            registry: baseRegistry(),
            registryProject: baseRegistryProject(),
        });

        await expect(
            service.getCredentials(NODE_ID, createAllowAllActor()),
        ).rejects.toThrow(BadRequestError);
    });

    it('should reject when the registry project cannot be found', async () => {
        const service = buildService({
            node: baseNode(),
            registry: baseRegistry(),
            // no registry project seeded
        });

        await expect(
            service.getCredentials(NODE_ID, createAllowAllActor()),
        ).rejects.toThrow(BadRequestError);
    });

    it('should reject when the registry cannot be found', async () => {
        const service = buildService({
            node: baseNode(),
            // no registry seeded
            registryProject: baseRegistryProject(),
        });

        await expect(
            service.getCredentials(NODE_ID, createAllowAllActor()),
        ).rejects.toThrow(BadRequestError);
    });

    it('should authorize before exposing provisioning state', async () => {
        // An unauthorized actor on an unprovisioned node must be denied, never
        // leak provisioning state via BadRequestError.
        const service = fullSetup(baseNode({ registry_project_id: null }));

        await expect(
            service.getCredentials(NODE_ID, userActor()),
        ).rejects.toThrow(PermissionDeniedError);
    });
});
