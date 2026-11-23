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
import type { CTSEvents, STCEvents } from '@privateaim/core-realtime-kit';
import { buildDomainEventFullName } from '@privateaim/kit';
import { contains, isCondition, or } from '@rapiq/core';
import { flushPromises } from '@vue/test-utils';
import { defineComponent, getCurrentInstance, h } from 'vue';
import { describe, expect, it } from 'vitest';
import FAnalyses from '../../../src/components/analysis/FAnalyses';
import type { ListLoadFn } from '../../../src/core';
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

describe('list realtime inserts', () => {
    it('should insert a created record only when it matches the list filters', async () => {
        const manager = new OfflineClientManager({ url: 'http://fake.test', options: { autoConnect: false } });
        let load: ListLoadFn | undefined;
        const host = defineComponent({
            setup() {
                provideSocketManager(manager, getCurrentInstance()?.appContext.app);
                injectStore().setRealmManagement({ id: 'r1', name: 'one' });

                return () => h(FAnalyses, { query: { filters: { projectId: 'p1' } } }, {
                    header: (props: { load: ListLoadFn }) => {
                        load = props.load;

                        return null;
                    },
                    item: (props: { data: Analysis }) => h('div', { class: 'row' }, props.data.id),
                });
            },
        });

        const { wrapper, coreClient } = mountClientVueComponent(host, {}, { core: { 'GET /analyses': () => ({ data: [], meta: { total: 0 } }) } });

        await flushPromises();

        const [listener] = manager
            .inject(buildDomainNamespaceName('r1'))
            .listeners(buildDomainEventFullName(DomainType.ANALYSIS, EntityDefaultEventName.CREATED));

        const emit = (data: Analysis) => listener({
            data,
            meta: {
                event: EntityDefaultEventName.CREATED,
                refType: DomainType.ANALYSIS,
                refId: data.id,
                roomName: buildDomainChannelName(DomainType.ANALYSIS),
            },
        });

        const foreign = createTestAnalysis({ projectId: 'p2' });
        const own = createTestAnalysis({ projectId: 'p1' });

        emit(foreign);
        emit(own);
        await flushPromises();

        expect(wrapper.findAll('.row').map((el) => el.text())).toEqual([own.id]);

        // A search must keep the project scope, on the request and for inserts.
        await load!({ filters: contains('name', 'foo'), pagination: { offset: 0 } });
        await flushPromises();

        expect(decodeURIComponent(coreClient.requests.at(-1)!.url)).toContain("filter=and(and(eq(projectId,'p1')),contains(name,'foo'))");

        const foreignMatch = createTestAnalysis({ projectId: 'p2', name: 'foo' });
        const ownMatch = createTestAnalysis({ projectId: 'p1', name: 'foo' });

        emit(foreignMatch);
        emit(ownMatch);
        await flushPromises();

        expect(wrapper.findAll('.row').map((el) => el.text())).toEqual([ownMatch.id]);
    });
});
