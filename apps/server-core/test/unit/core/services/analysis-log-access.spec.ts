/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import type { ActorContext } from '@privateaim/server-kit';
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

function actorOf(realmId: string, permissions: string[] = []): ActorContext {
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
        it('lets the analysis realm read', async () => {
            await expect(service.assertAnalysisLogAccess(ANALYSIS_ID, actorOf(ANALYSIS_REALM), LogAccessIntent.READ))
                .resolves.toBeUndefined();
        });

        it('lets a master-realm member read', async () => {
            const actor = createPermissionActor({ realm: { id: randomUUID(), name: REALM_MASTER_NAME } });

            await expect(service.assertAnalysisLogAccess(ANALYSIS_ID, actor, LogAccessIntent.READ))
                .resolves.toBeUndefined();
        });

        it('denies another realm, even holding ANALYSIS_UPDATE', async () => {
            const actor = actorOf(OTHER_REALM, [PermissionName.ANALYSIS_UPDATE]);

            await expect(service.assertAnalysisLogAccess(ANALYSIS_ID, actor, LogAccessIntent.READ))
                .rejects.toThrow(PermissionDeniedError);
            await expect(service.assertAnalysisLogAccess(ANALYSIS_ID, actor, LogAccessIntent.DELETE))
                .rejects.toThrow(PermissionDeniedError);
        });

        it('requires ANALYSIS_UPDATE to delete', async () => {
            await expect(service.assertAnalysisLogAccess(ANALYSIS_ID, actorOf(ANALYSIS_REALM), LogAccessIntent.DELETE))
                .rejects.toThrow(PermissionDeniedError);

            await expect(service.assertAnalysisLogAccess(
                ANALYSIS_ID,
                actorOf(ANALYSIS_REALM, [PermissionName.ANALYSIS_UPDATE]),
                LogAccessIntent.DELETE,
            )).resolves.toBeUndefined();
        });

        it('404s an unknown analysis instead of widening', async () => {
            await expect(service.assertAnalysisLogAccess(randomUUID(), actorOf(ANALYSIS_REALM), LogAccessIntent.READ))
                .rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('analysis-node logs', () => {
        it('lets either side of the run read', async () => {
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, NODE_ID, actorOf(NODE_REALM), LogAccessIntent.READ))
                .resolves.toBeUndefined();
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, NODE_ID, actorOf(ANALYSIS_REALM), LogAccessIntent.READ))
                .resolves.toBeUndefined();
        });

        it('denies a third realm', async () => {
            const actor = actorOf(OTHER_REALM, [PermissionName.ANALYSIS_UPDATE]);

            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, NODE_ID, actor, LogAccessIntent.READ))
                .rejects.toThrow(PermissionDeniedError);
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, NODE_ID, actor, LogAccessIntent.DELETE))
                .rejects.toThrow(PermissionDeniedError);
        });

        it('lets the node side delete the logs it wrote', async () => {
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, NODE_ID, actorOf(NODE_REALM), LogAccessIntent.DELETE))
                .resolves.toBeUndefined();
        });

        it('requires ANALYSIS_UPDATE for the analysis side to delete', async () => {
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, NODE_ID, actorOf(ANALYSIS_REALM), LogAccessIntent.DELETE))
                .rejects.toThrow(PermissionDeniedError);

            await expect(service.assertAnalysisNodeLogAccess(
                ANALYSIS_ID,
                NODE_ID,
                actorOf(ANALYSIS_REALM, [PermissionName.ANALYSIS_UPDATE]),
                LogAccessIntent.DELETE,
            )).resolves.toBeUndefined();
        });

        it('404s an unknown node or analysis', async () => {
            await expect(service.assertAnalysisNodeLogAccess(ANALYSIS_ID, randomUUID(), actorOf(NODE_REALM), LogAccessIntent.READ))
                .rejects.toThrow(EntityNotFoundError);
            await expect(service.assertAnalysisNodeLogAccess(randomUUID(), NODE_ID, actorOf(NODE_REALM), LogAccessIntent.READ))
                .rejects.toThrow(EntityNotFoundError);
        });
    });
});
