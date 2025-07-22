/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { LogStoreDeleteOptions, LogStoreQueryOptions } from '@privateaim/server-kit';

export type AnalysisLogQueryOptions = LogStoreQueryOptions & {
    node_id?: string,
    analysis_id?: string,
};

export type AnalysisLogDeleteOptions = LogStoreDeleteOptions & {
    node_id?: string,
    analysis_id?: string,
};
