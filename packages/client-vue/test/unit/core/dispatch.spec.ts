/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { SetupContext } from 'vue';
import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { createEntityManager } from '../../../src/core/entity-manager';
import { createList } from '../../../src/core/list';
import { mountClientVueComponent } from '../../utils';

// `createList` and `createEntityManager` resolve their sub-API by STRING
// through `pickEntityAPI`. Both are generic over every `DomainTypeMap` key —
// including keys the core client has no entity API for, and keys whose API is
// missing individual verbs — so these specs pin what happens at those edges.
//
// Both composables call `injectCoreHTTPClient()`, so they only work inside a
// component setup; each case drives them through a throwaway component.

// `createListRaw` calls `context.setup.expose(...)`, so it needs Vue's REAL
// setup context — a hand-rolled `{ emit, slots }` literal is not enough.
function mountWith(
    setup: (ctx: SetupContext<any>) => void,
    handlers: Record<string, any> = {},
) {
    const component = defineComponent({
        setup(_props, ctx) {
            setup(ctx as SetupContext<any>);
            return () => h('div');
        },
    });

    return mountClientVueComponent(component, {}, { core: handlers });
}

describe('createList dispatch', () => {
    it('should load through the sub-API the type names', async () => {
        let load: () => Promise<void>;

        const { coreClient } = mountWith((ctx) => {
            const list = createList({
                type: 'project', 
                setup: ctx, 
                props: {}, 
            });
            load = list.load;
        }, { 'GET /projects': () => ({ data: [{ id: 'p-1' }], meta: { total: 1 } }) });

        await load();

        expect(coreClient.requests).toHaveLength(1);
        expect(coreClient.requests[0].method).toBe('GET');
        expect(coreClient.requests[0].url).toContain('/projects');
    });

    it('should stay inert for a type the core client has no entity API for', async () => {
        // `analysisLog` is excluded from the registry: query-keyed `delete`,
        // telemetry `Log` records, no `id`. Previously this resolved to
        // `client.analysisLog` and `getMany` would have been called with a
        // rapiq query it cannot serve.
        let load: () => Promise<void>;

        const { coreClient } = mountWith((ctx) => {
            const list = createList({
                type: 'analysisLog', 
                setup: ctx, 
                props: {}, 
            });
            load = list.load;
        });

        await load();

        expect(coreClient.requests).toHaveLength(0);
    });
});

describe('createEntityManager dispatch', () => {
    it('should create through the sub-API the type names', async () => {
        let create: (entity: Record<string, any>) => Promise<void>;

        const { coreClient } = mountWith(() => {
            const manager = createEntityManager({ type: 'project' });
            create = manager.create;
        }, { 'POST /projects': () => ({ data: { id: 'p-1', name: 'demo' }, meta: {} }) });

        await create({ name: 'demo' });

        expect(coreClient.requests).toHaveLength(1);
        expect(coreClient.requests[0].method).toBe('POST');
        expect(coreClient.requests[0].body).toMatchObject({ name: 'demo' });
    });

    it('should resolve a record by id through the sub-API', async () => {
        let resolve: (ctx?: Record<string, any>) => Promise<unknown>;

        const { coreClient } = mountWith(() => {
            const manager = createEntityManager({ type: 'project' });
            resolve = manager.resolve;
        }, { 'GET /projects/:id': (req: any) => ({ data: { id: req.params.id }, meta: {} }) });

        const entity = await resolve({ id: 'p-42' });

        expect(entity).toMatchObject({ id: 'p-42' });
        expect(coreClient.requests[0].params).toEqual({ id: 'p-42' });
    });

    it('should no-op on create for an entity API that has no create verb', async () => {
        // REGRESSION: `masterImage` images come from catalog sync, so
        // `IMasterImageAPI` has no `create`. Before the per-verb guards this
        // threw "client.masterImage.create is not a function".
        let create: (entity: Record<string, any>) => Promise<void>;

        const { coreClient } = mountWith(() => {
            const manager = createEntityManager({ type: 'masterImage' });
            create = manager.create;
        });

        await expect(create({ name: 'nope' })).resolves.toBeUndefined();
        expect(coreClient.requests).toHaveLength(0);
    });

    it('should stay inert for a type the core client has no entity API for', async () => {
        let create: (entity: Record<string, any>) => Promise<void>;
        let resolve: (ctx?: Record<string, any>) => Promise<unknown>;

        const { coreClient } = mountWith(() => {
            const manager = createEntityManager({ type: 'analysisNodeLog' });
            create = manager.create;
            resolve = manager.resolve;
        });

        await create({ message: 'x' });
        await expect(resolve({ id: 'abc' })).resolves.toBeNull();

        expect(coreClient.requests).toHaveLength(0);
    });
});
