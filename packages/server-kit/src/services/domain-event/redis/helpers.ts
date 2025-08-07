/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

function stringify(input: string | string[]) {
    return typeof input === 'string' ? input : input.join('/');
}

export function buildDomainEventRedisChannel(
    channel: string | string[],
    namespace?: string | string[],
) {
    const channelNormalized = stringify(channel);

    let namespaceNormalized : string | undefined;
    if (namespace) {
        namespaceNormalized = stringify(namespace);
    }

    if (typeof namespaceNormalized === 'undefined') {
        return channelNormalized;
    }

    return `${namespaceNormalized}/${channelNormalized}`;
}
