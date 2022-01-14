/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AxiosInstance } from 'axios';
import { RegistryCommandType } from './harbor';
import { ServiceID } from './constants';
import { ServiceIDType } from './type';
import { SingleResourceResponse } from '../../type';
import { SecretStorageCommand } from './secret-engine';

export class ServiceAPI {
    protected client: AxiosInstance;

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    async runCommand(
        id: ServiceIDType,
        command: string,
        data: Record<string, any>,
    ): Promise<SingleResourceResponse<Record<string, any>>> {
        const { data: resultData } = await this.client.post(`services/${id}/command`, { command, ...data });

        return resultData;
    }

    async runRegistryCommand(
        command: RegistryCommandType,
        data: Record<string, any>,
    ): Promise<SingleResourceResponse<Record<string, any>>> {
        return this.runCommand(ServiceID.REGISTRY, command, data);
    }

    async runSecretStorageCommand(
        command: SecretStorageCommand,
        data: Record<string, any>,
    ): Promise<SingleResourceResponse<Record<string, any>>> {
        return this.runCommand(ServiceID.SECRET_STORAGE, command, data);
    }
}
