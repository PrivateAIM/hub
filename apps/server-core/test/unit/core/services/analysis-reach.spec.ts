/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionError } from '@authup/access';
import type { Analysis, AnalysisNode, Node } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { appendQueryConditions } from '@privateaim/server-kit';
import {
    Query,
    and,
    eq,
    inArray,
    or,
} from '@rapiq/core';
import type { ICondition, IQuery } from '@rapiq/core';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisReachService } from '../../../../src/core/services/analysis-reach/index.ts';
import type { AnalysisReach, AnalysisReachTarget } from '../../../../src/core/services/analysis-reach/index.ts';
import {
    FakeEntityRepository,
    createAllowAllActor,
    createDenyAllActor,
    createScopedActor,
} from '@privateaim/server-test-kit';
import { FakeAnalysisNodeRepository } from '../entities/analysis-node/fake-repository.ts';
import { createTestAnalysisNode } from '../../../utils/domains/index.ts';

const ANALYSIS: AnalysisReachTarget = { analysisPath: '', analysisIdAttributeName: 'id' };
const ANALYSIS_NODE: AnalysisReachTarget = { analysisPath: 'analysis', analysisIdAttributeName: 'analysisId' };

function lowered(condition: ICondition | undefined): AnalysisReach {
    return { kind: 'lowered', condition };
}

