/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { CODE_PATH } from '../paths.ts';

let writableDirPath : string | undefined;
let rootDirPath : string | undefined;

export function getWritableDirPath() {
    if (typeof writableDirPath !== 'undefined') {
        return writableDirPath;
    }

    writableDirPath = path.join(CODE_PATH, '..', 'writable');
    return writableDirPath;
}

export function getRootDirPath() {
    if (typeof rootDirPath !== 'undefined') {
        return rootDirPath;
    }

    rootDirPath = path.join(CODE_PATH, '..');
    return rootDirPath;
}
