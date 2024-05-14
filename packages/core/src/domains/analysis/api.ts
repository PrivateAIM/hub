/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from 'hapic';
import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import { BaseAPI } from '../base';
import type { Analysis } from './entity';
import { nullifyEmptyObjectProperties } from '../../utils';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';
import type { AnalysisAPICommand } from './constants';

export class AnalysisAPI extends BaseAPI {
    // todo: we properly don't need this anymore
    getResultDownloadPath(id: Analysis['id']) {
        return `analyses/${id}/result/download`;
    }

    getResultDownloadURL(id: Analysis['id']) {
        return new URL(
            this.getResultDownloadPath(id),
            this.client.getBaseURL(),
        ).href;
    }

    getFilesDownloadPath(id: Analysis['id']): string {
        return `analyses/${id}/files/download`;
    }

    getFileDownloadURL(id: Analysis['id']) {
        return new URL(
            this.getFilesDownloadPath(id),
            this.client.getBaseURL(),
        ).href;
    }

    async getMany(
        options?: BuildInput<Analysis>,
    ): Promise<CollectionResourceResponse<Analysis>> {
        const { data: response } = await this.client.get(`analyses${buildQuery(options)}`);
        return response;
    }

    async getOne(
        id: Analysis['id'],
        options?: BuildInput<Analysis>,
        requestConfig?: RequestBaseOptions,
    ): Promise<SingleResourceResponse<Analysis>> {
        const { data: response } = await this.client
            .get(`analyses/${id}${buildQuery(options)}`, requestConfig);

        return response;
    }

    async delete(id: Analysis['id']): Promise<SingleResourceResponse<Analysis>> {
        const { data: response } = await this.client.delete(`analyses/${id}`);

        return response;
    }

    async update(id: Analysis['id'], data: Partial<Analysis>): Promise<SingleResourceResponse<Analysis>> {
        const { data: response } = await this.client.post(`analyses/${id}`, nullifyEmptyObjectProperties(data));

        return response;
    }

    async create(data: Partial<Analysis>): Promise<SingleResourceResponse<Analysis>> {
        const { data: response } = await this.client.post('analyses', nullifyEmptyObjectProperties(data));

        return response;
    }

    async runCommand(
        id: Analysis['id'],
        command: `${AnalysisAPICommand}` | AnalysisAPICommand,
        data: Record<string, any> = {},
    ): Promise<SingleResourceResponse<Analysis>> {
        const actionData = {
            command,
            ...data,
        };

        const { data: response } = await this.client
            .post(`analyses/${id}/command`, actionData);

        return response;
    }

    async streamFiles(id: Analysis['id']) {
        const response = await this.client.get(this.getFilesDownloadPath(id), {
            responseType: 'stream',
        });

        return response.data;
    }

    async downloadResult(id: Analysis['id']) {
        const response = await this.client.get(this.getResultDownloadPath(id), {
            responseType: 'stream',
        });

        return response.data;
    }
}
