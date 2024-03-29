/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export class EntityManagerError extends Error {
    static unresolvable() {
        return new this('Entity could not be resolved.');
    }
}
