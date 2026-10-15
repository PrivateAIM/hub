/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { BuiltInPolicyType } from '@authup/access';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import type { Analysis, AnalysisNode, Node } from '@privateaim/core-kit';
import { AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import type { ActorContext } from '@privateaim/server-kit';
import { createAllowAllActor, createScopedActor } from '@privateaim/server-test-kit';
import { describe, expect, it } from 'vitest';
import { AnalysisClientCredentialService } from '../../../../../src/core/services/client-credential/index.ts';
import { FakeAnalysisNodeRepository } from '../../entities/analysis-node/fake-repository.ts';
import { FakeAnalysisRepository } from '../../entities/analysis/fake-repository.ts';
import { FakeNodeRepository } from '../../entities/node/fake-repository.ts';
import { createPermissionActor } from '../../helpers/index.ts';
import { FakeClientCredentialStore } from './fake-credential-store.ts';

const NODE_REALM_ID = randomUUID();

function nodeClientActor(clientId: string, realmId = NODE_REALM_ID): ActorContext {
    // A node client has no analysis-management permission.
    return createPermissionActor({
        realm: { id: realmId, name: 'node-realm' },
        identity: {
            type: 'client', 
            id: clientId, 
            realmId, 
        },
    });
}

function userActor(): ActorContext {
    // A plain user without ANALYSIS_UPDATE.
    return createPermissionActor({ realm: { id: randomUUID(), name: 'some-realm' } });
}

/**
 * A master-realm member who does NOT hold ANALYSIS_UPDATE — used to prove that
 * realm membership alone never grants access.
 */
function masterRealmWithoutPermissionActor(): ActorContext {
    return createPermissionActor({ realm: { id: randomUUID(), name: REALM_MASTER_NAME } });
}

const ANALYSIS_ID = randomUUID();
const NODE_ID = randomUUID();

function buildService(opts: {
    analysis?: Partial<Analysis>;
    nodes?: Partial<Node>[];
    analysisNodes?: Partial<AnalysisNode>[];
    secret?: string | null;
}) {
    const repository = new FakeAnalysisRepository();
    if (opts.analysis) repository.seed(repository.create(opts.analysis));

    const nodeRepository = new FakeNodeRepository();
    nodeRepository.seed((opts.nodes || []).map((node) => nodeRepository.create(node)));

    const analysisNodeRepository = new FakeAnalysisNodeRepository();
    analysisNodeRepository.seed((opts.analysisNodes || []).map((entity) => analysisNodeRepository.create(entity)));

    const reader = new FakeClientCredentialStore(opts.secret);
    const service = new AnalysisClientCredentialService({
        repository,
        nodeRepository,
        analysisNodeRepository,
        credentialStore: reader,
    });
    return { service, reader };
}

function baseAnalysis(overrides: Partial<Analysis> = {}): Partial<Analysis> {
    return {
        id: ANALYSIS_ID,
        realmId: randomUUID(),
        clientId: 'analysis-client-1',
        ...overrides,
    };
}

describe('AnalysisClientCredentialService', () => {
    it('should return credentials for a permitted manager', async () => {
        const { service, reader } = buildService({ analysis: baseAnalysis() });

        const credentials = await service.getCredentials(ANALYSIS_ID, createAllowAllActor());

        expect(credentials).toEqual({
            id: 'analysis-client-1',
            name: 'the-name',
            displayName: null,
            secret: 'the-secret',
        });
        expect(reader.calls).toEqual(['analysis-client-1']);
    });

    it('should deny a master-realm member that lacks the permission', async () => {
        // Realm membership is not a permission: without ANALYSIS_UPDATE, even a
        // master-realm member must be denied.
        const { service, reader } = buildService({ analysis: baseAnalysis() });

        await expect(
            service.getCredentials(ANALYSIS_ID, masterRealmWithoutPermissionActor()),
        ).rejects.toThrow(PermissionDeniedError);
        expect(reader.calls).toHaveLength(0);
    });

    it('should return credentials for the client of an approved, assigned node', async () => {
        const { service } = buildService({
            analysis: baseAnalysis(),
            nodes: [{
                id: NODE_ID, 
                clientId: 'node-client-1', 
                realmId: NODE_REALM_ID, 
            }],
            analysisNodes: [{
                analysisId: ANALYSIS_ID,
                nodeId: NODE_ID,
                approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
            }],
        });

        const credentials = await service.getCredentials(ANALYSIS_ID, nodeClientActor('node-client-1'));
        expect(credentials.secret).toBe('the-secret');
    });

    it('should not bind a client of another realm a node points at', async () => {
        // `node.clientId` is writable by node managers: another realm's node
        // naming a client must not make that client the node's.
        const { service, reader } = buildService({
            analysis: baseAnalysis(),
            nodes: [{
                id: NODE_ID, 
                clientId: 'node-client-1', 
                realmId: NODE_REALM_ID, 
            }],
            analysisNodes: [{
                analysisId: ANALYSIS_ID,
                nodeId: NODE_ID,
                approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
            }],
        });

        await expect(
            service.getCredentials(ANALYSIS_ID, nodeClientActor('node-client-1', randomUUID())),
        ).rejects.toThrow(PermissionDeniedError);
        expect(reader.calls).toHaveLength(0);
    });

    it('should deny a node that is assigned but not approved', async () => {
        const { service } = buildService({
            analysis: baseAnalysis(),
            nodes: [{
                id: NODE_ID, 
                clientId: 'node-client-1', 
                realmId: NODE_REALM_ID, 
            }],
            analysisNodes: [{
                analysisId: ANALYSIS_ID,
                nodeId: NODE_ID,
                approvalStatus: null,
            }],
        });

        await expect(
            service.getCredentials(ANALYSIS_ID, nodeClientActor('node-client-1')),
        ).rejects.toThrow(PermissionDeniedError);
    });

    it('should deny a client that is not a node', async () => {
        const { service } = buildService({ analysis: baseAnalysis(), nodes: [] });

        await expect(
            service.getCredentials(ANALYSIS_ID, nodeClientActor('unknown-client')),
        ).rejects.toThrow(PermissionDeniedError);
    });

    it('should deny a non-master user', async () => {
        const { service } = buildService({ analysis: baseAnalysis() });

        await expect(
            service.getCredentials(ANALYSIS_ID, userActor()),
        ).rejects.toThrow(PermissionDeniedError);
    });

    it('should deny a manager of another realm', async () => {
        // ANALYSIS_UPDATE alone is a permission, not a reach: a manager of
        // realm B must not read realm A's analysis client secret.
        const { service, reader } = buildService({ analysis: baseAnalysis() });

        await expect(
            service.getCredentials(ANALYSIS_ID, createScopedActor({ realmScope: 'own' })),
        ).rejects.toThrow(PermissionDeniedError);
        expect(reader.calls).toHaveLength(0);
    });

    it('should return credentials for a manager of the analysis realm', async () => {
        const realmId = randomUUID();
        const { service } = buildService({ analysis: baseAnalysis({ realmId }) });

        const actor = createScopedActor({ realmId, realmScope: 'own' });

        const credentials = await service.getCredentials(ANALYSIS_ID, actor);
        expect(credentials.secret).toBe('the-secret');

        // fully evaluated against the analysis, so attribute policies on the
        // grant apply to the secret read as they do to setCredentials
        const [call] = actor.permissionEvaluator.evaluateCalls;
        expect(call?.name).toBe(PermissionName.ANALYSIS_UPDATE);
        expect(call?.data?.get(BuiltInPolicyType.REALM_MATCH)).toBe(realmId);
        expect(call?.data?.get(BuiltInPolicyType.ATTRIBUTES)).toMatchObject({ id: ANALYSIS_ID });
    });

    it('should reject when the analysis has no client provisioned', async () => {
        const { service } = buildService({ analysis: baseAnalysis({ clientId: null }) });

        await expect(
            service.getCredentials(ANALYSIS_ID, createAllowAllActor()),
        ).rejects.toThrow(BadRequestError);
    });

    it('should 404 for an unknown analysis', async () => {
        const { service } = buildService({});

        await expect(
            service.getCredentials(randomUUID(), createAllowAllActor()),
        ).rejects.toThrow(EntityNotFoundError);
    });

    it('should authorize before exposing provisioning state', async () => {
        // An unauthorized actor on an unprovisioned analysis must be denied,
        // never leak provisioning state via BadRequestError.
        const { service } = buildService({ analysis: baseAnalysis({ clientId: null }) });

        await expect(
            service.getCredentials(ANALYSIS_ID, userActor()),
        ).rejects.toThrow(PermissionDeniedError);
    });

    describe('setCredentials', () => {
        it('should rotate (no secret) for a manager', async () => {
            const { service, reader } = buildService({ analysis: baseAnalysis() });

            const credentials = await service.setCredentials(ANALYSIS_ID, undefined, createAllowAllActor());

            expect(reader.writes).toEqual([{ clientId: 'analysis-client-1', data: { secret: undefined } }]);
            expect(credentials.secret).toBe('generated-secret');
        });

        it('should deny a manager of another realm', async () => {
            const { service, reader } = buildService({ analysis: baseAnalysis() });

            await expect(
                service.setCredentials(ANALYSIS_ID, undefined, createScopedActor({ realmScope: 'own' })),
            ).rejects.toThrow(PermissionDeniedError);
            expect(reader.writes).toHaveLength(0);
        });

        it('should deny a node client that may only read', async () => {
            // The read path allows an approved assigned node; writing must not.
            const { service, reader } = buildService({
                analysis: baseAnalysis(),
                nodes: [{
                    id: NODE_ID, 
                    clientId: 'node-client-1', 
                    realmId: NODE_REALM_ID, 
                }],
                analysisNodes: [{
                    analysisId: ANALYSIS_ID,
                    nodeId: NODE_ID,
                    approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
                }],
            });

            await expect(
                service.setCredentials(ANALYSIS_ID, undefined, nodeClientActor('node-client-1')),
            ).rejects.toThrow();
            expect(reader.writes).toHaveLength(0);
        });
    });
});
