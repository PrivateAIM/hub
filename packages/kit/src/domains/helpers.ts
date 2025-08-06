/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function buildDomainChannelName(domain: string, id?: string | number) {
    if (typeof id === 'string' || typeof id === 'number') {
        return `${domain}:${id}`;
    }

    return domain;
}

// todo: rename to buildEntityNamespaceName
export function buildDomainNamespaceName(id?: string) {
    return id ?
        `/resources:${id}` :
        '/resources';
}
