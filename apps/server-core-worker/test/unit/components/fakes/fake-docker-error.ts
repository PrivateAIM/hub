/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

/**
 * A docker error the way dockerode surfaces it: an `Error` carrying a
 * `statusCode`, which is exactly what `isDockerDistributionImageMissingError`
 * inspects (401/404 = image missing; anything else = state unknown).
 */
export class FakeDockerError extends Error {
    public readonly statusCode : number;

    constructor(statusCode: number, message = 'docker error') {
        super(message);
        this.statusCode = statusCode;
    }
}
