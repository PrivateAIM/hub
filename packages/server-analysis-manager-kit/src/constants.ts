/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum ComponentName {
    BUILDER = 'builder',
    CORE = 'core',
}

export enum ErrorCode {
    NOT_FOUND = 'notFound',
    REGISTRY_NOT_FOUND = 'registryNotFound',
    REGISTRY_PROJECT_NOT_FOUND = 'registryProjectNotFound',
    NONE = 'none',
}

export const ROUTER_QUEUE_ROUTING_KEY = 'tm.router';
