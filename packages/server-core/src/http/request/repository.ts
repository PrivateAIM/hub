/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Request } from 'routup';
import { getRequestHeader, getRequestIP, useRequestPath } from 'routup';
import type { Repository, SaveOptions } from 'typeorm';
import type { EventActor, EventDataRequest } from '@privateaim/core-kit';
import { useRequestIdentity } from '@privateaim/server-http-kit';
import type { RemoveOptions } from 'typeorm/repository/RemoveOptions';

type RepositoryEntity<T> = T extends Repository<infer U> ? U : never;

export class RequestRepositoryAdapter<T extends Repository<any>> {
    protected request: Request;

    protected repository: T;

    constructor(
        request: Request,
        repository: T,
    ) {
        this.request = request;
        this.repository = repository;
    }

    async save(
        entity: RepositoryEntity<T>,
        options: SaveOptions = {},
    ) : Promise<RepositoryEntity<T>> {
        return this.repository.save(entity, this.extendOptionsData(options));
    }

    async remove(
        entity: RepositoryEntity<T>,
        options: RemoveOptions = {},
    ): Promise<RepositoryEntity<T>> {
        return this.repository.remove(entity, this.extendOptionsData(options));
    }

    private extendOptionsData<F extends { data?: any, [key: string]: any }>(options: F) : F {
        const request : EventDataRequest = {
            path: useRequestPath(this.request),
            method: this.request.method || 'GET',
            user_agent: this.flattenString(
                getRequestHeader(this.request, 'user-agent'),
            ),
            ip_address: getRequestIP(this.request, { trustProxy: true }),
        };

        let actor : EventActor | undefined;

        const identity = useRequestIdentity(this.request);
        if (identity) {
            actor = {
                id: identity.id,
                type: identity.type,
                name: identity.attributes?.name,
            };
        }

        options.data = {
            ...(options.data),
            request,
            actor,
        };

        return options;
    }

    private flattenString(input: string | string[]) {
        if (typeof input === 'string') {
            return input;
        }

        return input.join(', ');
    }
}
