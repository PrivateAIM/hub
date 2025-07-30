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
        <i
            class="fa"
            :class="{
                'fa-check text-danger': entity.expiring,
                'fa-times': !entity.expiring
            }"
        />
        <template v-if="entity.expiring">
            <br>
            <VCTimeago :datetime="entity.expires_at" />
        </template>
    </slot>
</template>
