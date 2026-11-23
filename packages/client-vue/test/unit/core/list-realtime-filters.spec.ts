/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { EntityDefaultEventName } from '@authup/core-kit';
import { ClientManager } from '@authup/core-realtime-kit';
import { injectStore } from '@authup/client-web-kit';
import type { Analysis } from '@privateaim/core-kit';
import { DomainType, buildDomainChannelName, buildDomainNamespaceName } from '@privateaim/core-kit';
import type { FakeHandlerMap } from '@privateaim/core-http-kit/testing';
import type { CTSEvents, STCEvents } from '@privateaim/core-realtime-kit';
import { buildDomainEventFullName } from '@privateaim/kit';
import { contains, isCondition, or } from '@rapiq/core';
import { flushPromises } from '@vue/test-utils';
import type { SetupContext } from 'vue';
import {
    defineComponent,
    getCurrentInstance,
    h,
    ref,
} from 'vue';
import { describe, expect, it } from 'vitest';
import FAnalyses from '../../../src/components/analysis/FAnalyses';
import type { ListEventsType, ListLoadFn } from '../../../src/core';
import { createList, defineListProps } from '../../../src/core';
import { combineFilters, matchesQueryFilters } from '../../../src/core/query';
import { provideSocketManager } from '../../../src/core/socket';
import { createTestAnalysis } from '../../utils/factories';
import { mountClientVueComponent } from '../../utils';

class OfflineClientManager extends ClientManager<STCEvents, CTSEvents> {
    override async connect(namespace?: string) {
        const socket = this.inject(namespace);

        socket.emitWithAck = async () => undefined;

        return socket;
    }
}

describe('matchesQueryFilters', () => {
    it('should match everything without filters', () => {
        expect(matchesQueryFilters({ projectId: 'a' }, undefined)).toBe(true);
        expect(matchesQueryFilters({ projectId: 'a' }, {})).toBe(true);
    });

    it('should apply equality, membership and operator filters', () => {
        expect(matchesQueryFilters({ projectId: 'a' }, { projectId: 'a' })).toBe(true);
        expect(matchesQueryFilters({ projectId: 'b' }, { projectId: 'a' })).toBe(false);
        expect(matchesQueryFilters({ realmId: null }, { realmId: ['r', null] })).toBe(true);
        expect(matchesQueryFilters({ name: 'Foo' }, contains('name', 'oo'))).toBe(true);
        expect(matchesQueryFilters({ name: 'Bar' }, contains('name', 'oo'))).toBe(false);
    });

    it('should reject a relation filter the record carries no relation for', () => {
        expect(matchesQueryFilters({ analysisId: 'x' }, { analysis: { projectId: 'a' } })).toBe(false);
    });
});

describe('combineFilters', () => {
    it('should deep-merge two field bags, the incoming one winning', () => {
        expect(combineFilters({ projectId: 'p1', name: 'a' }, { name: 'b' })).toEqual({ projectId: 'p1', name: 'b' });
        expect(combineFilters({ analysis: { projectId: 'p1' } }, { analysis: { name: 'x' } }))
            .toEqual({ analysis: { projectId: 'p1', name: 'x' } });
    });

    it('should pass one side through when the other is empty', () => {
        const search = contains('name', 'x');

        expect(combineFilters({ projectId: 'p1' }, {})).toEqual({ projectId: 'p1' });
        expect(combineFilters(undefined, search)).toBe(search);
        expect(combineFilters({}, undefined)).toBeUndefined();
    });

    it('should AND an expression with a field bag instead of dropping the bag', () => {
        const combined = combineFilters({ projectId: 'p1' }, or(contains('name', 'foo'), contains('displayName', 'foo')));

        expect(isCondition(combined)).toBe(true);
        expect(matchesQueryFilters({ name: 'foo', projectId: 'p1' }, combined)).toBe(true);
        expect(matchesQueryFilters({ name: 'foo', projectId: 'p2' }, combined)).toBe(false);
        expect(matchesQueryFilters({ name: 'bar', projectId: 'p1' }, combined)).toBe(false);
    });
});

