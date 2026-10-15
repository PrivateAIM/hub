/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNode } from '@privateaim/core-kit';
import type { IAnalysisNodeRepository } from '../../../../../src/core/entities/analysis-node/types.ts';
import { FakeEntityRepository } from '@privateaim/server-test-kit';

/**
 * Mirrors the typeorm adapter's relation loading: `findManyBy` is a plain
 * `findBy` and returns rows WITHOUT their relations, only
 * `findManyWithNodeByAnalysis` loads `node`. A fake that handed back the
 * seeded relation from every find would hide code reading `node` off a
 * relation-less read (the builder's approval reset did exactly that).
 */
export class FakeAnalysisNodeRepository extends FakeEntityRepository<AnalysisNode> implements IAnalysisNodeRepository {
    async findManyBy(where: Record<string, any>): Promise<AnalysisNode[]> {
        const entities = await super.findManyBy(where);

        return entities.map((entity) => ({
            ...entity, 
            node: undefined, 
            analysis: undefined, 
        }));
    }

    async findManyWithNodeByAnalysis(analysisId: string): Promise<AnalysisNode[]> {
        return super.findManyBy({ analysisId });
    }

    async findAnalysisIds(where: { nodeId: string } | { nodeRealmId: string }): Promise<string[]> {
        const entities = await super.findManyBy(where);

        return [...new Set(entities.map((entity) => entity.analysisId))];
    }
}
