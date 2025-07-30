<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Event } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Event>,
            required: true,
        },
    },
});
</script>
<template>
    <slot v-bind="entity">
        <template v-if="entity.actor_type">
            <strong>{{ entity.actor_type }}</strong>
            <br>
            {{ entity.actor_id }}
        </template>
        <template v-else>
            <slot name="fallback">
                -
            </slot>
        </template>
    </slot>
</template>
