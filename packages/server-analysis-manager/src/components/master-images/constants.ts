/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { WRITABLE_DIRECTORY_PATH } from '../../config';

export const MASTER_IMAGES_DIRECTORY_PATH = path.join(
    WRITABLE_DIRECTORY_PATH,
    'master-images',
);

export const MASTER_IMAGES_DATA_DIRECTORY_PATH = path.join(
    MASTER_IMAGES_DIRECTORY_PATH,
    'data',
);
