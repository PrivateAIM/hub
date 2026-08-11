/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import type { FakeHandlerMap } from '@privateaim/core-http-kit/testing';
import { fakeResponse } from '@privateaim/core-http-kit/testing';
import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import type { EntityManager, EntityManagerResolveContext } from '../../../src/core';
import { createEntityManager, defineEntityManagerProps } from '../../../src/core';
import { mountClientVueComponent } from '../../utils';

/**
 * `createEntityManager` used to substitute an arbitrary entity: `resolveByRest`
 * skipped the `getOne` branch whenever `id` was falsy and fell through to
 * `getMany({ …query, pagination: { limit: 1 } })`, assigning `data[0]`.
 *
 * That turned a route-param regression on the registry-project detail page from
 * "the page does not load" into "the page shows an arbitrary registry project,
 * with its Harbor robot `accountSecret` rendered in the form" — the page passes
 * `entityId: route.params.projectId` AND `queryFields: ['+accountSecret', …]`,
 * so an `undefined` id left a `fields`-only query that matches every row.
 */

type ProbeHandle = {
    manager: EntityManager<any>,
    result: Promise<any>
};

function mountManagerProbe(
    props: Record<string, any>,
    resolveCtx: EntityManagerResolveContext<any> | undefined,
    handlers: FakeHandlerMap,
) {
    const handle = {} as ProbeHandle;

    const Probe = defineComponent({
        props: defineEntityManagerProps<any>(),
        setup(componentProps, setup) {
            const manager = createEntityManager({
                type: `${DomainType.PROJECT}`,
                props: componentProps,
                setup,
                // Keep the socket out of it — the harness omits `realtime`, so no
                // socket manager is installed to subscribe against.
                socket: false,
            });

            handle.manager = manager;
            handle.result = manager.resolve(resolveCtx);

            return () => h('div');
        },
    });

    const mounted = mountClientVueComponent(Probe, props, { core: handlers });

    return { ...mounted, handle };
}

