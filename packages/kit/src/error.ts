/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Issue } from 'validup';
import type { Input } from '@ebec/http';
import { BadRequestError } from '@ebec/http';

export class HubError extends BadRequestError {
    public readonly issues : Issue[];

    constructor(...input: Input[]) {
        super(...input);

        this.issues = [];
    }
}
