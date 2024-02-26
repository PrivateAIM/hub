/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createNodeDispatcher } from 'routup';
import supertest from 'supertest';
import { setup } from '../../src/config';
import { createHTTPRouter } from '../../src/http';

export type TestAgent = ReturnType<typeof supertest>;

export function useSuperTest() : TestAgent {
    setup();

    const router = createHTTPRouter();
    return supertest(createNodeDispatcher(router));
}
