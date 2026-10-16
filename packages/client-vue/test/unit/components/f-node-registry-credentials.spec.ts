/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import FNodeRegistryCredentials from '../../../src/components/node/FNodeRegistryCredentials.vue';
import { mountClientVueComponent } from '../../utils';

/**
 * The robot account of a node's registry project is provisioned over the
 * message bus, a moment AFTER the node create/update returned, so the first
 * credentials read can come back without a secret.
 */
function mountCredentials(secrets: (string | null)[]) {
    let calls = 0;

    return mountClientVueComponent(
        FNodeRegistryCredentials,
        {
            entity: {
                id: 'node-1',
                name: 'test-node',
                realmId: 'realm-1',
                registryId: 'registry-1',
                registryProjectId: 'project-1',
            },
        },
        {
            core: {
                'GET /nodes/:id/registry/credentials': () => ({
                    host: 'harbor.test',
                    externalName: 'project',
                    accountName: 'robot',
                    accountSecret: secrets[Math.min(calls++, secrets.length - 1)],
                }),
            },
        },
    );
}

function credentialReads(coreClient: ReturnType<typeof mountCredentials>['coreClient']) {
    return coreClient.requests.filter((request) => request.url.includes('/registry/credentials')).length;
}

describe('FNodeRegistryCredentials', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should re-read the credentials until the secret is provisioned', async () => {
        const { wrapper, coreClient } = mountCredentials([null, 'secret']);

        await vi.advanceTimersByTimeAsync(0);
        expect(credentialReads(coreClient)).toBe(1);
        expect(wrapper.text()).toContain('Loading credentials');

        await vi.advanceTimersByTimeAsync(1500);
        expect(credentialReads(coreClient)).toBe(2);
        expect(wrapper.text()).not.toContain('Loading credentials');
        // VCFormInput is registered globally by the host app, not here, so
        // read the bound state rather than the rendered input.
        expect(wrapper.vm.accountSecret).toBe('secret');
    });

    it('should give up after three re-reads', async () => {
        const { wrapper, coreClient } = mountCredentials([null]);

        await vi.advanceTimersByTimeAsync(10_000);
        expect(credentialReads(coreClient)).toBe(4);
        expect(wrapper.text()).not.toContain('Loading credentials');
    });

    it('should stop re-reading once unmounted', async () => {
        const { wrapper, coreClient } = mountCredentials([null]);

        await vi.advanceTimersByTimeAsync(0);
        wrapper.unmount();

        await vi.advanceTimersByTimeAsync(10_000);
        expect(credentialReads(coreClient)).toBe(1);
    });
});
