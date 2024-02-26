/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

const { GenericContainer } = require('testcontainers');
const { write } = require('envix');

module.exports = async () => {
    const containerConfig = new GenericContainer('lazybit/minio')
        .withExposedPorts(9000)
        .withEnvironment({
            MINIO_ACCESS_KEY: 'admin',
            MINIO_SECRET_KEY: 'start123',
        });

    const container = await containerConfig.start();
    const connectionString = `http://admin:start123@${container.getHost()}:${container.getFirstMappedPort()}`;

    write('MINIO_CONNECTION_STRING', connectionString);

    // eslint-disable-next-line no-undef
    globalThis.MINIO_CONTAINER = container;
};