/** Projects the page down to `id`, as a sparse fieldset does; a read by id returns the stored rows. */
class SparseAnalysisNodeRepository extends FakeAnalysisNodeRepository {
    async findMany(query: IQuery): Promise<EntityRepositoryFindManyResult<AnalysisNode>> {
        const result = await super.findMany(query);

        if (this.findManyCalls.length > 1) {
            return result;
        }

        return {
            data: result.data.map((row) => ({ ...createTestAnalysisNode({ id: row.id }), analysisId: undefined })),
            meta: result.meta,
        };
    }
}

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

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(lowered(undefined));
    });

    it('should match nothing when the grant reaches no realm, participation included', async () => {
        const actor = createAllowAllActor('realm-a');

        actor.permissionEvaluator.setCompileResult({ verdict: 'deny' });

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(lowered(inArray('id', [])));
    });

    it('should OR a user\'s grant reach with the analyses its realm\'s nodes take part in', async () => {
        const actor = createAllowAllActor('realm-a');

        actor.permissionEvaluator.setCompileResult({ verdict: 'conditional', condition: eq('realmId', 'realm-a') });

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(lowered(or(
            eq('realmId', 'realm-a'),
            inArray('id', ['a-1', 'a-2']),
        )));
    });

    it('should re-root a grant policy onto the analysis relation of a related entity', async () => {
        const actor = createAllowAllActor('realm-b');

        actor.permissionEvaluator.setCompileResult({
            verdict: 'conditional',
            condition: and(eq('realmId', 'realm-b'), eq('projectId', 'p-1')),
        });

        await expect(service.resolve(actor, ANALYSIS_NODE)).resolves.toEqual(lowered(or(
            and(eq('analysis.realmId', 'realm-b'), eq('analysis.projectId', 'p-1')),
            inArray('analysisId', ['a-3']),
        )));
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
        await expect(service.resolve(actor, ANALYSIS, { approvedOnly: true })).resolves.toEqual(lowered(or(
            eq('realmId', 'realm-a'),
            inArray('id', ['a-1', 'a-2']),
        )));

        await analysisNodeRepository.save({
            ...(await analysisNodeRepository.findOneById('an-3')),
            approvalStatus: null,
        });

        await expect(service.resolve(actor, ANALYSIS, { approvedOnly: true })).resolves.toEqual(lowered(or(
            eq('realmId', 'realm-a'),
            inArray('id', ['a-1']),
        )));
        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(lowered(or(
            eq('realmId', 'realm-a'),
            inArray('id', ['a-1', 'a-2']),
        )));
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

        await expect(service.resolve(actor, ANALYSIS, { grantOnly: true })).resolves.toEqual(lowered(eq('realmId', 'realm-a')));
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

        await expect(service.resolve(actor, ANALYSIS, { grantOnly: true })).resolves.toEqual(lowered(inArray('id', [])));
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

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(lowered(inArray('id', ['a-1', 'a-2'])));
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

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(lowered(eq('realmId', 'realm-b')));
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

        await expect(service.resolve(actor, ANALYSIS_NODE)).resolves.toEqual(lowered(eq('analysisId', 'a-9')));
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

        await expect(service.resolve(actor, ANALYSIS)).resolves.toEqual(lowered(eq('realmId', 'realm-a')));
    });

    describe('a grant that does not lower (post)', () => {
        // A policy no column condition expresses: only `open` analyses are granted.
        const policy = (analysis: Record<string, any>) => analysis.name === 'open';

        beforeEach(() => {
            analysisRepository.seed([
                {
                    id: 'own-open',
                    realmId: 'realm-b',
                    name: 'open',
                },
                {
                    id: 'own-closed',
                    realmId: 'realm-b',
                    name: 'closed',
                },
                {
                    id: 'foreign-open',
                    realmId: 'realm-c',
                    name: 'open',
                },
                // realm-b's node takes part in it (an-4).
                {
                    id: 'a-3',
                    realmId: 'realm-c',
                    name: 'closed',
                },
            ] as Analysis[]);
        });

        async function listAnalyses(reach: AnalysisReach) {
            const { data } = await service.findMany(analysisRepository, new Query({}), reach);

            return data.map((analysis) => analysis.id).sort();
        }

        it('should not narrow the candidates by the actor realm', async () => {
            const actor = createScopedActor({
                realmId: 'realm-b',
                realmScope: 'any',
                policy,
            });

            const reach = await service.resolve(actor, ANALYSIS);

            expect(reach.kind).toEqual('post');
            expect(reach).toMatchObject({ candidates: undefined, analysisIdAttributeName: 'id' });
        });

        it('should return exactly the analyses the evaluation allows, plus participation', async () => {
            const actor = createScopedActor({
                realmId: 'realm-b',
                realmScope: 'any',
                policy,
            });

            // Not own-closed, although it is in the actor's own realm; the
            // foreign row the grant reaches is kept; a-3 by participation.
            await expect(listAnalyses(await service.resolve(actor, ANALYSIS)))
                .resolves.toEqual(['a-3', 'foreign-open', 'own-open']);
        });

        it('should apply the realm scope of the grant per analysis', async () => {
            const actor = createScopedActor({
                realmId: 'realm-b',
                realmScope: 'own',
                policy,
            });

            await expect(listAnalyses(await service.resolve(actor, ANALYSIS)))
                .resolves.toEqual(['a-3', 'own-open']);
        });

        it('should leave participation out for grant-only reach', async () => {
            const actor = createScopedActor({
                realmId: 'realm-b',
                realmScope: 'any',
                policy,
            });

            await expect(listAnalyses(await service.resolve(actor, ANALYSIS, { grantOnly: true })))
                .resolves.toEqual(['foreign-open', 'own-open']);
        });

        it('should count only approved participation when asked', async () => {
            await analysisNodeRepository.save({
                ...(await analysisNodeRepository.findOneById('an-4')),
                approvalStatus: null,
            });

            const actor = createScopedActor({
                realmId: 'realm-b',
                realmScope: 'any',
                policy,
            });

            await expect(listAnalyses(await service.resolve(actor, ANALYSIS, { approvedOnly: true })))
                .resolves.toEqual(['foreign-open', 'own-open']);
            await expect(listAnalyses(await service.resolve(actor, ANALYSIS)))
                .resolves.toEqual(['a-3', 'foreign-open', 'own-open']);
        });

        it('should not let a client participate through its realm', async () => {
            const actor = createScopedActor({
                realmId: 'realm-b',
                realmScope: 'any',
                policy,
                identity: {
                    id: 'some-service',
                    type: 'client',
                    realmId: 'realm-b',
                },
            });

            await expect(listAnalyses(await service.resolve(actor, ANALYSIS)))
                .resolves.toEqual(['foreign-open', 'own-open']);
        });

        it('should decide a record read like the list', async () => {
            const actor = createScopedActor({
                realmId: 'realm-b',
                realmScope: 'any',
                policy,
            });
            const reach = await service.resolve(actor, ANALYSIS);

            const read = async (id: string) => {
                const { data } = await service.findMany(analysisRepository, appendQueryConditions(new Query({}), eq('id', id)), reach);

                return data.map((analysis) => analysis.id);
            };

            await expect(read('foreign-open')).resolves.toEqual(['foreign-open']);
            await expect(read('own-closed')).resolves.toEqual([]);
            await expect(read('a-3')).resolves.toEqual(['a-3']);
        });

        it('should keep the candidate total when the page drops rows', async () => {
            // Reports more rows than the page holds, like a paged list.
            const repository = {
                findMany: async (query: IQuery): Promise<EntityRepositoryFindManyResult<Analysis>> => {
                    const page = await analysisRepository.findMany(query);

                    return { data: page.data, meta: { ...page.meta, total: page.meta.total + 10 } };
                },
            };

            const actor = createScopedActor({
                realmId: 'realm-b',
                realmScope: 'any',
                policy,
            });
            const result = await service.findMany(repository, new Query({}), await service.resolve(actor, ANALYSIS));

            // 4 rows on the page of a reported 14; own-closed is dropped, the
            // total still counts it so later pages stay reachable by paging.
            expect(result.data).toHaveLength(3);
            expect(result.meta.total).toEqual(14);
        });

        it('should propagate anything but a permission denial', async () => {
            const actor = createAllowAllActor('realm-b');

            actor.permissionEvaluator.setBehavior(({ method }) => {
                if (method === 'evaluateOneOf') {
                    throw new Error('catalog unavailable');
                }
            });

            await expect(service.findMany(analysisRepository, new Query({}), await service.resolve(actor, ANALYSIS)))
                .rejects.toThrow('catalog unavailable');
        });

        describe('on a related entity', () => {
            beforeEach(() => {
                analysisNodeRepository.clear();
                analysisNodeRepository.seed([
                    // The row's own realm columns say nothing about the reach.
                    createTestAnalysisNode({
                        id: 'of-own-open',
                        analysisId: 'own-open',
                        analysisRealmId: 'realm-x',
                        nodeRealmId: 'realm-x',
                    }),
                    createTestAnalysisNode({
                        id: 'of-own-open-2',
                        analysisId: 'own-open',
                        analysisRealmId: 'realm-x',
                        nodeRealmId: 'realm-x',
                    }),
                    createTestAnalysisNode({
                        id: 'of-own-closed',
                        analysisId: 'own-closed',
                        analysisRealmId: 'realm-b',
                        nodeRealmId: 'realm-x',
                    }),
                    createTestAnalysisNode({
                        id: 'of-foreign-open',
                        analysisId: 'foreign-open',
                        analysisRealmId: 'realm-c',
                        nodeRealmId: 'realm-x',
                    }),
                    createTestAnalysisNode({
                        id: 'of-a-3',
                        analysisId: 'a-3',
                        analysisRealmId: 'realm-c',
                        nodeRealmId: 'realm-b',
                    }),
                    createTestAnalysisNode({
                        id: 'of-missing',
                        analysisId: 'missing',
                        analysisRealmId: 'realm-b',
                        nodeRealmId: 'realm-x',
                    }),
                ]);
            });

            it('should decide by the parent analysis, loaded once for the page', async () => {
                const actor = createScopedActor({
                    realmId: 'realm-b',
                    realmScope: 'own',
                    policy,
                });
                const reach = await service.resolve(actor, ANALYSIS_NODE);

                analysisRepository.findManyCalls = [];

                const { data, meta } = await service.findMany(analysisNodeRepository, new Query({}), reach);

                // own-open is in reach although its rows carry a foreign realm,
                // a-3 by participation; a row without its analysis is not reached.
                expect(data.map((row) => row.id).sort()).toEqual(['of-a-3', 'of-own-open', 'of-own-open-2']);
                // The candidate count: denied rows stay in the total.
                expect(meta.total).toEqual(6);

                expect(analysisRepository.findManyCalls).toHaveLength(1);

                const evaluated = actor.permissionEvaluator.evaluateOneOfCalls;

                // One decision per distinct analysis that needs one, on the
                // analysis row and its realm.
                expect(evaluated.map((call) => call.data.get<Analysis>('attributes').id).sort())
                    .toEqual(['foreign-open', 'own-closed', 'own-open']);
                expect(evaluated.map((call) => call.data.get('realmMatch')).sort())
                    .toEqual(['realm-b', 'realm-b', 'realm-c']);
            });

            it('should find the analysis of a row whose fieldset left the column out', async () => {
                const repository = new SparseAnalysisNodeRepository();

                repository.seed(analysisNodeRepository.getAll());

                const actor = createScopedActor({
                    realmId: 'realm-b',
                    realmScope: 'any',
                    policy,
                });
                const { data } = await service.findMany(repository, new Query({}), await service.resolve(actor, ANALYSIS_NODE));

                expect(data.map((row) => row.id).sort())
                    .toEqual(['of-a-3', 'of-foreign-open', 'of-own-open', 'of-own-open-2']);
                // The projection is returned as it was read.
                expect(data.every((row) => row.analysisId === undefined)).toBe(true);
            });
        });
    });
});
