/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageCommandArgument } from '@privateaim/core-kit';

export type DockenImageAttributes = {
    name: string,
    command: string,
    commandArguments: MasterImageCommandArgument[]
};

export type DockenGroupAttributes = {
    name: string,
};
