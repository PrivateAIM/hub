/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ConfigInput } from '@hapic/victorialogs';
import { VictoriaLogsClient } from '@hapic/victorialogs';
import { setVictoriaLogsClientFactory } from '../../services';
import { useEnv } from '../env';

export function configureVictoriaLogs() {
    const baseURL = useEnv('victoriaLogsURL');
    const ingestorURL = useEnv('victoriaLogsIngestorURL');
    const querierURL = useEnv('victoriaLogsQuerierURL');

    if (
        !baseURL &&
        !ingestorURL &&
        !querierURL
    ) {
        return;
    }

    const config : ConfigInput = {};
    if (baseURL) {
        config.request = {
            baseURL,
        };
    }

    if (ingestorURL) {
        config.options = config.options || {};
        config.options.ingesterURL = ingestorURL;
    }

    if (querierURL) {
        config.options = config.options || {};
        config.options.querierURL = querierURL;
    }

    setVictoriaLogsClientFactory(() => new VictoriaLogsClient(config));
}
