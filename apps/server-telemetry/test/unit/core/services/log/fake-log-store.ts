/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Log } from '@privateaim/telemetry-kit';
import { MemoryLogStore } from '../../../../../src/adapters/telemetry/memory.ts';
import type { LogStoreDeleteOptions, LogStoreQueryOptions } from '../../../../../src/core/index.ts';

export class FakeLogStore extends MemoryLogStore {
    public readonly queryCalls: LogStoreQueryOptions[] = [];

    public readonly deleteCalls: LogStoreDeleteOptions[] = [];

    async query(options: LogStoreQueryOptions = {}): Promise<[Log[], number]> {
        this.queryCalls.push(options);
        return super.query(options);
    }

    async delete(options: LogStoreDeleteOptions = {}): Promise<void> {
        this.deleteCalls.push(options);
    }
}
