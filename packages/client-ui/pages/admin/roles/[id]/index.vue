<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">

import { ARoleForm } from '@authup/client-web-kit';
import type { Role } from '@authup/core-kit';
import type { PropType } from 'vue';
import { defineNuxtComponent, definePageMeta } from '#imports';
import { LayoutKey } from '../../../../config/layout';

export default defineNuxtComponent({
    components: {
        ARoleForm,
    },
    props: {
        entity: {
            type: Object as PropType<Role>,
            required: true,
        },
    },
    emits: ['updated', 'failed'],
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
        });

        const handleUpdated = (e: Role) => {
            emit('updated', e);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            handleUpdated,
            handleFailed,
        };
    },
});
</script>
<template>
    <div>
        <h6 class="title">
            General
        </h6>
        <ARoleForm
            :entity="entity"
            @update="handleUpdated"
            @failed="handleFailed"
        />
    </div>
</template>
