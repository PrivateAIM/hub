/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

export function buildDomainEventSocketNamespace(namespace?: string | string[]) {
    if (typeof namespace === 'undefined') {
        return '/';
    }

    if (typeof namespace === 'string') {
        return namespace.startsWith('/') ? namespace : `/${namespace}`;
    }

    return `/${namespace.join('/')}`;
}

export function buildDomainEventSocketChannel(channel: string | string[]) {
    if (typeof channel === 'string') {
        return channel;
    }

    return channel.join('/');
}
