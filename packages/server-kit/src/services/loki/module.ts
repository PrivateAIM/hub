/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    LokiClient,
    CompactorDeletionRequestCreate as LokiCompactorDeletionRequestCreate,
    DistributorPushStream as LokiDistributorPushStream,
    QuerierQueryRangeOptions as LokiQuerierQueryRangeOptions,
    QuerierQueryResult as LokiQuerierQueryResult,
    createClient as createLokiClient,
    nanoSeconds,
} from '@hapic/loki';

export {
    LokiClient,
    LokiCompactorDeletionRequestCreate,
    LokiDistributorPushStream,
    LokiQuerierQueryRangeOptions,
    LokiQuerierQueryResult,
    createLokiClient,
    nanoSeconds,
};
