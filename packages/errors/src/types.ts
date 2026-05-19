/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ErrorOptions } from '@ebec/core';

export type HubErrorOptions = ErrorOptions & {
    data?: Record<string, any>,
};

export type HubErrorInput = string | HubErrorOptions;

export type HubEntityErrorOptions = HubErrorOptions & {
    entity?: string,
};

export type HubEntityErrorInput = string | HubEntityErrorOptions;
