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
                <i
                    class="fa"
                    :class="{
                        'fa-check text-success-600': entity.expiring,
                        'fa-times text-error-600': !entity.expiring
                    }"
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
