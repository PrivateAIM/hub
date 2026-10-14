/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { DataSource } from 'typeorm';
import type { IEventRepository } from '../../../core/entities/index.ts';

export const DatabaseInjectionKey = {
    DataSource: new TypedToken<DataSource>('DataSource'),
    EventRepository: new TypedToken<IEventRepository>('EventRepository'),
};

/**
 * The mutex a boot-time (or CLI) migration run holds against every other, so
 * replicas booting at once apply the pending migrations once instead of
 * racing on the same tables. The name must stay STABLE across releases: a
 * renamed lock is a different mutex, so an outgoing and an incoming replica
 * would not wait for each other during a rolling upgrade.
 */
export const MIGRATION_DATABASE_LOCK = 'server-telemetry:migration';
