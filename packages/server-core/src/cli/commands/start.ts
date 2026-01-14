/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CommandModule } from 'yargs';
import { startCommand } from '../../commands/index.ts';

export class StartCommand implements CommandModule {
    command = 'start';

    describe = 'Start the backend server.';

    // eslint-disable-next-line class-methods-use-this
    async handler() {
        await startCommand();
    }
}
