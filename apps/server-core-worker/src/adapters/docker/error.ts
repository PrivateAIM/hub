/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Determine if an error is a docker daemon "no such object" (404) response,
 * as opposed to a connection/daemon failure where the object state is unknown.
 *
 * @param error
 */
export function isDockerNotFoundError(error: unknown): boolean {
    return error instanceof Error &&
        'statusCode' in error &&
        error.statusCode === 404;
}
