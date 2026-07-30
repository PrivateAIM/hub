/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Registry, 
    RegistryAPICommand, 
    RegistryProject, 
    ServiceID,
} from '@privateaim/core-kit';

/**
 * No entity shape at all: service commands are a protocol surface. The
 * endpoint acknowledges with 202 and an empty body, so there is nothing to
 * unwrap and no record to return.
 */
export interface IServiceAPI {
    runCommand(id: `${ServiceID}`, command: string, data?: Record<string, any>) : Promise<void>;

    runRegistryCommand(
        command: `${RegistryAPICommand}`,
        data: {
            id: Registry['id'] | RegistryProject['id'],
            [key: string]: any
        },
    ) : Promise<void>;
}
