<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { BModal } from 'bootstrap-vue-next';
import type { Analysis } from '@privateaim/core-kit';
import { FAnalysisCommand } from '../FAnalysisCommand';

export default defineComponent({
    components: {
        BModal,
        FAnalysisCommand,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated'],
    setup(props, { emit }) {
        const handleUpdated = (e: Analysis) => {
            emit('updated', e);
        };

        return {
            handleUpdated,
        };
    },
});
</script>

<template>
    <BModal
        :size="'md'"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true"
    >
        <template #default>
            <div class="alert alert-warning">
                <i class="fa fa-info" /> The analysis is now in a state in which it can be locked and build.<br>
                In order to build the analysis, the configuration must be locked!
                Be aware that you will then no longer be able to modify the configuration afterward.
            </div>
        </template>
        <template #footer="props">
            <div
                class="d-flex flex-row"
                style="width: 100%;"
            >
                <div>
                    <FAnalysisCommand
                        :entity="entity"
                        :with-icon="true"
                        :element-type="'button'"
                        class="btn btn-dark btn-xs"
                        :command="'configurationLock'"
                        @updated="handleUpdated"
                        @executed="props.ok()"
                        @failed="props.cancel()"
                    />
                </div>
                <div class="ms-auto">
                    <button
                        type="button"
                        class="btn btn-secondary btn-xs"
                        @click.prevent="props.cancel()"
                    >
                        <i class="fa fa-abort" /> Cancel
                    </button>
                </div>
            </div>
        </template>
    </BModal>
</template>
