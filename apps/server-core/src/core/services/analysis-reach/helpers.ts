/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition } from '@rapiq/core';
import { and, inArray, or } from '@rapiq/core';
import type { AnalysisBucketTypeReach } from './types.ts';

/**
 * One condition over rows of several bucket types, each reached differently
 * (D2: CODE by every participant, RESULT/TEMP only through approval).
 * `undefined` when every type reaches every analysis.
 */
export function buildAnalysisBucketTypeReach(
    typeAttributeName: string,
    branches: AnalysisBucketTypeReach[],
): ICondition | undefined {
    const reachesEveryAnalysis = branches.every((branch) => branch.reach === undefined);

    if (reachesEveryAnalysis) {
        return undefined;
    }

    const conditions = branches
        .filter((branch) => branch.reach !== null)
        .map((branch) => (branch.reach ?
            and(inArray(typeAttributeName, branch.types), branch.reach) :
            inArray(typeAttributeName, branch.types)));

    if (conditions.length === 0) {
        return inArray('id', []);
    }

    return conditions.length === 1 ? conditions[0] : or(...conditions);
}
