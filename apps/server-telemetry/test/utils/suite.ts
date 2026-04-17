/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { write } from 'envix';
import { inject } from 'vitest';
import { EnvironmentInputKey } from '../../src/app/modules/config';
import { createTestApplication } from '../app/factory';

export function createTestSuite() {
    write(
        EnvironmentInputKey.VICTORIA_LOGS_URL,
        `http://${inject('VL_CONTAINER_HOST')}:${inject('VL_CONTAINER_PORT')}`,
    );

    const suite = createTestApplication();

    return {
        async setup() {
            await suite.setup();
        },

        async teardown() {
            await suite.teardown();
        },

        client() {
            return suite.client;
        },
    };
}
