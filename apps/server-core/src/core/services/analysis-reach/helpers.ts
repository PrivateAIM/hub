/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition } from '@rapiq/core';
import { and, inArray, or } from '@rapiq/core';
import { readPath } from '@privateaim/server-kit';
import type {
    AnalysisBucketTypeReach,
    AnalysisReach,
    AnalysisReachPost,
    AnalysisRowMatcher,
} from './types.ts';

function isAnalysisReachPost(reach: AnalysisReach): reach is AnalysisReachPost {
    return reach.kind === 'post';
}

type CombineAnalysisReachOptions = {
    /** Combine the parts' conditions: what narrows the candidates. */
    build: (conditions: (ICondition | undefined)[]) => ICondition | undefined,
    /**
     * Decide a row from the parts' matchers; a part that lowered has none,
     * it holds for every row through the candidates.
     */
    match: (matchers: (AnalysisRowMatcher | undefined)[], row: object) => boolean,
    /** Fields of the row the match reads besides the parts' own. */
    checkFields?: string[],
};

/**
 * One reach out of several: `build` combines their conditions over what
 * narrows the candidates, and when a part did not lower, `match` decides
 * each candidate row from the parts refined for the page's analyses.
 */
function combineAnalysisReach(reaches: AnalysisReach[], options: CombineAnalysisReachOptions): AnalysisReach {
    const narrowing = options.build(reaches.map((reach) => (reach.kind === 'post' ? reach.candidates : reach.condition)));
    const posts = reaches.filter((reach) => isAnalysisReachPost(reach));

    if (posts.length === 0) {
        return { kind: 'lowered', condition: narrowing };
    }

    const [post] = posts;

    return {
        kind: 'post',
        candidates: narrowing,
        analysisPath: post.analysisPath,
        analysisIdAttributeName: post.analysisIdAttributeName,
        checkFields: [...new Set([...posts.flatMap((part) => part.checkFields), ...(options.checkFields ?? [])])],
        refine: async (analyses) => {
            const matchers = await Promise.all(
                reaches.map((reach) => (reach.kind === 'post' ? reach.refine(analyses) : undefined)),
            );

            return (row) => options.match(matchers, row);
        },
    };
}

/** The analyses both reaches cover. */
export function intersectAnalysisReach(a: AnalysisReach, b: AnalysisReach): AnalysisReach {
    return combineAnalysisReach([a, b], {
        build: ([first, second]) => (first && second ? and(first, second) : first ?? second),
        match: (matchers, row) => matchers.every((matcher) => !matcher || matcher(row)),
    });
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

    return combineAnalysisReach(included.map((branch) => branch.reach), {
        build: (reaches) => {
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
        },
        // The row's own type picks its branch, as in the candidates: the
        // branches' types are disjoint, so a candidate of a type satisfied
        // that branch's lowered part.
        match: (matchers, row) => {
            const type = readPath(row, typeAttributeName);

            if (typeof type !== 'string') {
                return false;
            }

            const index = included.findIndex((branch) => {
                const { types }: { types: readonly string[] } = branch;

                return types.includes(type);
            });

            if (index === -1) {
                return false;
            }

            const matcher = matchers[index];

            return !matcher || matcher(row);
        },
        checkFields: [typeAttributeName],
    });
}
