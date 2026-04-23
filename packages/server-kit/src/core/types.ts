/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PaginationParseOutput } from 'rapiq';

export type EntityRepositoryFindManyResult<T> = {
    data: T[];
    meta: PaginationParseOutput & {
        total: number;
    };
};

export type EntityPersistContext = {
    data?: Record<string, any>;
};

export interface IEntityRepository<T> {
    findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<T>>;

    findOneById(id: string): Promise<T | null>;

    findOneBy(where: Record<string, any>): Promise<T | null>;

    findManyBy(where: Record<string, any>): Promise<T[]>;

    create(data: Partial<T>): T;

    merge(entity: T, data: Partial<T>): T;

    save(entity: T, ctx?: EntityPersistContext): Promise<T>;

    remove(entity: T, ctx?: EntityPersistContext): Promise<void>;

    validateJoinColumns(data: Partial<T>): Promise<void>;
}
