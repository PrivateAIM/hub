/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export class CustomError extends Error {
    code: string;

    constructor(message: string, options: ErrorOptions = {}) {
        super(message, options);

        this.code = 'foo';
    }
}
