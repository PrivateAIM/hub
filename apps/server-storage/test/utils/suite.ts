/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { write } from 'envix';
import { inject } from 'vitest';
import type { APIClient } from '@privateaim/storage-kit';
import type { TestHTTPApplication } from '../app/http.ts';
import { createTestApplication } from '../app/factory.ts';
import type { IStorageAdapter } from '../../src/core/storage/types.ts';
import { StorageInjectionKey } from '../../src/app/modules/storage/constants.ts';

class TestSuite {
    protected app: TestHTTPApplication;

    constructor() {
        write(
            'MINIO_CONNECTION_STRING',
            `http://admin:start123@${inject('MINIO_CONTAINER_HOST')}:${inject('MINIO_CONTAINER_PORT')}`,
        );
        this.app = createTestApplication();
    }

    client() : APIClient {
        return this.app.client;
    }

    storage() : IStorageAdapter {
        return this.app.container.resolve(StorageInjectionKey);
    }

    async up() {
        await this.app.setup();
    }

    async down() {
        await this.app.teardown();
    }
}

export function createTestSuite() : TestSuite {
    return new TestSuite();
}
