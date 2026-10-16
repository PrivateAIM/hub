/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { EntityDefaultEventName } from '@authup/core-kit';
import { ClientManager } from '@authup/core-realtime-kit';
import { injectStore } from '@authup/client-web-kit';
import { DomainType, buildDomainNamespaceName } from '@privateaim/core-kit';
import type { CTSEvents, STCEvents } from '@privateaim/core-realtime-kit';
import { buildDomainEventFullName } from '@privateaim/kit';
import { flushPromises } from '@vue/test-utils';
import {
    defineComponent, 
    getCurrentInstance, 
    h, 
    ref,
} from 'vue';
import { describe, expect, it } from 'vitest';
import { createEntitySocket, resolveEntitySocketRealmId } from '../../../src/core/entity-socket';
import { provideSocketManager } from '../../../src/core/socket';
import { mountClientVueComponent } from '../../utils';

// The global namespace needs a grant reaching every realm, so a realm-bound
// user connecting there is refused and loses realtime silently.
describe('entity socket namespace', () => {
    it('should use the requested realm', () => {
        expect(resolveEntitySocketRealmId(DomainType.ANALYSIS, 'a', 'm')).toBe('a');
        expect(resolveEntitySocketRealmId(DomainType.ANALYSIS, ref('a'), 'm')).toBe('a');
    });

    it('should fall back to the management realm, also for an empty ref', () => {
        expect(resolveEntitySocketRealmId(DomainType.ANALYSIS, undefined, 'm')).toBe('m');
        expect(resolveEntitySocketRealmId(DomainType.ANALYSIS, ref(undefined), 'm')).toBe('m');
    });

    it('should use the global namespace for realm-less catalogs, whose events are published only there', () => {
        for (const type of [DomainType.MASTER_IMAGE, DomainType.MASTER_IMAGE_GROUP, DomainType.REGISTRY, DomainType.REGISTRY_PROJECT]) {
            expect(resolveEntitySocketRealmId(type, ref('a'), 'm')).toBeUndefined();
        }
    });
});

// Hands out real, never-connected sockets; acks resolve at once, so the
// subscribe/unsubscribe chain runs offline. Listener counts per namespace
// show which namespace a subscription is (still) attached to.
class OfflineClientManager extends ClientManager<STCEvents, CTSEvents> {
    override async connect(namespace?: string) {
        const socket = this.inject(namespace);
        socket.emitWithAck = async () => undefined;
        return socket;
    }
}

describe('entity socket subscription', () => {
    it('should leave the namespace it joined and rejoin when the management realm changes', async () => {
        const manager = new OfflineClientManager({ url: 'http://fake.test', options: { autoConnect: false } });
        const created = buildDomainEventFullName(DomainType.ANALYSIS, EntityDefaultEventName.CREATED);
        const listeners = (realmId: string) => manager.inject(buildDomainNamespaceName(realmId)).listeners(created).length;
        let store: ReturnType<typeof injectStore> | undefined;

        const component = defineComponent({
            setup() {
                provideSocketManager(manager, getCurrentInstance()?.appContext.app);
                store = injectStore();
                store.setRealmManagement({ id: 'r1', name: 'one' });
                createEntitySocket({ type: DomainType.ANALYSIS, onCreated: () => {} });
                return () => h('div');
            },
        });

        const { wrapper } = mountClientVueComponent(component, {}, {});
        await flushPromises();
        expect([listeners('r1'), listeners('r2')]).toEqual([1, 0]);

        store?.setRealmManagement({ id: 'r2', name: 'two' });
        await flushPromises();
        expect([listeners('r1'), listeners('r2')]).toEqual([0, 1]);

        wrapper.unmount();
        await flushPromises();
        expect([listeners('r1'), listeners('r2')]).toEqual([0, 0]);
    });
});
