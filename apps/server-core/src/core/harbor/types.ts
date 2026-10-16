/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Port for registry setup operations.
 * Implemented by RegistryComponentDispatcher in app layer.
 */
export interface IRegistryDispatcher {
    dispatch(command: string, data: Record<string, any>, meta: Record<string, any>): Promise<void>;
}
