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

/** The integer columns are 32-bit signed `int`: a larger value would fail the insert. */
export const NODE_COMPONENT_INTEGER_MAX = 2147483647;

/** The most components one status snapshot may carry. */
export const NODE_COMPONENTS_REPORT_MAX = 64;
