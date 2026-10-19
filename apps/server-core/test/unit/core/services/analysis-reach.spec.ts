/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionError } from '@authup/access';
import type { Analysis, Node } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import {
    and,
    eq,
    inArray,
    or,
} from '@rapiq/core';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisReachService } from '../../../../src/core/services/analysis-reach/index.ts';
import type { AnalysisReachTarget } from '../../../../src/core/services/analysis-reach/index.ts';
import { FakeEntityRepository, createAllowAllActor, createDenyAllActor } from '@privateaim/server-test-kit';
import { FakeAnalysisNodeRepository } from '../entities/analysis-node/fake-repository.ts';
import { createTestAnalysisNode } from '../../../utils/domains/index.ts';

const ANALYSIS: AnalysisReachTarget = { analysisPath: '', analysisIdAttributeName: 'id' };
const ANALYSIS_NODE: AnalysisReachTarget = { analysisPath: 'analysis', analysisIdAttributeName: 'analysisId' };

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
        const actor = createAllowAllActor('realm-a');

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
        await expect(service.resolve(createDenyAllActor(), ANALYSIS)).rejects.toThrow(PermissionError);
    });

    it('should not narrow for a grant reaching every realm', async () => {
        const actor = createAllowAllActor('realm-a');
        actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });

        await expect(service.resolve(actor, ANALYSIS)).resolves.toBeUndefined();
    });

    it('should match nothing when the grant reaches no realm, participation included', async () => {
        const actor = createAllowAllActor('realm-a');
        actor.permissionEvaluator.setCompileResult({ verdict: 'deny' });

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(inArray('id', []));
    });

    it('should OR a user\'s grant reach with the analyses its realm\'s nodes take part in', async () => {
        const actor = createAllowAllActor('realm-a');
        actor.permissionEvaluator.setCompileResult({ verdict: 'conditional', condition: eq('realmId', 'realm-a') });

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(or(
            eq('realmId', 'realm-a'),
            inArray('id', ['a-1', 'a-2']),
        ));
    });

    it('should fall back to the own realm for a grant policy that cannot lower', async () => {
        const actor = createAllowAllActor('realm-b');

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(or(
            eq('realmId', 'realm-b'),
            inArray('id', ['a-3']),
        ));
    });

    it('should narrow a related entity\'s own-realm fallback through its analysis', async () => {
        const actor = createAllowAllActor('realm-b');

        await expect(service.resolve(actor, ANALYSIS_NODE)).resolves.toEqual(or(
            eq('analysis.realmId', 'realm-b'),
            inArray('analysisId', ['a-3']),
        ));
    });

    it('should re-root a grant policy onto the analysis relation of a related entity', async () => {
        const actor = createAllowAllActor('realm-b');
        actor.permissionEvaluator.setCompileResult({
            verdict: 'conditional',
            condition: and(eq('realmId', 'realm-b'), eq('projectId', 'p-1')),
        });

        await expect(service.resolve(actor, ANALYSIS_NODE)).resolves.toEqual(or(
            and(eq('analysis.realmId', 'realm-b'), eq('analysis.projectId', 'p-1')),
            inArray('analysisId', ['a-3']),
        ));
    });

    it('should never name a realm column, so authup can lower grant policies', async () => {
        const actor = createAllowAllActor('realm-a');

        await service.resolve(actor, ANALYSIS_NODE);
        await service.resolve(actor, ANALYSIS);

        expect(actor.permissionEvaluator.compileCalls.map((call) => call.realmAttributeName)).toEqual([undefined, undefined]);
    });

    it('should count only approved participation when asked', async () => {
        await analysisNodeRepository.save({
            ...(await analysisNodeRepository.findOneById('an-2')),
            approvalStatus: null,
        });

        const actor = createAllowAllActor('realm-a');
        actor.permissionEvaluator.setCompileResult({ verdict: 'conditional', condition: eq('realmId', 'realm-a') });

        // an-2 is pending, but a-2 stays reachable through an-3, which is approved.
        await expect(service.resolve(actor, ANALYSIS, { approvedOnly: true })).resolves.toEqual(or(
            eq('realmId', 'realm-a'),
            inArray('id', ['a-1', 'a-2']),
        ));

        await analysisNodeRepository.save({
            ...(await analysisNodeRepository.findOneById('an-3')),
            approvalStatus: null,
        });

        await expect(service.resolve(actor, ANALYSIS, { approvedOnly: true })).resolves.toEqual(or(
            eq('realmId', 'realm-a'),
            inArray('id', ['a-1']),
        ));
        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(or(
            eq('realmId', 'realm-a'),
            inArray('id', ['a-1', 'a-2']),
        ));
    });

    it('should pre-gate and compile the given permission names', async () => {
        const actor = createAllowAllActor('realm-a');

        await service.resolve(actor, ANALYSIS, { names: [PermissionName.ANALYSIS_RESULT_READ] });

        expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0].name).toEqual([PermissionName.ANALYSIS_RESULT_READ]);
        expect(actor.permissionEvaluator.compileCalls[0].name).toEqual([PermissionName.ANALYSIS_RESULT_READ]);
    });

    it('should leave participation out for grant-only reach', async () => {
        const actor = createAllowAllActor('realm-a');
        actor.permissionEvaluator.setCompileResult({ verdict: 'conditional', condition: eq('realmId', 'realm-a') });

        await expect(service.resolve(actor, ANALYSIS, { grantOnly: true })).resolves.toEqual(eq('realmId', 'realm-a'));
    });

    it('should give a bound client no grant-only reach, whatever its grant', async () => {
        nodeRepository.seed({
            id: 'n-a1',
            clientId: 'client-n-a1',
            realmId: 'realm-a',
        } as Node);

        const actor = createAllowAllActor('realm-a');
        actor.identity = {
            id: 'client-n-a1',
            type: 'client',
            realmId: 'realm-a',
        };
        actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });

        await expect(service.resolve(actor, ANALYSIS, { grantOnly: true })).resolves.toEqual(inArray('id', []));
    });

    it('should reach a node client by its node alone, whatever its grant', async () => {
        nodeRepository.seed({
            id: 'n-a1',
            clientId: 'client-n-a1',
            realmId: 'realm-a',
        } as Node);

        const actor = createAllowAllActor('realm-a');
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

        const actor = createAllowAllActor('realm-b');
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

        const actor = createAllowAllActor('realm-a');
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

        await expect(service.resolve(actor, ANALYSIS)).rejects.toThrow(PermissionError);
    });

    it('should not let any other client participate through its realm', async () => {
        const actor = createAllowAllActor('realm-a');
        actor.identity = {
            id: 'some-service',
            type: 'client',
            realmId: 'realm-a',
        };
        actor.permissionEvaluator.setCompileResult({ verdict: 'conditional', condition: eq('realmId', 'realm-a') });

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(eq('realmId', 'realm-a'));
    });
});
