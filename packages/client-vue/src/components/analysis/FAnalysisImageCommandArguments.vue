<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { PropType, Ref } from 'vue';
import {
    computed,
    defineComponent, nextTick, ref, watch,
} from 'vue';
import type { Analysis, MasterImage } from '@privateaim/core-kit';
import type { MasterImageCommandArgument } from '@privateaim/core-kit/src';
import FFormInputList from '../utility/form-input-list/FFormInputList.vue';

export default defineComponent({
    components: { FFormInputList },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        masterImageEntity: {
            type: Object as PropType<MasterImage>,
        },
    },
    emits: ['updated'],
    setup(props) {
        const items = computed<MasterImageCommandArgument[]>(() => {
            if (props.entity.image_command_arguments) {
                return props.entity.image_command_arguments;
            }

            if (props.masterImageEntity && props.masterImageEntity.command_arguments) {
                return props.masterImageEntity.command_arguments;
            }

            return [];
        });

        const itemsBeforeVNode = ref(null) as Ref<typeof FFormInputList | null>;
        const itemsBefore = computed(
            () => items.value
                .filter((item) => item.position === 'before' || !item.position)
                .map((item) => item.value),
        );

        const itemsAfterVNode = ref(null) as Ref<typeof FFormInputList | null>;
        const itemsAfter = computed(
            () => items.value
                .filter((item) => item.position === 'after')
                .map((item) => item.value),
        );

        const masterImageId = computed(() => (props.masterImageEntity ? props.masterImageEntity.id : null));
        watch(masterImageId, (val, oldValue) => {
            if (val === oldValue) {
                return;
            }

            nextTick(() => {
                if (itemsBeforeVNode.value) {
                    itemsBeforeVNode.value.assign(itemsBefore.value);
                }

                if (itemsAfterVNode.value) {
                    itemsAfterVNode.value.assign(itemsAfter.value);
                }
            });
        });

        return {
            items,

            itemsBefore,
            itemsBeforeVNode,

            itemsAfter,
            itemsAfterVNode,
        };
    },
});
</script>
<template>
    <div class="row">
        <div class="col">
            <FFormInputList
                ref="itemsBeforeVNode"
                :names="itemsBefore"
                :min-items="1"
            >
                <template #label>
                    Before
                </template>
                <template #noItems>
                    <div class="alert alert-sm alert-info">
                        No command arguments are selected to be placed between command and entrypoint.
                    </div>
                </template>
            </FFormInputList>
        </div>
        <div class="col">
            <FFormInputList
                ref="itemsAfterVNode"
                :names="itemsAfter"
                :min-items="0"
            >
                <template #label>
                    After
                </template>
                <template #noItems>
                    <div class="alert alert-sm alert-info">
                        No command arguments are selected to be placed after the entrypoint.
                    </div>
                </template>
            </FFormInputList>
        </div>
    </div>
</template>
