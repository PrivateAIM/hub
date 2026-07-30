<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type { PropType } from 'vue';
import { computed, defineComponent, toRef } from 'vue';
import { FProgressBar } from '../utility';

export default defineComponent({
    components: { FProgressBar },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        withHeader: {
            type: Boolean,
            default: false,
        },
        elementType: {
            type: String,
            default: 'steps',
        },
    },
    setup(props) {
        const entity = toRef(props, 'entity');

        const configurationProgress = computed(() => {
            if (entity.value.configurationLocked) {
                return 100;
            }

            return 0;
        });

        const buildProgress = computed(() => {
            if (entity.value.buildStatus === ProcessStatus.EXECUTED) {
                return 100;
            }

            if (entity.value.buildStatus === ProcessStatus.STARTED) {
                return 10;
            }

            if (entity.value.buildStatus === ProcessStatus.STARTING) {
                return 5;
            }

            if (!entity.value.buildStatus) {
                return 0;
            }

            return Math.max(10, entity.value.buildProgress ?? 0);
        });

        const runProgress = computed(() => {
            if (entity.value.executionStatus === ProcessStatus.EXECUTED) {
                return 100;
            }

            if (entity.value.executionStatus === ProcessStatus.STARTED) {
                return 10;
            }

            if (entity.value.executionStatus === ProcessStatus.STARTING) {
                return 5;
            }

            if (!entity.value.executionStatus) {
                return 0;
            }

            return Math.max(10, entity.value.executionProgress ?? 0);
        });

        const progress = computed(() => {
            const total = configurationProgress.value +
                buildProgress.value +
                runProgress.value;

            if (total === 0) {
                return 0;
            }

            return Math.floor(total / 3);
        });

        const bgClazz = computed(() => {
            if (entity.value.executionStatus === ProcessStatus.EXECUTED) {
                return 'bg-success-600';
            }

            return 'bg-primary-600';
        });

        return {
            bgClazz,
            progress,
        };
    },
});
</script>
<template>
    <FProgressBar
        :progress="progress"
        :color-class="bgClazz"
    />
</template>
