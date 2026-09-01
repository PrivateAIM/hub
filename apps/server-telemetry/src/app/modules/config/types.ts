/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BaseServerConfig } from '@privateaim/server-kit';

export interface Config extends BaseServerConfig {
    publicURL: string;
    /** Days a bus-ingested event row is kept. `0` keeps rows forever. */
    eventRetentionDays: number;
    victoriaLogsURL?: string | null;
    victoriaLogsIngestorURL?: string | null;
    victoriaLogsQuerierURL?: string | null;
}
