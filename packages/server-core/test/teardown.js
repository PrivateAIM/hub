/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

module.exports = async () => {
    // eslint-disable-next-line no-undef
    if (globalThis.LOKI_CONTAINER) {
        // eslint-disable-next-line no-undef
        await globalThis.LOKI_CONTAINER.stop();
    }
};
