/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * The mutex the boot-time node-client permission sync holds, so replicas
 * booting at once do not grant the same permission twice. Keep it stable
 * across releases: a renamed lock is a different mutex.
 */
export const NODE_CLIENT_SYNC_DATABASE_LOCK = 'server-core:node-client-sync';
