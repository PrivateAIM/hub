/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { IQuery } from '@rapiq/core';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
    IEntityRepository,
} from '@privateaim/server-kit';

export class FakeEntityRepository<T extends Record<string, any>> implements IEntityRepository<T> {
    private store: T[] = [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async findMany(query: IQuery): Promise<EntityRepositoryFindManyResult<T>> {
        return {
            data: [...this.store],
            meta: {
                total: this.store.length,
                offset: 0,
                limit: 50,
            },
        };
    }

    async findOneById(id: string): Promise<T | null> {
        return this.store.find((e) => (e as any).id === id) ?? null;
    }

    async findOneBy(where: Record<string, any>): Promise<T | null> {
        return this.store.find((e) => this.matchesWhere(e, where)) ?? null;
    }

    async findManyBy(where: Record<string, any>): Promise<T[]> {
        return this.store.filter((e) => this.matchesWhere(e, where));
    }

    create(data: Partial<T>): T {
        return {
            id: randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...data,
        } as Partial<T> as T;
    }

    merge(entity: T, data: Partial<T>): T {
        return {
            ...entity,
            ...data,
            updated_at: new Date().toISOString(),
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async save(entity: T, ctx?: EntityPersistContext): Promise<T> {
        const index = this.store.findIndex((e) => (e as any).id === (entity as any).id);
        if (index >= 0) {
            this.store[index] = entity;
        } else {
            this.store.push(entity);
        }
        return entity;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async remove(entity: T, ctx?: EntityPersistContext): Promise<void> {
        const index = this.store.findIndex((e) => (e as any).id === (entity as any).id);
        if (index >= 0) {
            this.store.splice(index, 1);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async validateJoinColumns(data: Partial<T>): Promise<void> {
        // no-op in fake
    }

    // --- Test helpers ---

    getAll(): T[] {
        return [...this.store];
    }

    clear(): void {
        this.store = [];
    }

    seed(entities: T[]): T[];
    seed(entity: T): T;
    seed(input: T | T[]): T | T[] {
        if (Array.isArray(input)) {
            this.store.push(...input);
            return input;
        }

        this.store.push(input);
        return input;
    }

    private matchesWhere(entity: T, where: Record<string, any>): boolean {
        return Object.entries(where).every(([key, value]) => entity[key] === value);
    }
}
