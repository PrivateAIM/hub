/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { Result, ValidationError } from 'express-validator';
import { buildHTTPValidationErrorMessage } from './message';

export class HTTPValidationError extends BadRequestError {
    constructor(validation: Result<ValidationError>) {
        const errors : ValidationError[] = validation.array();

        const parameterNames = [];
        for (let i = 0; i < errors.length; i++) {
            const item = errors[i];

            switch (item.type) {
                case 'field': {
                    parameterNames.push(item.path);
                    break;
                }
                case 'alternative': {
                    parameterNames.push(item.nestedErrors.map(
                        ((el) => el.path),
                    ).join('|'));
                    break;
                }
            }
        }

        let message : string;

        if (parameterNames.length > 0) {
            message = buildHTTPValidationErrorMessage(Array.from(new Set(parameterNames)));
        } else {
            message = 'An unexpected validation error occurred.';
        }

        super({
            message,
            data: {
                errors,
            },
        });
    }
}
