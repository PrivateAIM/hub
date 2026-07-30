/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { IAppEvent } from 'routup';
import { getRequestHeader, getRequestIP } from 'routup';
import type { Repository, SaveOptions } from 'typeorm';
import { useRequestIdentity } from '@privateaim/server-http-kit';
import type { RemoveOptions } from 'typeorm/repository/RemoveOptions.js';
import type { EntityEventMetadata } from '@privateaim/server-kit';

type RepositoryEntity<T> = T extends Repository<infer U> ? U : never;

export class RequestRepositoryAdapter<T extends Repository<any>> {
    protected event: IAppEvent;

    protected repository: T;

    constructor(
        event: IAppEvent,
        repository: T,
    ) {
        this.event = event;
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
            requestPath: this.event.path,
            requestMethod: this.event.method || 'GET',
            requestUserAgent: this.flattenString(
                getRequestHeader(this.event, 'user-agent'),
            ),
            requestIpAddress: getRequestIP(this.event, { trustProxy: true }),
        };

        const identity = useRequestIdentity(this.event);
        if (identity) {
            metadata.actorId = identity.id;
            metadata.actorType = identity.type;
            metadata.actorName = identity.attributes?.name;
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
