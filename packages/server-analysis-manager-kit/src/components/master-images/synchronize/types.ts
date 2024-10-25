/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Group, Image } from 'docker-scan';

export type MasterImagesSynchronizeCommandPayload = {
    owner: string,
    repository: string,
    branch: string
};

export type MaterImagesSynchronizedEventPayload = {
    images: Image[],
    groups: Group[]
};
