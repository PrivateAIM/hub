/*
 * Copyright (c) 2026.
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { APIClient } from '@privateaim/storage-kit';

export const StorageClientInjectionKey = new TypedToken<APIClient>('StorageClient');
