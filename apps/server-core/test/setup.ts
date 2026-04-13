/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import 'reflect-metadata';
import { wait } from '@privateaim/kit';
import { TestDatabase } from './utils';

async function setup() {
    const database = new TestDatabase();
    await database.setup();
    await wait(0);
}
export {
    setup,
};
