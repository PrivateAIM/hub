/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProcessStatus } from '@privateaim/kit';
import type { MasterImageCommandArgument } from './types';

export interface MasterImage {
    id: string;

    buildStatus: `${ProcessStatus}` | null;

    buildProgress: number | null;

    buildHash: string | null;

    buildSize: number | null;

    path: string | null;

    virtualPath: string;

    groupVirtualPath: string;

    name: string;

    command: string | null;

    commandArguments: MasterImageCommandArgument[] | null;

    // ------------------------------------------------------------------

    createdAt: string;

    updatedAt: string;
}
