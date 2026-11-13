/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition } from '@rapiq/core';
import { and, inArray, or } from '@rapiq/core';
import type { AnalysisBucketTypeReach, AnalysisReach, AnalysisReachPost } from './types.ts';

function isAnalysisReachPost(reach: AnalysisReach): reach is AnalysisReachPost {
    return reach.kind === 'post';
}

/**
 * One reach out of several: `build` combines their conditions, once over
 * what narrows the candidates and, when a part did not lower, again over
 * the parts refined for the candidate analyses.
 */
function combineAnalysisReach(
    reaches: AnalysisReach[],
    build: (conditions: (ICondition | undefined)[]) => ICondition | undefined,
): AnalysisReach {
    const narrowing = build(reaches.map((reach) => (reach.kind === 'post' ? reach.candidates : reach.condition)));
    const post = reaches.find((reach) => isAnalysisReachPost(reach));

    if (!post) {
        return { kind: 'lowered', condition: narrowing };
    }

    return {
        kind: 'post',
        candidates: narrowing,
        analysisIdAttributeName: post.analysisIdAttributeName,
        refine: async (analyses) => build(await Promise.all(
            reaches.map((reach) => (reach.kind === 'post' ? reach.refine(analyses) : reach.condition)),
        )),
    };
}

/** The analyses both reaches cover. */
export function intersectAnalysisReach(a: AnalysisReach, b: AnalysisReach): AnalysisReach {
    return combineAnalysisReach([a, b], ([first, second]) => (first && second ? and(first, second) : first ?? second));
}

/**
 * One reach over rows of several bucket types, each reached differently
 * (D2: CODE by every participant, RESULT/TEMP only through approval).
 */
export function buildAnalysisBucketTypeReach(
    typeAttributeName: string,
    branches: AnalysisBucketTypeReach[],
): AnalysisReach {
    const included: { types: AnalysisBucketTypeReach['types'], reach: AnalysisReach }[] = [];

    for (const { types, reach } of branches) {
        if (reach) {
            included.push({ types, reach });
        }
    }

    return combineAnalysisReach(included.map((branch) => branch.reach), (reaches) => {
        const reachesEveryAnalysis = included.length === branches.length &&
            reaches.every((reach) => reach === undefined);

        if (reachesEveryAnalysis) {
            return undefined;
        }

        const conditions = included.map((branch, index) => {
            const reach = reaches[index];

            return reach ?
                and(inArray(typeAttributeName, branch.types), reach) :
                inArray(typeAttributeName, branch.types);
        });

        if (conditions.length === 0) {
            return inArray('id', []);
        }

        return conditions.length === 1 ? conditions[0] : or(...conditions);
    });
}
