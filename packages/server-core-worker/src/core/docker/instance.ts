/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from 'docken';
import { createClient } from 'docken';

let dockerInstance : Client | undefined;

export function useDocker(): Client {
    if (typeof dockerInstance !== 'undefined') {
        return dockerInstance;
    }

    dockerInstance = createClient();
    return dockerInstance;
}
