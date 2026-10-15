/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Any party a connection room can be named for: a socket identity or a
 * message recipient taken from the wire. `type` is deliberately an open
 * string, since a recipient may name a kind no socket identity has.
 */
export type ConnectionRoomParty = {
    type: string,
    id: string,
};
