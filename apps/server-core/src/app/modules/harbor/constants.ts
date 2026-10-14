/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * The mutex the harbor registry setup holds against every other replica's.
 * The setup is find-then-insert on the `default` registry, so two replicas
 * booting at once would both insert and one would fail its boot on the
 * unique name. Keep the name STABLE across releases, for the reason
 * `MIGRATION_DATABASE_LOCK` gives.
 */
export const HARBOR_SETUP_DATABASE_LOCK = 'server-core:harbor-setup';
