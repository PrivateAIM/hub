<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import {
    definePageMeta,

} from '#imports';
import {
    defineNuxtComponent,
} from '#app';
import { LayoutKey, LayoutNavigationID } from '../config/layout';

export default defineNuxtComponent({
    components: {

    },
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });
    },
});
</script>
<template>
    <div>
        Hi
        <NuxtLink :to="'/login'">
            Foo
        </NuxtLink>

    </div>
</template>
