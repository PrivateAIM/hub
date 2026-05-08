/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import process from 'node:process';
import {
    DController,
    DGet,
    DTags,
} from '@routup/decorators';
import { load } from 'locter';

type EndpointInfo = {
    version: string,
    timestamp: number,
};

let info : undefined | EndpointInfo;

@DTags('root')
@DController('')
export class RootController {
    @DGet('/', [])
    async status(): Promise<EndpointInfo> {
        if (typeof info === 'undefined') {
            const pkgJson = await load(path.join(process.cwd(), 'package.json'));
            info = {
                version: pkgJson.version,
                timestamp: Date.now(),
            };
        }

        info.timestamp = Date.now();

        return info;
    }
}
