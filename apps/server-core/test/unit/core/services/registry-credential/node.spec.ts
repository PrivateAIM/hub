/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { BuiltInPolicyType, PermissionError } from '@authup/access';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import type { Node, Registry, RegistryProject } from '@privateaim/core-kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import { FakePermissionEvaluator } from '@authup/server-test-kit';
import { createAllowAllActor, createScopedActor } from '@privateaim/server-test-kit';
import { PermissionName } from '@privateaim/kit';
import { describe, expect, it } from 'vitest';
import { NodeRegistryCredentialService } from '../../../../../src/core/services/registry-credential/index.ts';
import { FakeNodeRepository } from '../../entities/node/fake-repository.ts';
import { FakeRegistryProjectRepository } from '../../entities/registry-project/fake-repository.ts';
import { FakeRegistryRepository } from '../../entities/registry/fake-repository.ts';
import { createPermissionActor } from '../../helpers/index.ts';

/**
 * The node's own OAuth2 client — a client-type identity of `realmId` that
 * holds no management permission.
 */
function nodeClientActor(clientId: string, realmId = 'realm-b'): ActorContext {
    return createPermissionActor({
        realm: { id: realmId, name: 'node-realm' },
        identity: {
            type: 'client',
            id: clientId,
            realmId,
        },
    });
}

/**
 * Holds exactly `permissions`, each scoped `own` to `realmId`: an evaluation
 * naming a `realmMatch` passes only for that realm.
 */
function ownRealmGrantActor(realmId: string, permissions: string[]): ActorContext {
    return {
        permissionEvaluator: new FakePermissionEvaluator(({ ctx, method }) => {
            const names = Array.isArray(ctx.name) ? ctx.name : [ctx.name];
            const held = method.endsWith('OneOf') ?
                names.some((name) => permissions.includes(name)) :
                names.every((name) => permissions.includes(name));

            const reached = !ctx.data?.has(BuiltInPolicyType.REALM_MATCH) ||
                ctx.data.get(BuiltInPolicyType.REALM_MATCH) === realmId;

            if (!held || !reached) {
                throw PermissionError.evaluationFailed(ctx.name);
            }
        }),
        realm: { id: realmId, name: 'node-realm' },
        identity: {
            id: randomUUID(),
            type: 'user',
            realmId,
        },
    };
}

function userActor(): ActorContext {
    // A plain user without REGISTRY_MANAGE.
    return createPermissionActor({ realm: { id: randomUUID(), name: 'some-realm' } });
}

/**
 * A master-realm member who does NOT hold REGISTRY_MANAGE — used to prove that
 * realm membership alone never grants access.
 */
function masterRealmWithoutPermissionActor(): ActorContext {
    return createPermissionActor({ realm: { id: randomUUID(), name: REALM_MASTER_NAME } });
}

/**
 * A node administrator: holds NODE_UPDATE but NOT REGISTRY_MANAGE, reaching
 * `realmId` only.
 */
function nodeAdminActor(realmId = 'realm-b'): ActorContext {
    return ownRealmGrantActor(realmId, [PermissionName.NODE_UPDATE]);
}

/** A registry manager: holds REGISTRY_MANAGE only, reaching `realmId` only. */
function registryManagerActor(realmId = 'realm-b'): ActorContext {
    return ownRealmGrantActor(realmId, [PermissionName.REGISTRY_MANAGE]);
}

const NODE_ID = randomUUID();
const REGISTRY_ID = randomUUID();
const REGISTRY_PROJECT_ID = randomUUID();

