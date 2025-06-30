/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeLog } from '@privateaim/core-kit';

export type AnalysisNodeLogQueryOptions = {
    node_id?: string,
    analysis_id?: string,
    start?: number,
    end?: number,
    sort?: 'DESC' | 'ASC',
    limit?: number
};

export type AnalysisNodeLogDeleteOptions = {
    node_id?: string,
    analysis_id?: string,
    start?: number,
    end?: number,
};

export interface AnalysisNodeLogStore {
    write(event: AnalysisNodeLog) : Promise<AnalysisNodeLog>;

    query(options: AnalysisNodeLogQueryOptions) : Promise<[AnalysisNodeLog[], number]>;

    delete(options: AnalysisNodeLogDeleteOptions) : Promise<void>;
}
