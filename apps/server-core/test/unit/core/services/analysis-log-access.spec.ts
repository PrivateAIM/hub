/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
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
import { createDenyAllActor, createNonMasterRealmActor } from '../helpers/index.ts';
import { createTestAnalysisNode } from '../../../utils/domains/index.ts';

const OWNER_REALM = randomUUID();
const APPROVED_REALM = randomUUID();
const PENDING_REALM = randomUUID();
const OTHER_REALM = randomUUID();

const ANALYSIS_ID = randomUUID();
const APPROVED_NODE = randomUUID();
const PENDING_NODE = randomUUID();
const APPROVED_NODE_CLIENT = randomUUID();

function userOf(realmId: string): FakeActorContext {
    return createNonMasterRealmActor(realmId);
}

function clientOf(clientId: string, realmId: string): FakeActorContext {
    const actor = createNonMasterRealmActor(realmId);
    actor.identity = {
        id: clientId, 
        type: 'client', 
        realmId, 
    };
    return actor;
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
            nodeRepository.create({ id: PENDING_NODE, realmId: PENDING_REALM }),
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
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, randomUUID(), userOf(OWNER_REALM), LogAccessIntent.READ))
                .rejects.toThrow(EntityNotFoundError);
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, 'abc', userOf(OWNER_REALM), LogAccessIntent.READ))
                .rejects.toThrow(BadRequestError);
        });
    });
});
