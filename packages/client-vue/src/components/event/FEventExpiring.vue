<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Event } from '@privateaim/telemetry-kit';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Event>,
            required: true,
        },
        direction: {
            type: String as PropType<'column' | 'row'>,
            default: 'column',
        },
    },
});
</script>
<template>
    <slot v-bind="entity">
        <div
            class="flex justify-center gap-1"
            :class="{
                'flex-row': direction === 'row',
                'flex-col': direction === 'column'
            }"
        >
            <div>
                <VCIcon
                    :name="entity.expiring ? 'fa6-solid:check' : 'fa6-solid:xmark'"
                    :class="entity.expiring ? 'text-success-600' : 'text-error-600'"
                />
            </div>
            <template v-if="entity.expiring">
                <div>
                    <small>
                        (<VCTimeago :datetime="entity.expires_at" />)
                    </small>
                </div>
            </template>
        </div>
    </slot>
</template>
