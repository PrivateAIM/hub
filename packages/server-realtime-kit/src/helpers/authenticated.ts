/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Socket } from '../types';

export function isSocketAuthenticated(socket: Socket) : boolean {
    return !!socket.data.userId ||
        !!socket.data.clientId ||
        !!socket.data.robotId;
}
