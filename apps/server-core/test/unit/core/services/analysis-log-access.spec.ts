/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { BuiltInPolicyType } from '@authup/access';
import { REALM_MASTER_NAME } from '@authup/core-kit';
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
import { FakeAnalysisRepository } from '../entities/analysis/fake-repository.ts';
import { FakeNodeRepository } from '../entities/node/fake-repository.ts';
import { createPermissionActor } from '../helpers/index.ts';

const ANALYSIS_REALM = randomUUID();
const NODE_REALM = randomUUID();
const OTHER_REALM = randomUUID();

const ANALYSIS_ID = randomUUID();
const NODE_ID = randomUUID();

function actorOf(realmId: string, permissions: string[] = []): FakeActorContext {
    return createPermissionActor({ realm: { id: realmId, name: `realm-${realmId.slice(0, 4)}` }, permissions });
}

describe('AnalysisLogAccessService', () => {
    let service: AnalysisLogAccessService;

    beforeEach(() => {
        const analysisRepository = new FakeAnalysisRepository();
        analysisRepository.seed(analysisRepository.create({ id: ANALYSIS_ID, realmId: ANALYSIS_REALM }));

        const nodeRepository = new FakeNodeRepository();
        nodeRepository.seed(nodeRepository.create({ id: NODE_ID, realmId: NODE_REALM }));

        service = new AnalysisLogAccessService({ analysisRepository, nodeRepository });
    });

    describe('analysis logs', () => {
        it('lets the analysis realm read and denies another realm', async () => {
            await expect(service.assertAnalysisLogAccess(ANALYSIS_ID, actorOf(ANALYSIS_REALM), LogAccessIntent.READ))
                .resolves.toBeUndefined();
            await expect(service.assertAnalysisLogAccess(
                ANALYSIS_ID,
                actorOf(OTHER_REALM, [PermissionName.ANALYSIS_UPDATE]),
                LogAccessIntent.DELETE,
            )).rejects.toThrow(PermissionDeniedError);
        });

        it('requires ANALYSIS_UPDATE, evaluated against the analysis, to delete', async () => {
            await expect(service.assertAnalysisLogAccess(ANALYSIS_ID, actorOf(ANALYSIS_REALM), LogAccessIntent.DELETE))
                .rejects.toThrow(PermissionDeniedError);

            const actor = actorOf(ANALYSIS_REALM, [PermissionName.ANALYSIS_UPDATE]);
            await expect(service.assertAnalysisLogAccess(ANALYSIS_ID, actor, LogAccessIntent.DELETE))
                .resolves.toBeUndefined();

            const [call] = actor.permissionEvaluator.evaluateCalls;
            expect(call?.data?.get(BuiltInPolicyType.ATTRIBUTES)).toMatchObject({ id: ANALYSIS_ID });
        });

        it('rejects an unknown or malformed analysis id instead of widening', async () => {
            await expect(service.assertAnalysisLogAccess(randomUUID(), actorOf(ANALYSIS_REALM), LogAccessIntent.READ))
                .rejects.toThrow(EntityNotFoundError);
            await expect(service.assertAnalysisLogAccess('abc', actorOf(ANALYSIS_REALM), LogAccessIntent.READ))
                .rejects.toThrow(BadRequestError);
        });
    });

    describe('analysis-node logs', () => {
        it('lets either side of the run read and denies a third realm', async () => {
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, NODE_ID, actorOf(NODE_REALM), LogAccessIntent.READ))
                .resolves.toBeUndefined();
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, NODE_ID, actorOf(ANALYSIS_REALM), LogAccessIntent.READ))
                .resolves.toBeUndefined();
            await expect(service.assertAnalysisNodeLogAccess(
                ANALYSIS_ID,
                NODE_ID,
                actorOf(OTHER_REALM, [PermissionName.ANALYSIS_UPDATE]),
                LogAccessIntent.DELETE,
            )).rejects.toThrow(PermissionDeniedError);
        });

        // Realm membership alone never deletes — a master-realm member holds
        // authority over every realm.
        it.each([
            ['the node side', () => actorOf(NODE_REALM)],
            ['a master-realm member', () => createPermissionActor({ realm: { id: randomUUID(), name: REALM_MASTER_NAME } })],
        ])('denies %s deleting without ANALYSIS_UPDATE', async (_label, build) => {
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, NODE_ID, build(), LogAccessIntent.DELETE))
                .rejects.toThrow(PermissionDeniedError);
        });

        it('lets either side delete holding ANALYSIS_UPDATE', async () => {
            for (const realm of [NODE_REALM, ANALYSIS_REALM]) {
                await expect(service.assertAnalysisNodeLogAccess(
                    ANALYSIS_ID,
                    NODE_ID,
                    actorOf(realm, [PermissionName.ANALYSIS_UPDATE]),
                    LogAccessIntent.DELETE,
                )).resolves.toBeUndefined();
            }
        });
    });
});
