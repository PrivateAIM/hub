/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Ilingo } from 'ilingo';

declare module '#app' {
    interface NuxtApp {
        $ilingo: Ilingo;
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $ilingo: Ilingo;
    }
}

export default defineNuxtPlugin((ctx) => {
    const ilingo = new Ilingo();

    // registryRobotSecret: 'Die Eingabe muss größer als 8 Zeichen, min. 1 Großbuchstaben, 1 Kleinbuchstaben und 1 Zahl enthalten.',
    // registryRobotSecret: 'The input value must be larger than 8 letters, contain at least 1 uppercase letter, 1 lowercase letter and 1 number.',

    ctx.provide('ilingo', ilingo);
});
