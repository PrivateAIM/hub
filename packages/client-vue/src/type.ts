/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type Options = {
    coreURL: string,
    storageURL: string,
    telemetryURL: string,

    components?: boolean | string[],

    translatorLocale?: string,

    isServer?: boolean
};
