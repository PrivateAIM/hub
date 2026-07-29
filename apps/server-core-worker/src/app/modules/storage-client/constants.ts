/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { IStorageClient } from '@privateaim/storage-kit';

export const StorageClientInjectionKey = new TypedToken<IStorageClient>('StorageClient');
