/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry, RegistryAPICommand, RegistryProject } from '@privateaim/core-kit';
import { ServiceID } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import { nullifyEmptyObjectProperties } from '../../utils';

export class ServiceAPI extends BaseAPI {
    /**
     * Service commands are a protocol surface, not an entity record: the
     * endpoint acknowledges with 202 and an empty body, so there is nothing
     * to unwrap.
     */
    async runCommand(
        id: `${ServiceID}`,
        command: string,
        data?: Record<string, any>,
    ): Promise<void> {
        data = data || {};

        await this.client.post(`services/${id}/command`, nullifyEmptyObjectProperties({ command, ...data }));
    }

    async runRegistryCommand(
        command: `${RegistryAPICommand}`,
        data: {
            id: Registry['id'] | RegistryProject['id'],
            [key: string]: any
        },
    ): Promise<void> {
        return this.runCommand(ServiceID.REGISTRY, command, data);
    }
}
