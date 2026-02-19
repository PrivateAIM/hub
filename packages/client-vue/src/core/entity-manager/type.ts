/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput, FieldsBuildInput, FiltersBuildInput } from 'rapiq';
import type {
    MaybeRef, Ref, SetupContext, SlotsType,
    VNodeChild,
} from 'vue';
import type { EntitySocketContext } from '../entity-socket';

type EntityWithID = {
    [key: string]: any,
    id: any
};

type EntityID<T> = T extends EntityWithID ?
    T['id'] :
    never;

export type EntityManagerRenderFn = () => VNodeChild;

export type EntityManagerResolveContext<T> = {
    id?: EntityID<T> | null,
    reset?: boolean,
    query?: T extends Record<string, any> ? BuildInput<T> : never
};

export type EntityManager<T> = {
    busy: Ref<boolean>,
    data: Ref<T | null>,
    error: Ref<Error | undefined>,
    lockId: Ref<EntityID<T> | undefined>,
    create(entity: Partial<T>): Promise<void>,
    createOrUpdate(entity: Partial<T>) : Promise<void>,
    created(entity: T) : void,
    update(entity: Partial<T>) : Promise<void>,
    updated(entity: T) : void,
    delete() : Promise<void>,
    deleted(entity?: T) : void;
    failed(e: Error) : void;
    resolve(ctx?: EntityManagerResolveContext<T>) : Promise<T | null>,
    resolveByRest(ctx?: EntityManagerResolveContext<T>) : Promise<T | null>,
    render(content?: VNodeChild | EntityManagerRenderFn) : VNodeChild;
};

export type EntityManagerProps<T> = {
    entity?: T,
    entityId?: EntityID<T>,
    queryFilters?: T extends Record<string, any> ? FiltersBuildInput<T> : never,
    queryFields?: T extends Record<string, any> ? FieldsBuildInput<T> : never,
    query?: T extends Record<string, any> ? BuildInput<T> : never
};

export type EntityManagerSlotProps<T> = {
    [K in keyof EntityManager<T>]: EntityManager<T>[K] extends Ref<infer U> ?
        U :
        EntityManager<T>[K]
};

export type EntityManagerSlotsType<T> = {
    default?: EntityManagerSlotProps<T>,
    error?: Error
};

export type EntityManagerEventsType<T> = {
    failed: (item: Error) => true,
    created: (item: T) => true,
    deleted: (item: T) => true,
    updated: (item: T) => true,
    resolved: (_item: T | undefined) => true
};

export type EntityManagerContext<
    A extends string,
    T extends Record<string, any>,
> = {
    type: A,
    setup?: Partial<SetupContext<EntityManagerEventsType<T>, SlotsType<EntityManagerSlotsType<T>>>>,
    props?: EntityManagerProps<T>,
    realmId?: MaybeRef<string> | ((entity: T | undefined) => string | undefined),
    onResolved?(entity: T | null) : any,
    onCreated?(entity: T): any,
    onUpdated?(entity: Partial<T>): any,
    onDeleted?(entity: T): any,
    onFailed?(e: Error): any,
    socket?: Omit<EntitySocketContext<A, T>, 'type'> | boolean;
};
