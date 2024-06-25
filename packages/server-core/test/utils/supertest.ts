/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createNodeDispatcher } from 'routup';
import supertest from 'supertest';
import { createRouter } from '../../src/http/router';

export type TestAgent = ReturnType<typeof supertest>;

export function useSuperTest() : TestAgent {
    const router = createRouter();
    return supertest(createNodeDispatcher(router));
}
