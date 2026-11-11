/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IStorageClient } from '@privateaim/storage-kit';
import { inject, provide } from 'vue';
import type { AnalysisStorageScope } from './types';

const scopeSymbol = Symbol.for('FAnalysisStorageScope');
const clientSymbol = Symbol.for('FStorageHTTPClient');

export function provideAnalysisStorageScope(scope: AnalysisStorageScope): void {
    provide(scopeSymbol, scope);
}

export function injectAnalysisStorageScope(): AnalysisStorageScope | undefined {
    return inject<AnalysisStorageScope | undefined>(scopeSymbol, undefined);
}

/**
 * Shadow the storage client for the subtree of the calling component.
 * Vue's own `provide` is used on purpose: authup's `provide` refuses to
 * overwrite an existing value.
 */
export function provideScopedStorageHTTPClient(client: IStorageClient): void {
    provide(clientSymbol, client);
}
