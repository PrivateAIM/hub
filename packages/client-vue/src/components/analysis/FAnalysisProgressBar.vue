<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis } from '@privateaim/core-kit';
import { AnalysisBuildStatus, AnalysisRunStatus } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { computed, defineComponent, toRef } from 'vue';

export default defineComponent({
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
            if (entity.value.configuration_locked) {
                return 100;
            }

            return 0;
        });

        const buildProgress = computed(() => {
            if (entity.value.build_status === AnalysisBuildStatus.FINISHED) {
                return 100;
            }

            if (entity.value.build_status === AnalysisBuildStatus.STARTED) {
                return 66.33;
            }

            if (entity.value.build_status === AnalysisBuildStatus.STARTING) {
                return 33.33;
            }

            return 0;
        });

        const runProgress = computed(() => {
            if (entity.value.run_status === AnalysisRunStatus.FINISHED) {
                return 100;
            }

            if (entity.value.run_status === AnalysisRunStatus.RUNNING) {
                return 70;
            }

            if (entity.value.run_status === AnalysisRunStatus.STARTED) {
                return 40;
            }

            if (entity.value.run_status === AnalysisRunStatus.STARTING) {
                return 20;
            }

            return 0;
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
            if (entity.value.run_status === AnalysisRunStatus.FINISHED) {
                return 'bg-success';
            }

            return 'bg-dark';
        });

        return {
            bgClazz,
            progress,
        };
    },
});
</script>
<template>
    <div class="progress bg-white">
        <div
            class="progress-bar"
            :class="bgClazz"
            :style="{width: progress + '%'}"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
        />
    </div>
</template>
