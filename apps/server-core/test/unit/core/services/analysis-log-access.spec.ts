/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import { ValidupError } from 'validup';
import { PermissionName } from '@privateaim/kit';
import type { FakeActorContext } from '@privateaim/server-test-kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisLogAccessService, LogAccessIntent } from '../../../../src/core/services/analysis-log-access/index.ts';
import { AnalysisReachService } from '../../../../src/core/services/analysis-reach/index.ts';
import { FakeAnalysisRepository } from '../entities/analysis/fake-repository.ts';
import { FakeAnalysisNodeRepository } from '../entities/analysis-node/fake-repository.ts';
import { FakeNodeRepository } from '../entities/node/fake-repository.ts';
import { createAllowAllActor, createDenyAllActor, createScopedActor } from '@privateaim/server-test-kit';
import { createTestAnalysisNode } from '../../../utils/domains/index.ts';

const OWNER_REALM = randomUUID();
const APPROVED_REALM = randomUUID();
const PENDING_REALM = randomUUID();
const OTHER_REALM = randomUUID();

const ANALYSIS_ID = randomUUID();
const APPROVED_NODE = randomUUID();
const PENDING_NODE = randomUUID();
const APPROVED_NODE_CLIENT = randomUUID();
const PENDING_NODE_CLIENT = randomUUID();

function userOf(realmId: string): FakeActorContext {
    return createAllowAllActor(realmId);
}

function clientOf(clientId: string, realmId: string, actor = createAllowAllActor(realmId)): FakeActorContext {
    actor.identity = {
        id: clientId,
        type: 'client',
        realmId,
    };
    return actor;
}

/** A node client: no ANALYSIS_UPDATE/APPROVE, its grants scoped `none` (Q1). */
function boundClientOf(clientId: string, realmId: string): FakeActorContext {
    return createScopedActor({
        realmId,
        realmScope: 'none',
        identity: {
            id: clientId,
            type: 'client',
            realmId,
        },
    });
}

