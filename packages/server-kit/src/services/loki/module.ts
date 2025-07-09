/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    LokiClient,
    CompactorDeletionRequestCreate as LokiCompactorDeletionRequestCreate,
    Config as LokiConfig,
    ConfigInput as LokiConfigInput,
    DistributorPushStream as LokiDistributorPushStream,
    QuerierQueryRangeOptions as LokiQuerierQueryRangeOptions,
    QuerierQueryResult as LokiQuerierQueryResult,
    createClient as createLokiClient,
    nanoSeconds,
} from '@hapic/loki';

export {
    LokiClient,
    LokiConfig,
    LokiConfigInput,
    LokiCompactorDeletionRequestCreate,
    LokiDistributorPushStream,
    LokiQuerierQueryRangeOptions,
    LokiQuerierQueryResult,
    createLokiClient,
    nanoSeconds,
};
