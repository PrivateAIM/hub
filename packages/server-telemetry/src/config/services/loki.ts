/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ConfigInput } from '@hapic/loki';
import { LokiClient } from '@hapic/loki';
import { setLokiFactory } from '../../services';
import { useEnv } from '../env';

export function configureLoki() {
    const baseURL = useEnv('lokiURL');
    const compactorURL = useEnv('lokiCompactorURL');
    const querierURL = useEnv('lokiQuerierURL');

    if (!baseURL && !compactorURL && !querierURL) {
        return;
    }

    const config : ConfigInput = {};
    if (baseURL) {
        config.request = {
            baseURL,
        };
    }

    if (compactorURL) {
        config.options.compactorURL = compactorURL;
    }

    if (querierURL) {
        config.options.querierURL = querierURL;
    }

    setLokiFactory(() => new LokiClient(config));
}