describe('createEntityManager', () => {
    describe('when an id is supplied', () => {
        /**
         * The analysis detail page hydrates its project this way so the
         * breadcrumb can name it without a second request. Losing the
         * forwarding fails SILENTLY — the relation is simply absent and the
         * crumb falls back to a generic label.
         */
        it('should forward props.query relations to the lookup', async () => {
            const { coreClient, handle } = mountManagerProbe(
                { entityId: 'abc', query: { relations: { masterImage: true } } },
                undefined,
                {
                    'GET /projects/:id': (req) => ({
                        data: {
                            id: req.params.id, 
                            name: 'demo', 
                            masterImage: { id: 'mi-1', name: 'base' }, 
                        },
                        meta: {},
                    }),
                },
            );

            await handle.result;

            // rapiq serializes `relations` as `include` on the wire.
            expect(coreClient.requests[0].url).toContain('include=masterImage');
            expect(handle.manager.data.value.masterImage).toEqual({ id: 'mi-1', name: 'base' });
        });

        it('should resolve that entity', async () => {
            const { coreClient, handle } = mountManagerProbe(
                { entityId: 'abc' },
                undefined,
                { 'GET /projects/:id': (req) => ({ data: { id: req.params.id, name: 'demo' }, meta: {} }) },
            );

            await handle.result;

            expect(handle.manager.data.value).toEqual({ id: 'abc', name: 'demo' });
            expect(coreClient.requests).toHaveLength(1);
        });

        // The query deliberately carries a selector: without it the old code was
        // already stopped by its `if (resolveCtx.query && …)` guard, so the spec
        // would pass against the very behaviour it is meant to pin.
        it('should resolve null when the lookup fails, without falling back to the collection', async () => {
            const { coreClient, handle } = mountManagerProbe(
                { entityId: 'missing' },
                { query: { filters: { name: 'demo' } } },
                {
                    'GET /projects/:id': () => fakeResponse(404, { message: 'not found' }),
                    'GET /projects': () => ({ data: [{ id: 'someone-elses', name: 'other' }], meta: { total: 1 } }),
                },
            );

            await handle.result;

            expect(handle.manager.data.value).toBeNull();
            expect(handle.manager.error.value).toBeInstanceOf(Error);

            // The collection endpoint must not have been consulted at all.
            expect(coreClient.requests).toHaveLength(1);
            expect(coreClient.requests[0]).toMatchObject({ method: 'GET', params: { id: 'missing' } });
        });
    });

    describe('when no id is supplied', () => {
        it('should resolve null for a projection-only query, without issuing a request', async () => {
            const { coreClient, handle } = mountManagerProbe(
                { queryFields: ['+accountSecret'] },
                undefined,
                { 'GET /projects': () => ({ data: [{ id: 'someone-elses' }], meta: { total: 1 } }) },
            );

            await handle.result;

            expect(handle.manager.data.value).toBeNull();
            expect(coreClient.requests).toHaveLength(0);
        });

        it('should resolve null for an empty filter set, without issuing a request', async () => {
            const { coreClient, handle } = mountManagerProbe(
                {},
                { query: { filters: {} } },
                { 'GET /projects': () => ({ data: [{ id: 'someone-elses' }], meta: { total: 1 } }) },
            );

            await handle.result;

            expect(handle.manager.data.value).toBeNull();
            expect(coreClient.requests).toHaveLength(0);
        });

        // rapiq drops `undefined` filter values before the request, so a filter set
        // that is entirely undefined widens to everything rather than narrowing.
        it('should resolve null when every filter value is undefined', async () => {
            const { coreClient, handle } = mountManagerProbe(
                {},
                { query: { filters: { name: undefined } } },
                { 'GET /projects': () => ({ data: [{ id: 'someone-elses' }], meta: { total: 1 } }) },
            );

            await handle.result;

            expect(handle.manager.data.value).toBeNull();
            expect(coreClient.requests).toHaveLength(0);
        });

        // `null` is a real filter value ("where x is null"), not an absent one.
        it('should treat a null filter value as a selector', async () => {
            const { coreClient, handle } = mountManagerProbe(
                {},
                { query: { filters: { name: null } } },
                { 'GET /projects': () => ({ data: [{ id: 'abc', name: null }], meta: { total: 1 } }) },
            );

            await handle.result;

            expect(handle.manager.data.value).toEqual({ id: 'abc', name: null });
            expect(coreClient.requests).toHaveLength(1);
        });

        it('should still resolve through the collection when the query carries a selector', async () => {
            const { coreClient, handle } = mountManagerProbe(
                {},
                { query: { filters: { name: 'demo' } } },
                { 'GET /projects': () => ({ data: [{ id: 'abc', name: 'demo' }], meta: { total: 1 } }) },
            );

            await handle.result;

            expect(handle.manager.data.value).toEqual({ id: 'abc', name: 'demo' });
            expect(coreClient.requests).toHaveLength(1);
            expect(coreClient.requests[0]).toMatchObject({ method: 'GET' });
        });

        it('should resolve null when the selector matches nothing', async () => {
            const { handle } = mountManagerProbe(
                {},
                { query: { filters: { name: 'demo' } } },
                { 'GET /projects': () => ({ data: [], meta: { total: 0 } }) },
            );

            await handle.result;

            expect(handle.manager.data.value).toBeNull();
        });
    });

    // The exact shape of the registry-project detail page: an id that failed to
    // resolve to a route param, plus the `fields` selection the page needs.
    it('should not substitute an entity when a supplied entityId is undefined', async () => {
        const { coreClient, handle } = mountManagerProbe(
            {
                entityId: undefined,
                queryFields: ['+accountId', '+accountName', '+accountSecret'],
            },
            undefined,
            { 'GET /projects': () => ({ data: [{ id: 'someone-elses', accountSecret: 'leaked' }], meta: { total: 1 } }) },
        );

        await handle.result;

        expect(handle.manager.data.value).toBeNull();
        expect(coreClient.requests).toHaveLength(0);
    });

    // An id that resolves to `''` rather than `undefined` is the same failure with
    // a different shape — a route param can be either. Truthiness cannot tell an
    // empty id from an absent one, so both gates test for presence instead.
    describe('when a supplied id is blank', () => {
        it('should not fall through to the collection via props', async () => {
            const { coreClient, handle } = mountManagerProbe(
                {
                    entityId: '',
                    queryFilters: { name: 'demo' },
                },
                undefined,
                { 'GET /projects': () => ({ data: [{ id: 'someone-elses', name: 'demo' }], meta: { total: 1 } }) },
            );

            await handle.result;

            expect(handle.manager.data.value).toBeNull();
            expect(coreClient.requests).toHaveLength(0);
        });

        it('should not fall through to the collection via the resolve context', async () => {
            const { coreClient, handle } = mountManagerProbe(
                {},
                { id: '', query: { filters: { name: 'demo' } } },
                { 'GET /projects': () => ({ data: [{ id: 'someone-elses', name: 'demo' }], meta: { total: 1 } }) },
            );

            await handle.result;

            expect(handle.manager.data.value).toBeNull();
            expect(coreClient.requests).toHaveLength(0);
        });

        // A blank id must not reach `getOne` either: `getOne('')` builds `GET
        // /projects/`, which is the COLLECTION endpoint — the same arbitrary-row
        // read by another route.
        it('should not request the collection endpoint through getOne', async () => {
            const { coreClient, handle } = mountManagerProbe(
                { entityId: '' },
                undefined,
                { '*': () => ({ data: [{ id: 'someone-elses' }], meta: { total: 1 } }) },
            );

            await handle.result;

            expect(handle.manager.data.value).toBeNull();
            expect(coreClient.requests).toHaveLength(0);
        });
    });
});
