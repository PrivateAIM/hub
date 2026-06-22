/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Identity kind of a messaging party — the authup subject kind.
 *
 * The broker is a general, identity-to-identity durable transport: a message
 * may be addressed to any identity. Analysis messaging uses `client` (the node
 * client), but `user` / `robot` are equally valid recipients.
 */
export enum MessagePartyKind {
    USER = 'user',
    ROBOT = 'robot',
    CLIENT = 'client',
}
