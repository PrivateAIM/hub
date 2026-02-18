<!--
  - Copyright (c) 2026.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { MasterImage } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import FProcessStatus from '../FProcessStatus.vue';

export default defineComponent({
    components: { FProcessStatus },
    props: {
        entity: {
            type: Object as PropType<MasterImage>,
            required: true,
        },
    },
    setup(props) {
        const progress = computed(() => {
            if (props.entity.build_status === ProcessStatus.EXECUTED) {
                return 100;
            }

            return props.entity.build_progress || 0;
        });

        return {
            progress,
        };
    },
});
</script>
<template>
    <div class="card-grey card flex-grow-1">
        <div class="card-header">
            <div class="title d-flex flex-row">
                <div>
                    {{ entity.virtual_path }}
                </div>
                <div class="ms-auto">
                    <FProcessStatus :value="entity.build_status">
                        <template #default=" {value, iconClass, classSuffix }">
                            <span class="me-1">{{ value }}</span> <i :class="iconClass + ' text-'+ classSuffix" />
                        </template>
                    </FProcessStatus>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="progress bg-white">
                <div
                    class="progress-bar"
                    :class="'bg-success'"
                    :style="{width: progress + '%'}"
                    :aria-valuenow="progress"
                    aria-valuemin="0"
                    aria-valuemax="100"
                >
                    {{ progress }}%
                </div>
            </div>
        </div>
    </div>
</template>
