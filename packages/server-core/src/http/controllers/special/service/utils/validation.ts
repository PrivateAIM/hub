/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RegistryAPICommand } from '@privateaim/core-kit';
import type { HTTPValidationResult } from '@privateaim/server-http-kit';
import { createHTTPValidationResult } from '@privateaim/server-http-kit';
import { check } from 'express-validator';
import type { Request } from 'routup';

type ValidationResult = {
    id: string,
    command: `${RegistryAPICommand}`,
    secret?: string
};

export async function runServiceRegistryValidation(
    req: Request,
) : Promise<HTTPValidationResult<ValidationResult>> {
    await check('id')
        .exists()
        .notEmpty()
        .isUUID()
        .run(req);

    await check('command')
        .exists()
        .isString()
        .custom((value) => Object.values(RegistryAPICommand).includes(value))
        .run(req);

    await check('secret')
        .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/)
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    return createHTTPValidationResult<ValidationResult>(req);
}
