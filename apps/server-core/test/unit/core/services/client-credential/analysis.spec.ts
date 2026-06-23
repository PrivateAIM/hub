/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import type { Analysis, AnalysisNode, Node } from '@privateaim/core-kit';
import { AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import { createAllowAllActor } from '@privateaim/server-test-kit';
import { describe, expect, it } from 'vitest';
import { AnalysisClientCredentialService } from '../../../../../src/core/services/client-credential/index.ts';
import type {
    IAnalysisNodeRepository,
    IAnalysisRepository,
    INodeRepository,
} from '../../../../../src/core/index.ts';
import { FakeClientCredentialStore } from './fake-credential-store.ts';

function createAnalysisRepository(analyses: Partial<Analysis>[]): IAnalysisRepository {
    return { findOneById: async (id: string) => analyses.find((a) => a.id === id) ?? null } as unknown as IAnalysisRepository;
}

function createNodeRepository(nodes: Partial<Node>[]): INodeRepository {
    return {
        findOneBy: async (where: Record<string, any>) => nodes.find(
            (n) => n.client_id === where.client_id,
        ) ?? null,
    } as unknown as INodeRepository;
}

function createAnalysisNodeRepository(analysisNodes: Partial<AnalysisNode>[]): IAnalysisNodeRepository {
    return {
        findOneBy: async (where: Record<string, any>) => analysisNodes.find(
            (an) => an.analysis_id === where.analysis_id && an.node_id === where.node_id,
        ) ?? null,
    } as unknown as IAnalysisNodeRepository;
}

function nodeClientActor(clientId: string): ActorContext {
    return {
        realm: { name: 'node-realm' },
        identity: { type: 'client', id: clientId },
        // A node client has no analysis-management permission.
        permissionChecker: { preCheck: async () => { throw new Error('forbidden'); } },
    } as unknown as ActorContext;
}

function userActor(): ActorContext {
    return {
        realm: { name: 'some-realm' },
        identity: { type: 'user', id: randomUUID() },
        // A plain user without ANALYSIS_UPDATE.
        permissionChecker: { preCheck: async () => { throw new Error('forbidden'); } },
    } as unknown as ActorContext;
}

/**
 * A master-realm member who does NOT hold ANALYSIS_UPDATE — used to prove that
 * realm membership alone never grants access.
 */
function masterRealmWithoutPermissionActor(): ActorContext {
    return {
        realm: { name: REALM_MASTER_NAME },
        identity: { type: 'user', id: randomUUID() },
        permissionChecker: { preCheck: async () => { throw new Error('forbidden'); } },
    } as unknown as ActorContext;
}

const ANALYSIS_ID = randomUUID();
const NODE_ID = randomUUID();

function buildService(opts: {
    analysis?: Partial<Analysis>;
    nodes?: Partial<Node>[];
    analysisNodes?: Partial<AnalysisNode>[];
    secret?: string | null;
}) {
    const reader = new FakeClientCredentialStore(opts.secret);
    const service = new AnalysisClientCredentialService({
        repository: createAnalysisRepository(opts.analysis ? [opts.analysis] : []),
        nodeRepository: createNodeRepository(opts.nodes || []),
        analysisNodeRepository: createAnalysisNodeRepository(opts.analysisNodes || []),
        credentialStore: reader,
    });
    return { service, reader };
}

function baseAnalysis(overrides: Partial<Analysis> = {}): Partial<Analysis> {
    return {
        id: ANALYSIS_ID,
        realm_id: randomUUID(),
        client_id: 'analysis-client-1',
        ...overrides,
    };
}

describe('AnalysisClientCredentialService', () => {
    it('should return credentials for a permitted manager', async () => {
        const { service, reader } = buildService({ analysis: baseAnalysis() });

        const credentials = await service.getCredentials(ANALYSIS_ID, createAllowAllActor());

        expect(credentials).toEqual({ id: 'analysis-client-1', secret: 'the-secret' });
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
            nodes: [{ id: NODE_ID, client_id: 'node-client-1' }],
            analysisNodes: [{
                analysis_id: ANALYSIS_ID,
                node_id: NODE_ID,
                approval_status: AnalysisNodeApprovalStatus.APPROVED,
            }],
        });

        const credentials = await service.getCredentials(ANALYSIS_ID, nodeClientActor('node-client-1'));
        expect(credentials.secret).toBe('the-secret');
    });

    it('should deny a node that is assigned but not approved', async () => {
        const { service } = buildService({
            analysis: baseAnalysis(),
            nodes: [{ id: NODE_ID, client_id: 'node-client-1' }],
            analysisNodes: [{
                analysis_id: ANALYSIS_ID,
                node_id: NODE_ID,
                approval_status: null,
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

    it('should reject when the analysis has no client provisioned', async () => {
        const { service } = buildService({ analysis: baseAnalysis({ client_id: null }) });

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
        const { service } = buildService({ analysis: baseAnalysis({ client_id: null }) });

        await expect(
            service.getCredentials(ANALYSIS_ID, userActor()),
        ).rejects.toThrow(PermissionDeniedError);
    });

    describe('setCredentials', () => {
        it('should rotate (no secret) for a manager', async () => {
            const { service, reader } = buildService({ analysis: baseAnalysis() });

            const credentials = await service.setCredentials(ANALYSIS_ID, undefined, createAllowAllActor());

            expect(reader.writes).toEqual([{ clientId: 'analysis-client-1', secret: undefined }]);
            expect(credentials.secret).toBe('generated-secret');
        });

        it('should deny a node client that may only read', async () => {
            // The read path allows an approved assigned node; writing must not.
            const { service, reader } = buildService({
                analysis: baseAnalysis(),
                nodes: [{ id: NODE_ID, client_id: 'node-client-1' }],
                analysisNodes: [{
                    analysis_id: ANALYSIS_ID,
                    node_id: NODE_ID,
                    approval_status: AnalysisNodeApprovalStatus.APPROVED,
                }],
            });

            await expect(
                service.setCredentials(ANALYSIS_ID, undefined, nodeClientActor('node-client-1')),
            ).rejects.toThrow();
            expect(reader.writes).toHaveLength(0);
        });
    });
});
