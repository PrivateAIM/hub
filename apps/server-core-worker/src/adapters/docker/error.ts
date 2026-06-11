/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Determine if an error is a docker daemon HTTP response with the given
 * status code, as opposed to a connection/daemon failure (no status code)
 * where the object state is unknown.
 *
 * @param error
 * @param statusCode
 */
export function isDockerErrorWithStatusCode(error: unknown, statusCode: number): boolean {
    return error instanceof Error &&
        'statusCode' in error &&
        error.statusCode === statusCode;
}

/**
 * Determine if an error is a docker daemon "no such object" (404) response.
 *
 * @param error
 */
export function isDockerNotFoundError(error: unknown): boolean {
    return isDockerErrorWithStatusCode(error, 404);
}

/**
 * Determine if an error from the /distribution endpoint denotes a missing
 * registry image. The docker API responds 401 for both "no image found" and
 * failed authentication (404 is included defensively); other responses
 * (5xx, connection failures) leave the image state unknown.
 *
 * @param error
 */
export function isDockerDistributionImageMissingError(error: unknown): boolean {
    return isDockerErrorWithStatusCode(error, 401) ||
        isDockerErrorWithStatusCode(error, 404);
}
