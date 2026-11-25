/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum NodeComponentStatus {
    OK = 'ok',
    ERROR = 'error',
    DISABLED = 'disabled',
}

export const NODE_COMPONENT_NAME_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
