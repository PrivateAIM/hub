/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * The mutex a node-client permission sync holds, so replicas syncing at once
 * do not grant the same permission twice. Keep it stable across releases: a
 * renamed lock is a different mutex.
 */
export const NODE_CLIENT_SYNC_DATABASE_LOCK = 'server-core:node-client-sync';

/**
 * Hourly re-sync after the pass at start, so a permission provisioned in
 * Authup after boot (node_read) reaches existing node clients without a restart.
 */
export const NODE_CLIENT_SYNC_SCHEDULE = '0 * * * *';
