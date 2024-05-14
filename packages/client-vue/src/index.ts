/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Plugin } from 'vue';
import './css';
import { install } from './module';
import type { Options } from './type';

export default {
    install,
} satisfies Plugin<Options | undefined>;

export * from './components';
export * from './core';
export * from './module';
export * from './type';
