/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type {
    Analysis,
} from '../analysis';

export interface AnalysisLog {
    message: string,

    level: string,

    labels: Record<string, string>,

    time: string | bigint | null,

    analysis_id: Analysis['id'];

    realm_id: Realm['id'];
}
