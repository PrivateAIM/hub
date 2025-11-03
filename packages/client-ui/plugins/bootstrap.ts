/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BDropdown, BDropdownItem, Directives, createBootstrap,
} from 'bootstrap-vue-next';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((ctx) => {
    ctx.vueApp.use(createBootstrap());

    const keys = Object.keys(Directives);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];

        if (name) {
            ctx.vueApp.directive(name.replace(/^v/, ''), Directives[name as keyof typeof Directives]);
        }
    }

    ctx.vueApp.component('BDropdown', BDropdown);
    ctx.vueApp.component('BDropdownItem', BDropdownItem);
});
