/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function buildConnectionUserSubscriptionRoom(id: string | number) {
    return `connection-user-subscription:${id}`;
}

export function buildConnectionRobotSubscriptionRoom(id: string | number) {
    return `connection-robot-subscription:${id}`;
}

export function buildConnectionUserRoom(id: string | number) {
    return `user-connection:${id}`;
}

export function buildConnectionRobotRoom(id: string | number) {
    return `robot-connection:${id}`;
}
