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
