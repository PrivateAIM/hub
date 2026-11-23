/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'eldin';
import { HTTPClientTimeout } from '@privateaim/server-kit';
import { ErrorCode, createClientError } from 'hapic';
import { describe, expect, it } from 'vitest';
import { GitHubClient } from '../../../src/adapters/github/index.ts';
import { isTransientError } from '../../../src/app/components/helpers.ts';
import { ConfigInjectionKey } from '../../../src/app/modules/config/index.ts';
import { normalizeConfig } from '../../../src/app/modules/config/normalize.ts';
import { CoreClientInjectionKey, CoreClientModule } from '../../../src/app/modules/core-client/index.ts';
import { StorageClientInjectionKey, StorageClientModule } from '../../../src/app/modules/storage-client/index.ts';

async function createContainer() : Promise<Container> {
    const container = new Container();

    container.register(ConfigInjectionKey, {
        useValue: await normalizeConfig({
            authupURL: 'http://authup.test/',
            coreURL: 'http://core.test/',
            storageURL: 'http://storage.test/',
        }),
    });

    return container;
}

describe('outbound client timeouts', () => {
    it('should bound the core client', async () => {
        const container = await createContainer();

        await new CoreClientModule().setup(container);

        expect(container.resolve(CoreClientInjectionKey).toOptions().timeout).toBe(HTTPClientTimeout.SERVICE);
    });

    it('should bound the storage client', async () => {
        const container = await createContainer();

        await new StorageClientModule().setup(container);

        expect(container.resolve(StorageClientInjectionKey).toOptions().timeout).toBe(HTTPClientTimeout.SERVICE);
    });

    it('should bound the GitHub client', () => {
        expect(new GitHubClient().toOptions().timeout).toBe(HTTPClientTimeout.SERVICE);
    });

    it('should retry a request that timed out', () => {
        const error = createClientError({
            code: ErrorCode.CONNECTION_TIMEOUT,
            request: { method: 'GET', url: 'http://core.test/analyses/a' },
        });

        expect(isTransientError(error)).toBe(true);
    });
});
