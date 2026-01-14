/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Arguments, Argv, CommandModule } from 'yargs';
import {
    dropDatabase,
} from 'typeorm-extension';
import { useLogger } from '@privateaim/server-kit';
import { buildDataSourceOptions } from '../../database/index.ts';

interface ResetArguments extends Arguments {

}

export class ResetCommand implements CommandModule {
    command = 'reset';

    describe = 'Run reset operation.';

    builder(args: Argv) {
        return args;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async handler(_args: ResetArguments) {
        const spinner = useLogger();

        spinner.debug('Executing database reset...');
        const options = await buildDataSourceOptions();
        await dropDatabase({ options });
        spinner.debug('executed database reset.');

        process.exit(0);
    }
}