function buildService(opts: {
    node?: Partial<Node>;
    registry?: Partial<Registry>;
    registryProject?: Partial<RegistryProject>;
}) {
    const repository = new FakeNodeRepository();

    if (opts.node) {
        repository.seed(repository.create(opts.node));
    }

    const registryRepository = new FakeRegistryRepository();

    if (opts.registry) {
        registryRepository.seed(registryRepository.create(opts.registry));
    }

    const registryProjectRepository = new FakeRegistryProjectRepository();

    if (opts.registryProject) {
        registryProjectRepository.seed(registryProjectRepository.create(opts.registryProject));
    }

    return new NodeRegistryCredentialService({
        repository,
        registryRepository,
        registryProjectRepository,
    });
}

function baseNode(overrides: Partial<Node> = {}): Partial<Node> {
    return {
        id: NODE_ID,
        realmId: 'realm-b',
        clientId: 'node-client-1',
        registryProjectId: REGISTRY_PROJECT_ID,
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
        registryId: REGISTRY_ID,
        externalName: 'node-project',
        accountName: 'robot$node-project',
        accountSecret: 'the-secret',
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

        const credentials = await service.getCredentials(NODE_ID, createScopedActor({ realmScope: 'any' }));

        expect(credentials).toEqual({
            host: 'registry.example.com',
            externalName: 'node-project',
            accountName: 'robot$node-project',
            accountSecret: 'the-secret',
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

        expect(credentials.accountSecret).toBe('the-secret');
        expect(credentials.host).toBe('registry.example.com');
    });

    it('should deny a different client', async () => {
        const service = fullSetup();

        await expect(
            service.getCredentials(NODE_ID, nodeClientActor('some-other-client')),
        ).rejects.toThrow(PermissionDeniedError);
    });

    // `node.clientId` is writable by node managers: pointing a node at a
    // client of another realm must not hand that client the secret.
    it('should not bind a client of another realm', async () => {
        const service = fullSetup();

        await expect(
            service.getCredentials(NODE_ID, nodeClientActor('node-client-1', 'realm-a')),
        ).rejects.toThrow(PermissionDeniedError);
    });

    it('should return the credentials for a node administrator of the node\'s realm', async () => {
        // Whoever may update the node already owns the whole lifecycle of that
        // registry project: connecting provisions it, disconnecting destroys it,
        // reconnecting rotates the robot account. Withholding the secret from
        // them while letting them rotate it is inconsistent — and the secret is
        // scoped to this node's own project, nothing else in the registry.
        const service = fullSetup();

        const credentials = await service.getCredentials(NODE_ID, nodeAdminActor());

        expect(credentials.accountSecret).toBe('the-secret');
    });

    it('should deny a node administrator of a different realm', async () => {
        // NODE_UPDATE is realm-scoped: it never reaches another realm's node.
        const service = fullSetup();

        await expect(
            service.getCredentials(NODE_ID, nodeAdminActor('other-realm')),
        ).rejects.toThrow(PermissionDeniedError);
    });

    it('should return the credentials for a registry manager reaching the node\'s realm', async () => {
        const service = fullSetup();

        const credentials = await service.getCredentials(NODE_ID, registryManagerActor());

        expect(credentials.accountSecret).toBe('the-secret');
    });

    it('should deny a registry manager of a different realm', async () => {
        // REGISTRY_MANAGE is realm-scoped here too: the node's realm decides.
        const service = fullSetup();

        await expect(
            service.getCredentials(NODE_ID, registryManagerActor('other-realm')),
        ).rejects.toThrow(PermissionDeniedError);
    });

    it('should deny a non-master user', async () => {
        const service = fullSetup();

        await expect(
            service.getCredentials(NODE_ID, userActor()),
        ).rejects.toThrow(PermissionDeniedError);
    });

    it('should deny the node\'s own client when the node has no client provisioned', async () => {
        // A null clientId must never match a (also nullish) actor id.
        const service = fullSetup(baseNode({ clientId: null }));

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
            node: baseNode({ registryProjectId: null }),
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
        const service = fullSetup(baseNode({ registryProjectId: null }));

        await expect(
            service.getCredentials(NODE_ID, userActor()),
        ).rejects.toThrow(PermissionDeniedError);
    });
});
