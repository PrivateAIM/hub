/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import FEntityDelete from '../../../src/components/FEntityDelete';
import { mountClientVueComponent } from '../../utils';

// FEntityDelete is the best first target for hub's component-test environment:
// its setup injects ALL THREE http clients and dispatches on a
// `service: 'core' | 'storage' | 'telemetry'` prop, so one spec proves the
// whole injection chain end to end.
//
// Every mount passes `:with-prompt="false"`. The component defaults `withPrompt`
// to true and then calls `useAlertDialog()`, which THROWS without
// @vuecs/overlays installed ("[vuecs] No AlertDialogManager available"), and
// even once installed the delete only fires after an imperative confirm promise
// resolves. Covering the prompting path is separate follow-up work.
describe('FEntityDelete', () => {
    it('should delete through the core client and record the request', async () => {
        const { wrapper, coreClient } = mountClientVueComponent(
            FEntityDelete,
            {
                entityId: 'abc', 
                entityType: 'project', 
                withPrompt: false, 
            },
            { core: { 'DELETE /projects/:id': () => ({ data: { id: 'abc' }, meta: {} }) } },
        );

        await wrapper.trigger('click');
        await new Promise((resolve) => { setTimeout(resolve, 0); });

        expect(coreClient.requests).toHaveLength(1);
        expect(coreClient.requests[0]).toMatchObject({
            method: 'DELETE',
            params: { id: 'abc' },
        });
    });

    it('should emit `deleted` with the response record merged onto the id', async () => {
        const { wrapper } = mountClientVueComponent(
            FEntityDelete,
            {
                entityId: 'abc', 
                entityType: 'project', 
                withPrompt: false, 
            },
            { core: { 'DELETE /projects/:id': () => ({ data: { name: 'demo' }, meta: {} }) } },
        );

        await wrapper.trigger('click');
        await new Promise((resolve) => { setTimeout(resolve, 0); });

        expect(wrapper.emitted('deleted')).toBeTruthy();
        expect(wrapper.emitted('deleted')[0][0]).toEqual({ name: 'demo', id: 'abc' });
    });

    it('should dispatch to the storage client when service is storage', async () => {
        const {
            wrapper, 
            coreClient, 
            storageClient, 
        } = mountClientVueComponent(
            FEntityDelete,
            {
                entityId: 'xyz', 
                entityType: 'bucket', 
                service: 'storage', 
                withPrompt: false,
            },
            { storage: { 'DELETE /buckets/:id': () => ({ data: { id: 'xyz' }, meta: {} }) } },
        );

        await wrapper.trigger('click');
        await new Promise((resolve) => { setTimeout(resolve, 0); });

        expect(storageClient.requests).toHaveLength(1);
        expect(storageClient.requests[0]).toMatchObject({ method: 'DELETE', params: { id: 'xyz' } });
        expect(coreClient.requests).toHaveLength(0);
    });

    it('should emit `failed` when the server rejects', async () => {
        const { wrapper, coreClient } = mountClientVueComponent(
            FEntityDelete,
            {
                entityId: 'abc', 
                entityType: 'project', 
                withPrompt: false, 
            },
            { core: { 'DELETE /projects/:id': () => new Response(JSON.stringify({ message: 'nope' }), { status: 403, headers: { 'content-type': 'application/json' } }) } },
        );

        await wrapper.trigger('click');
        await new Promise((resolve) => { setTimeout(resolve, 0); });

        expect(coreClient.requests).toHaveLength(1);
        expect(wrapper.emitted('failed')).toBeTruthy();
        expect(wrapper.emitted('deleted')).toBeFalsy();
    });

    it('should no-op for an entity type the client has no sub-API for', async () => {
        // The dispatch sites rely on own-instance property lookup
        // (`client[entityType]`), which a real subclass preserves. An unknown
        // key resolves to undefined and the component returns early.
        const { wrapper, coreClient } = mountClientVueComponent(
            FEntityDelete,
            {
                entityId: 'abc', 
                entityType: 'notAnEntity', 
                withPrompt: false, 
            },
        );

        await wrapper.trigger('click');
        await new Promise((resolve) => { setTimeout(resolve, 0); });

        expect(coreClient.requests).toHaveLength(0);
        expect(wrapper.emitted('deleted')).toBeFalsy();
        expect(wrapper.emitted('failed')).toBeFalsy();
    });
});