describe('AnalysisLogAccessService', () => {
    let service: AnalysisLogAccessService;

    beforeEach(() => {
        const analysisRepository = new FakeAnalysisRepository();
        analysisRepository.seed(analysisRepository.create({ id: ANALYSIS_ID, realmId: OWNER_REALM }));

        const nodeRepository = new FakeNodeRepository();
        nodeRepository.seed([
            nodeRepository.create({
                id: APPROVED_NODE,
                realmId: APPROVED_REALM,
                clientId: APPROVED_NODE_CLIENT,
            }),
            nodeRepository.create({
                id: PENDING_NODE,
                realmId: PENDING_REALM,
                clientId: PENDING_NODE_CLIENT,
            }),
        ]);

        const analysisNodeRepository = new FakeAnalysisNodeRepository();
        analysisNodeRepository.seed([
            createTestAnalysisNode({
                analysisId: ANALYSIS_ID,
                nodeId: APPROVED_NODE,
                nodeRealmId: APPROVED_REALM,
                approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
            }),
            createTestAnalysisNode({
                analysisId: ANALYSIS_ID,
                nodeId: PENDING_NODE,
                nodeRealmId: PENDING_REALM,
                approvalStatus: null,
            }),
        ]);

        service = new AnalysisLogAccessService({
            analysisRepository,
            analysisNodeRepository,
            nodeRepository,
            reach: new AnalysisReachService({
                analysisNodeRepository,
                analysisRepository,
                nodeRepository,
            }),
        });
    });

    describe('analysis logs', () => {
        it('lets the owner realm and an approved node realm read', async () => {
            for (const realm of [OWNER_REALM, APPROVED_REALM]) {
                await expect(service.assertAnalysisLogAccess(ANALYSIS_ID, userOf(realm), LogAccessIntent.READ))
                    .resolves.toBeUndefined();
            }
        });

        it('hides them from a pending node realm and a third realm', async () => {
            for (const realm of [PENDING_REALM, OTHER_REALM]) {
                await expect(service.assertAnalysisLogAccess(ANALYSIS_ID, userOf(realm), LogAccessIntent.READ))
                    .rejects.toThrow(EntityNotFoundError);
            }
        });

        it('requires the analysis read one-of', async () => {
            await expect(service.assertAnalysisLogAccess(ANALYSIS_ID, createDenyAllActor(OWNER_REALM), LogAccessIntent.READ))
                .rejects.toThrow(PermissionDeniedError);
        });

        it('lets only the owner side delete, with ANALYSIS_UPDATE', async () => {
            const owner = userOf(OWNER_REALM);
            await expect(service.assertAnalysisLogAccess(ANALYSIS_ID, owner, LogAccessIntent.DELETE))
                .resolves.toBeUndefined();
            expect(owner.permissionEvaluator.preEvaluateOneOfCalls[0].name).toEqual([PermissionName.ANALYSIS_UPDATE]);

            await expect(service.assertAnalysisLogAccess(ANALYSIS_ID, userOf(APPROVED_REALM), LogAccessIntent.DELETE))
                .rejects.toThrow(EntityNotFoundError);
            await expect(service.assertAnalysisLogAccess(ANALYSIS_ID, createDenyAllActor(OWNER_REALM), LogAccessIntent.DELETE))
                .rejects.toThrow(PermissionDeniedError);
        });

        it('rejects a malformed analysis id', async () => {
            await expect(service.assertAnalysisLogAccess('abc', userOf(OWNER_REALM), LogAccessIntent.READ))
                .rejects.toThrow(BadRequestError);
        });
    });

    describe('analysis-node logs', () => {
        it('requires ANALYSIS_UPDATE or ANALYSIS_APPROVE to read', async () => {
            const actor = userOf(OWNER_REALM);
            await service.assertAnalysisNodeLogAccess(ANALYSIS_ID, PENDING_NODE, actor, LogAccessIntent.READ);

            expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0].name).toEqual([
                PermissionName.ANALYSIS_UPDATE,
                PermissionName.ANALYSIS_APPROVE,
            ]);
        });

        it('lets the owner realm read every node', async () => {
            for (const node of [APPROVED_NODE, PENDING_NODE]) {
                await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, node, userOf(OWNER_REALM), LogAccessIntent.READ))
                    .resolves.toBeUndefined();
            }
        });

        it('lets an approved node read its own run only', async () => {
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, APPROVED_NODE, userOf(APPROVED_REALM), LogAccessIntent.READ))
                .resolves.toBeUndefined();
            await expect(service.assertAnalysisNodeLogAccess(
                ANALYSIS_ID,
                APPROVED_NODE,
                clientOf(APPROVED_NODE_CLIENT, APPROVED_REALM),
                LogAccessIntent.READ,
            )).resolves.toBeUndefined();

            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, PENDING_NODE, userOf(APPROVED_REALM), LogAccessIntent.READ))
                .rejects.toThrow(EntityNotFoundError);
        });

        it('hides a pending node\'s own run from it', async () => {
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, PENDING_NODE, userOf(PENDING_REALM), LogAccessIntent.READ))
                .rejects.toThrow(EntityNotFoundError);
        });

        it('does not count a user of another realm as the node', async () => {
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, APPROVED_NODE, userOf(OTHER_REALM), LogAccessIntent.READ))
                .rejects.toThrow(EntityNotFoundError);
        });

        it('refuses a caller without the capability before looking up the node', async () => {
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, randomUUID(), createDenyAllActor(OWNER_REALM), LogAccessIntent.READ))
                .rejects.toThrow(PermissionDeniedError);
        });

        it('lets the node\'s own client read its approved run without the capability', async () => {
            const actor = clientOf(APPROVED_NODE_CLIENT, APPROVED_REALM, createDenyAllActor(APPROVED_REALM));

            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, APPROVED_NODE, actor, LogAccessIntent.READ))
                .resolves.toBeUndefined();
            expect(actor.permissionEvaluator.preEvaluateOneOfCalls).toHaveLength(0);
        });

        it('falls back to the capability for the node\'s own client of a pending run', async () => {
            const actor = clientOf(PENDING_NODE_CLIENT, PENDING_REALM, createDenyAllActor(PENDING_REALM));

            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, PENDING_NODE, actor, LogAccessIntent.READ))
                .rejects.toThrow(PermissionDeniedError);
        });

        it('does not count a client bound in another realm', async () => {
            await expect(service.assertAnalysisNodeLogAccess(
                ANALYSIS_ID,
                APPROVED_NODE,
                clientOf(APPROVED_NODE_CLIENT, OTHER_REALM),
                LogAccessIntent.READ,
            )).rejects.toThrow(EntityNotFoundError);
        });

        it('lets only the owner side delete', async () => {
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, APPROVED_NODE, userOf(OWNER_REALM), LogAccessIntent.DELETE))
                .resolves.toBeUndefined();

            for (const actor of [userOf(APPROVED_REALM), clientOf(APPROVED_NODE_CLIENT, APPROVED_REALM)]) {
                await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, APPROVED_NODE, actor, LogAccessIntent.DELETE))
                    .rejects.toThrow(EntityNotFoundError);
            }
        });

        it('rejects an unknown or malformed node id', async () => {
            for (const intent of [LogAccessIntent.READ, LogAccessIntent.DELETE]) {
                await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, randomUUID(), userOf(OWNER_REALM), intent))
                    .rejects.toThrow(EntityNotFoundError);
            }
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, 'abc', userOf(OWNER_REALM), LogAccessIntent.READ))
                .rejects.toThrow(BadRequestError);
        });
    });

    describe('analysis-node log writes', () => {
        it('requires ANALYSIS_NODE_LOG_CREATE', async () => {
            const actor = boundClientOf(APPROVED_NODE_CLIENT, APPROVED_REALM);
            await service.assertAnalysisNodeLogCreate(ANALYSIS_ID, APPROVED_NODE, actor);

            expect(actor.permissionEvaluator.preEvaluateCalls.map((call) => call.name))
                .toEqual([PermissionName.ANALYSIS_NODE_LOG_CREATE]);

            const denied = clientOf(APPROVED_NODE_CLIENT, APPROVED_REALM, createDenyAllActor(APPROVED_REALM));
            await expect(service.assertAnalysisNodeLogCreate(ANALYSIS_ID, APPROVED_NODE, denied))
                .rejects.toThrow(PermissionDeniedError);
        });

        it('lets the node\'s own client write by its binding, not its grant\'s reach', async () => {
            await expect(service.assertAnalysisNodeLogCreate(ANALYSIS_ID, APPROVED_NODE, boundClientOf(APPROVED_NODE_CLIENT, APPROVED_REALM)))
                .resolves.toBeUndefined();
        });

        it('does not let a node client write another node\'s logs', async () => {
            await expect(service.assertAnalysisNodeLogCreate(ANALYSIS_ID, PENDING_NODE, boundClientOf(APPROVED_NODE_CLIENT, APPROVED_REALM)))
                .rejects.toThrow(PermissionDeniedError);
        });

        it('does not count a client bound in another realm', async () => {
            await expect(service.assertAnalysisNodeLogCreate(ANALYSIS_ID, APPROVED_NODE, boundClientOf(APPROVED_NODE_CLIENT, OTHER_REALM)))
                .rejects.toThrow(PermissionDeniedError);
        });

        it('lets any other caller write only with a grant reaching the node\'s realm', async () => {
            await expect(service.assertAnalysisNodeLogCreate(
                ANALYSIS_ID,
                APPROVED_NODE,
                createScopedActor({ realmId: APPROVED_REALM, realmScope: 'own' }),
            )).resolves.toBeUndefined();
            await expect(service.assertAnalysisNodeLogCreate(
                ANALYSIS_ID,
                APPROVED_NODE,
                createScopedActor({ realmId: OTHER_REALM, realmScope: 'any' }),
            )).resolves.toBeUndefined();

            // the analysis' own realm is not the node's
            await expect(service.assertAnalysisNodeLogCreate(
                ANALYSIS_ID,
                APPROVED_NODE,
                createScopedActor({ realmId: OWNER_REALM, realmScope: 'own' }),
            )).rejects.toThrow(PermissionDeniedError);
        });

        it('rejects an unknown node or analysis', async () => {
            const actor = createScopedActor({ realmId: APPROVED_REALM, realmScope: 'own' });

            await expect(service.assertAnalysisNodeLogCreate(ANALYSIS_ID, randomUUID(), actor)).rejects.toThrow(ValidupError);
            await expect(service.assertAnalysisNodeLogCreate(randomUUID(), APPROVED_NODE, actor)).rejects.toThrow(ValidupError);
        });
    });
});
