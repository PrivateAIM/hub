/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useDataSource, unsetDataSource, dropDatabase } = require('typeorm-extension');

module.exports = async () => {
    const dataSource = await useDataSource();
    await dataSource.destroy();

    const { options } = dataSource;

    unsetDataSource();

    await dropDatabase({ ifExist: true, options });
};
