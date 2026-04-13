/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

export type RegistryHookRepository = {
    name: string,
    repo_full_name: string,
    date_created?: string,
    namespace: string,
};

export type RegistryHookResource = {
    digest: string,
    tag: string,
    resource_url: string
};

export type RegistryHookEventData = {
    repository: RegistryHookRepository,
    resources: RegistryHookResource[],
};

export type RegistryHook = {
    type: string,
    occur_at?: string,
    operator: string,
    event_data: RegistryHookEventData
};
