/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { write } = require('envix');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { GenericContainer, Wait } = require('testcontainers');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useEnv, EnvironmentInputKey } = require('../src');

module.exports = async () => {
    const env = useEnv();
    if (!env.lokiURL) {
        const containerConfig = new GenericContainer('grafana/loki:latest')
            .withExposedPorts(3100)
            .withWaitStrategy(Wait.forHttp('/ready', 3100));

        const container = await containerConfig.start();

        const connectionString = `http://${container.getHost()}:${container.getFirstMappedPort()}`;
        write(EnvironmentInputKey.LOKI_URL, connectionString);

        // eslint-disable-next-line no-undef
        globalThis.LOKI_CONTAINER = container;
    }
};
