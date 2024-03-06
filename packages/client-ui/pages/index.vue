<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { defineNuxtComponent } from '#app';
import { definePageMeta } from '#imports';
import WorldSvg from '../components/svg/World';
import { LayoutKey, LayoutNavigationID } from '../config/layout';

export default defineNuxtComponent({
    components: { WorldSvg },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });
    },
});
</script>
<template>
    <div class="">
        <h1 class="title no-border mb-5 text-center">
            FLAME <span class="sub-title">HUB</span>
        </h1>

        <WorldSvg width="100%" />
    </div>
</template>
