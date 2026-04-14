/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Request } from 'routup';
import { getRequestHeader, getRequestIP, useRequestPath } from 'routup';
import type { Repository, SaveOptions } from 'typeorm';
import { useRequestIdentity } from '@privateaim/server-http-kit';
import type { RemoveOptions } from 'typeorm/repository/RemoveOptions.js';
import type { EntityEventMetadata } from '@privateaim/server-kit';

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
        const metadata : Partial<EntityEventMetadata> = {
            request_path: useRequestPath(this.request),
            request_method: this.request.method || 'GET',
            request_user_agent: this.flattenString(
                getRequestHeader(this.request, 'user-agent'),
            ),
            request_ip_address: getRequestIP(this.request, { trustProxy: true }),
        };

        const identity = useRequestIdentity(this.request);
        if (identity) {
            metadata.actor_id = identity.id;
            metadata.actor_type = identity.type;
            metadata.actor_name = identity.attributes?.name;
        }

        options.data = {
            ...(options.data),
            ...metadata,
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
