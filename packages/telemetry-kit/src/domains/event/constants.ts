/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Closed `scope` vocabulary — the subsystem that produced the event, never free
 * text. `entity` is the CRUD bridge (EntityEventHandler); `builder` and
 * `synchronizer` are the master-image worker aggregators. Adding a producer
 * means adding a member here. Enforced at runtime by `EventValidator`, on BOTH
 * the HTTP (`POST /events`) and AMQP (`EventComponentCreateHandler`) paths.
 */
export enum EventScope {
    ENTITY = 'entity',
    BUILDER = 'builder',
    SYNCHRONIZER = 'synchronizer',
}
