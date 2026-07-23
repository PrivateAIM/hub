/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type ProxyConnectionConfig = {
    protocol: 'http' | 'https',
    host: string,
    port: number,
    auth: {
        username: string,
        password: string,
    }
};

export function parseProxyConnectionString(connectionStr: string) : ProxyConnectionConfig | undefined {
    const match = connectionStr
        .match(/(?:(https|http):\/\/)(?:(\w+)(?::(\w+))?@)?(?:([^:]+))(?::(\d{1,5}))?$/);

    if (!match) {
        return undefined;
    }

    const [, protocol, username, password, host, port] = match;
    if (!protocol || !host || !port || !username || !password) {
        return undefined;
    }

    return {
        protocol: protocol as 'http' | 'https',
        host,
        port: Number.parseInt(port, 10),
        auth: {
            username,
            password,
        },
    };
}

export function detectProxyConnectionConfig() : ProxyConnectionConfig | undefined {
    const envKeys = [
        'https_proxy',
        'HTTPS_PROXY',
        'http_proxy',
        'HTTP_PROXY',
    ];

    let result : string | undefined;

    for (const envKey of envKeys) {
        const envVal = process.env[envKey];

        if (
            envVal !== undefined &&
            envVal !== null
        ) {
            result = result || envVal;
        }
    }

    if (!result) {
        return undefined;
    }

    return parseProxyConnectionString(result);
}
