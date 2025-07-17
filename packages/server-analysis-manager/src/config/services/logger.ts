/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    createLogger,
    setLoggerFactory,
    useLogStore,
} from '@privateaim/server-kit';
import { WRITABLE_DIRECTORY_PATH } from '../../constants';
import { useEnv } from '../env';

export function setupLogger(): void {
    const store = useLogStore();
    store.setLabels({
        service: 'hub-server-analysis-manager',
        namespace: useEnv('env'),
        type: 'system',
    });

    setLoggerFactory(() => createLogger({
        directory: WRITABLE_DIRECTORY_PATH,
    }));
}
