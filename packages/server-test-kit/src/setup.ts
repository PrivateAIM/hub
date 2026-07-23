/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// Side-effecting worker bootstrap, referenced from each service's vitest
// `setupFiles`. It bridges the database + Authup connection details resolved
// during global setup into this worker's process.env, before any test
// application is built. Pair it with `'reflect-metadata'` in `setupFiles`.
import { hydrateTestEnv } from './testcontainers/index.ts';

hydrateTestEnv();