function mountAnalyses(core: FakeHandlerMap) {
    const manager = new OfflineClientManager({ url: 'http://fake.test', options: { autoConnect: false } });
    const state : { load?: ListLoadFn } = {};
    const host = defineComponent({
        setup() {
            provideSocketManager(manager, getCurrentInstance()?.appContext.app);
            injectStore().setRealmManagement({ id: 'r1', name: 'one' });

            return () => h(FAnalyses, { query: { filters: { projectId: 'p1' } } }, {
                header: (props: { load: ListLoadFn }) => {
                    state.load = props.load;

                    return null;
                },
                item: (props: { data: Analysis }) => h('div', { class: 'row' }, props.data.id),
            });
        },
    });

    const { wrapper, coreClient } = mountClientVueComponent(host, {}, { core });

    const emit = (data: Analysis) => {
        const [listener] = manager
            .inject(buildDomainNamespaceName('r1'))
            .listeners(buildDomainEventFullName(DomainType.ANALYSIS, EntityDefaultEventName.CREATED));

        listener({
            data,
            meta: {
                event: EntityDefaultEventName.CREATED,
                refType: DomainType.ANALYSIS,
                refId: data.id,
                roomName: buildDomainChannelName(DomainType.ANALYSIS),
            },
        });
    };

    const rows = () => wrapper.findAll('.row').map((el) => el.text());

    return {
        coreClient,
        emit,
        rows,
        state,
    };
}

describe('list realtime inserts', () => {
    it('should insert a created record only when it matches the list filters', async () => {
        const {
            coreClient,
            emit,
            rows,
            state,
        } = mountAnalyses({ 'GET /analyses': () => ({ data: [], meta: { total: 0 } }) });

        await flushPromises();

        const foreign = createTestAnalysis({ projectId: 'p2' });
        const own = createTestAnalysis({ projectId: 'p1' });

        emit(foreign);
        emit(own);
        await flushPromises();

        expect(rows()).toEqual([own.id]);

        // A search must keep the project scope, on the request and for inserts.
        await state.load!({ filters: contains('name', 'foo'), pagination: { offset: 0 } });
        await flushPromises();

        expect(decodeURIComponent(coreClient.requests.at(-1)!.url)).toContain("filter=and(and(eq(projectId,'p1')),contains(name,'foo'))");

        const foreignMatch = createTestAnalysis({ projectId: 'p2', name: 'foo' });
        const ownMatch = createTestAnalysis({ projectId: 'p1', name: 'foo' });

        emit(foreignMatch);
        emit(ownMatch);
        await flushPromises();

        expect(rows()).toEqual([ownMatch.id]);
    });

    it('should insert nothing while no load completed, since no filters are known yet', async () => {
        // A failed first load leaves the rows as they are: nothing would
        // replace a record inserted against the missing filters.
        const { emit, rows } = mountAnalyses({ 'GET /analyses': () => Promise.reject(new Error('unavailable')) });

        await flushPromises();

        emit(createTestAnalysis({ projectId: 'p2' }));
        await flushPromises();

        expect(rows()).toEqual([]);
    });
});

describe('list loadAll continuation', () => {
    it('should keep the first page scope for every page of one run', async () => {
        const scope = ref('p1');
        const { promise: pending, resolve: release } = Promise.withResolvers<void>();

        const component = defineComponent({
            props: defineListProps<Analysis>(),
            setup(props, setup) {
                const { render } = createList({
                    type: `${DomainType.ANALYSIS}`,
                    props,
                    setup: setup as unknown as SetupContext<ListEventsType<Analysis>>,
                    loadAll: true,
                    socket: false,
                    query: () => ({ filters: { projectId: scope.value } }),
                });

                return () => render();
            },
        });

        const { coreClient } = mountClientVueComponent(component, {}, {
            core: {
                'GET /analyses': async (request) => {
                    if (coreClient.requests.length === 1) {
                        await pending;
                    }

                    const offset = request.url.includes('offset=1') ? 1 : 0;

                    return {
                        data: [createTestAnalysis({ projectId: 'p1' })],
                        meta: {
                            total: 2, 
                            limit: 1, 
                            offset, 
                        },
                    };
                },
            },
        });

        await flushPromises();

        // the scope changes while the first page is in flight
        scope.value = 'p2';
        release();
        await flushPromises();

        const urls = coreClient.requests.map((el) => decodeURIComponent(el.url));

        expect(urls).toHaveLength(2);
        expect(urls[1]).toContain("filter=eq(projectId,'p1')");
    });
});
