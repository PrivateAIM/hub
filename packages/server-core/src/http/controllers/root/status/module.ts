/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { load } from 'locter';
import process from 'node:process';
import { send } from 'routup';
import type { Request, Response } from 'routup';

export type EndpointInfo = {
    version: string,
    timestamp: number,
};

let info : undefined | EndpointInfo;

export async function useInfo() {
    if (typeof info !== 'undefined') {
        return info;
    }

    const pkgJson = await load(path.join(process.cwd(), 'package.json'));

    info = {
        version: pkgJson.version,
        timestamp: Date.now(),
    };

    return info;
}
export async function useStatusRouteHandler(req: Request, res: Response) : Promise<any> {
    const status = await useInfo();
    status.timestamp = Date.now();

    return send(res, status);
}
