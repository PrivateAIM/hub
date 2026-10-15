/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis, Node } from '@privateaim/core-kit';
import { PermissionDeniedError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import { eq, inArray, or } from '@rapiq/core';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisReachService } from '../../../../src/core/services/analysis-reach/index.ts';
import type { AnalysisReachTarget } from '../../../../src/core/services/analysis-reach/index.ts';
import {
    FakeEntityRepository,
    createDenyAllActor,
    createNonMasterRealmActor,
} from '../helpers/index.ts';
import { FakeAnalysisNodeRepository } from '../entities/analysis-node/fake-repository.ts';
import { createTestAnalysisNode } from '../../../utils/domains/index.ts';

const ANALYSIS: AnalysisReachTarget = { realmAttributeName: 'realmId', analysisIdAttributeName: 'id' };
const ANALYSIS_NODE: AnalysisReachTarget = { realmAttributeName: 'analysisRealmId', analysisIdAttributeName: 'analysisId' };

describe('AnalysisReachService', () => {
    let analysisNodeRepository: FakeAnalysisNodeRepository;
    let analysisRepository: FakeEntityRepository<Analysis>;
    let nodeRepository: FakeEntityRepository<Node>;
    let service: AnalysisReachService;

    beforeEach(() => {
        analysisNodeRepository = new FakeAnalysisNodeRepository();
        analysisRepository = new FakeEntityRepository<Analysis>();
        nodeRepository = new FakeEntityRepository<Node>();
        service = new AnalysisReachService({
            analysisNodeRepository, 
            analysisRepository, 
            nodeRepository, 
        });

        analysisNodeRepository.seed([
            createTestAnalysisNode({
                id: 'an-1', 
                analysisId: 'a-1', 
                nodeId: 'n-a1', 
                nodeRealmId: 'realm-a', 
            }),
            createTestAnalysisNode({
                id: 'an-2', 
                analysisId: 'a-2', 
                nodeId: 'n-a2', 
                nodeRealmId: 'realm-a', 
            }),
            createTestAnalysisNode({
                id: 'an-3', 
                analysisId: 'a-2', 
                nodeId: 'n-a1', 
                nodeRealmId: 'realm-a', 
            }),
            createTestAnalysisNode({
                id: 'an-4', 
                analysisId: 'a-3', 
                nodeId: 'n-b', 
                nodeRealmId: 'realm-b', 
            }),
        ]);
    });

    it('should pre-gate the read one-of, every analysis write implying read', async () => {
        const actor = createNonMasterRealmActor('realm-a');

        await service.resolve(actor, ANALYSIS);

        expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0].name).toEqual(expect.arrayContaining([
            PermissionName.ANALYSIS_READ,
            PermissionName.ANALYSIS_CREATE,
            PermissionName.ANALYSIS_UPDATE,
            PermissionName.ANALYSIS_DELETE,
            PermissionName.ANALYSIS_APPROVE,
            PermissionName.ANALYSIS_EXECUTION_START,
            PermissionName.ANALYSIS_EXECUTION_STOP,
        ]));
    });

    it('should refuse an actor holding none of them', async () => {
        await expect(service.resolve(createDenyAllActor(), ANALYSIS)).rejects.toThrow(PermissionDeniedError);
    });

    it('should not narrow for a grant reaching every realm', async () => {
        const actor = createNonMasterRealmActor('realm-a');
        actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });

        await expect(service.resolve(actor, ANALYSIS)).resolves.toBeUndefined();
    });

    it('should match nothing when the grant reaches no realm, participation included', async () => {
        const actor = createNonMasterRealmActor('realm-a');
        actor.permissionEvaluator.setCompileResult({ verdict: 'deny' });

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(inArray('id', []));
    });

    it('should OR a user\'s grant reach with the analyses its realm\'s nodes take part in', async () => {
        const actor = createNonMasterRealmActor('realm-a');
        actor.permissionEvaluator.setCompileResult({ verdict: 'conditional', condition: eq('realmId', 'realm-a') });

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(or(
            eq('realmId', 'realm-a'),
            inArray('id', ['a-1', 'a-2']),
        ));
    });

    it('should fall back to the own realm for a grant policy that cannot lower', async () => {
        const actor = createNonMasterRealmActor('realm-b');

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(or(
            eq('realmId', 'realm-b'),
            inArray('id', ['a-3']),
        ));
    });

    it('should not widen analysis-node rows past a grant policy, keeping participation', async () => {
        // With a realm column named, authup returns `post` for any policy-bearing grant.
        const actor = createNonMasterRealmActor('realm-b');

        await expect(service.resolve(actor, ANALYSIS_NODE)).resolves.toEqual(or(
            inArray('id', []),
            inArray('analysisId', ['a-3']),
        ));
    });

    it('should lower the grant onto the realm column of the queried entity', async () => {
        const actor = createNonMasterRealmActor('realm-a');

        await service.resolve(actor, ANALYSIS_NODE);
        await service.resolve(actor, ANALYSIS);

        expect(actor.permissionEvaluator.compileCalls[0].realmAttributeName).toBe('analysisRealmId');
        expect(actor.permissionEvaluator.compileCalls[1].realmAttributeName).toBeUndefined();
    });

    it('should reach a node client by its node alone, whatever its grant', async () => {
        nodeRepository.seed({
            id: 'n-a1', 
            clientId: 'client-n-a1', 
            realmId: 'realm-a', 
        } as Node);

        const actor = createNonMasterRealmActor('realm-a');
        actor.identity = {
            id: 'client-n-a1', 
            type: 'client', 
            realmId: 'realm-a', 
        };
        actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(inArray('id', ['a-1', 'a-2']));
        expect(actor.permissionEvaluator.compileCalls).toHaveLength(0);
    });

    it('should ignore a node of another realm that claims the client', async () => {
        nodeRepository.seed({
            id: 'n-x', 
            clientId: 'client-n-b', 
            realmId: 'realm-a', 
        } as Node);

        const actor = createNonMasterRealmActor('realm-b');
        actor.identity = {
            id: 'client-n-b', 
            type: 'client', 
            realmId: 'realm-b', 
        };
        actor.permissionEvaluator.setCompileResult({ verdict: 'conditional', condition: eq('realmId', 'realm-b') });

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(eq('realmId', 'realm-b'));
    });

    it('should reach an analysis client by its one analysis', async () => {
        analysisRepository.seed({
            id: 'a-9', 
            clientId: 'client-a-9', 
            realmId: 'realm-a', 
        } as Analysis);

        const actor = createNonMasterRealmActor('realm-a');
        actor.identity = {
            id: 'client-a-9', 
            type: 'client', 
            realmId: 'realm-a', 
        };
        actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });

        await expect(service.resolve(actor, ANALYSIS_NODE)).resolves.toEqual(eq('analysisId', 'a-9'));
    });

    it('should still pre-gate a bound client', async () => {
        nodeRepository.seed({
            id: 'n-a1', 
            clientId: 'client-n-a1', 
            realmId: 'realm-a', 
        } as Node);

        const actor = createDenyAllActor('realm-a');
        actor.identity = {
            id: 'client-n-a1', 
            type: 'client', 
            realmId: 'realm-a', 
        };

        await expect(service.resolve(actor, ANALYSIS)).rejects.toThrow(PermissionDeniedError);
    });

    it('should not let any other client participate through its realm', async () => {
        const actor = createNonMasterRealmActor('realm-a');
        actor.identity = {
            id: 'some-service', 
            type: 'client', 
            realmId: 'realm-a', 
        };
        actor.permissionEvaluator.setCompileResult({ verdict: 'conditional', condition: eq('realmId', 'realm-a') });

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(eq('realmId', 'realm-a'));
    });
});
