/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
    IEntityRepository,
} from '@privateaim/server-kit';

export class FakeEntityRepository<T extends Record<string, any>> implements IEntityRepository<T> {
    private store: T[] = [];

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<T>> {
        const limit = query?.page?.limit ?? 50;
        const offset = query?.page?.offset ?? 0;

        return {
            data: this.store.slice(offset, offset + limit),
            meta: {
                total: this.store.length,
                limit,
                offset,
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
        } as T;
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
