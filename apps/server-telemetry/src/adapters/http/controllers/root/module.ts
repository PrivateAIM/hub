/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import process from 'node:process';
import {
    DController,
    DGet,
    DRequest,
    DResponse,
} from '@routup/decorators';
import { load } from 'locter';
import { send } from 'routup';
import type { Request, Response } from 'routup';

type StatusInfo = {
    version: string;
    timestamp: number;
};

let info: StatusInfo | undefined;

@DController('')
export class RootController {
    @DGet('/', [])
    async status(
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        if (!info) {
            const pkgJson = await load(path.join(process.cwd(), 'package.json'));
            info = { version: pkgJson.version, timestamp: Date.now() };
        }

        info.timestamp = Date.now();

        return send(res, info);
    }
}
