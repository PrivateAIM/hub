/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { LokiClient, setLokiFactory } from '@privateaim/server-kit';
import { useEnv } from '../env';

export function configureLoki() {
    const baseURL = useEnv('lokiURL');
    if (baseURL) {
        setLokiFactory(() => new LokiClient({
            request: {
                baseURL,
            },
        }));
    }
}
