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
import FMasterImageCommand from './FMasterImageCommand.ts';
import { FProgressBar } from '../utility';
import { resolveTextColorClass } from '../../core';

export default defineComponent({
    components: {
        FMasterImageCommand, 
        FProcessStatus, 
        FProgressBar, 
    },
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

        return { progress, resolveTextColorClass };
    },
});
</script>
<template>
    <div class="card-grey card grow">
        <div class="card-header">
            <div class="title flex flex-row">
                <div>
                    {{ entity.virtual_path }}
                </div>
                <div class="ms-auto">
                    <FProcessStatus :value="entity.build_status">
                        <template #default=" {value, iconName, iconClass, classSuffix }">
                            <span class="me-1">{{ value }}</span> <VCIcon
                                :name="iconName"
                                :class="[iconClass, resolveTextColorClass(classSuffix)]"
                            />
                        </template>
                    </FProcessStatus>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="flex flex-col gap-1">
                <FProgressBar
                    :progress="progress"
                    show-text
                />

                <div>
                    <FMasterImageCommand
                        :command="'build'"
                        :entity="entity"
                        :with-icon="true"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
