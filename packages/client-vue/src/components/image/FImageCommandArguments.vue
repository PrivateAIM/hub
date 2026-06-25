<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { MasterImageCommandArgument } from '@privateaim/core-kit';
import { VCButton } from '@vuecs/button';
import { VCAlert } from '@vuecs/elements';
import { VCIcon } from '@vuecs/icon';
import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
    nextTick,
    ref,
    toRef,
    useTemplateRef,
    watch,
} from 'vue';
import FFormInputList from '../utility/form-input-list/FFormInputList.vue';

const extractItemsByPosition = (
    value: MasterImageCommandArgument[],
    position: 'before' | 'after',
) : MasterImageCommandArgument[] => {
    if (position === 'before') {
        return value
            .filter((item) => item.position === 'before' || !item.position);
    }

    return value
        .filter((item) => item.position === 'after');
};

export default defineComponent({
    components: {
        FFormInputList,
        VCAlert,
        VCButton,
        VCIcon,
    },
    props: {
        items: { type: Object as PropType<MasterImageCommandArgument[]> },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['submit'],
    setup(props, { emit }) {
        const itemsPropRef = toRef(props, 'items');
        const items = ref<MasterImageCommandArgument[]>([]);

        const itemsBeforeVNode = useTemplateRef<typeof FFormInputList | null>('itemsBefore');
        const itemsBefore = computed(
            () => extractItemsByPosition(items.value, 'before')
                .map((item) => item.value),
        );

        const itemsAfterVNode = useTemplateRef<typeof FFormInputList | null>('itemsAfter');
        const itemsAfter = computed(
            () => extractItemsByPosition(items.value, 'after')
                .map((item) => item.value),
        );

        const updateVNodes = () => {
            nextTick(() => {
                if (itemsBeforeVNode.value) {
                    itemsBeforeVNode.value.assign(itemsBefore.value);
                }

                if (itemsAfterVNode.value) {
                    itemsAfterVNode.value.assign(itemsAfter.value);
                }
            });
        };
        const resetItems = (data: MasterImageCommandArgument[] = []) => {
            items.value = data;
        };

        resetItems(itemsPropRef.value);

        watch(itemsPropRef, (value, oldValue) => {
            if (value && value !== oldValue) {
                resetItems(value);
                updateVNodes();
            }
        });

        const submit = (data: MasterImageCommandArgument[]) => {
            emit('submit', data);
        };

        const handleItemsBeforeChanged = async (
            names: string[],
        ) => submit([
            ...names.map((value) => ({
                position: 'before',
                value,
            } satisfies MasterImageCommandArgument)),
            ...itemsAfter.value.map((value) => ({
                position: 'after',
                value,
            } satisfies MasterImageCommandArgument)),
        ]);
        const handleItemsAfterChanged = async (
            names: string[],
        ) => submit([
            ...itemsBefore.value.map((value) => ({
                position: 'before',
                value,
            } satisfies MasterImageCommandArgument)),
            ...names.map((value) => ({
                position: 'after',
                value,
            } satisfies MasterImageCommandArgument)),
        ]);

        const resetItemsForPosition = async (position: 'before' | 'after') => {
            let next : MasterImageCommandArgument[];
            if (position === 'before') {
                next = [
                    ...extractItemsByPosition(itemsPropRef.value || [], 'before'),
                    ...itemsAfter.value.map((value) => ({ position: 'after', value } satisfies MasterImageCommandArgument)),
                ];
            } else {
                next = [
                    ...itemsBefore.value.map((value) => ({ position: 'before', value } satisfies MasterImageCommandArgument)),
                    ...extractItemsByPosition(itemsPropRef.value || [], 'after'),
                ];
            }

            return submit(next);
        };

        return {
            itemsBefore,
            itemsAfter,

            handleItemsBeforeChanged,
            handleItemsAfterChanged,
            resetItemsForPosition,
        };
    },
});
</script>
<template>
    <div class="flex flex-wrap -mx-2">
        <div class="flex-1 basis-0 px-2">
            <FFormInputList
                ref="itemsBefore"
                :readonly="readonly"
                :names="itemsBefore"
                :min-items="0"
                @changed="handleItemsBeforeChanged"
            >
                <template #headerLabel>
                    Before
                </template>
                <template #headerActions="props">
                    <VCButton
                        :disabled="readonly"
                        size="xs"
                        color="error"
                        class="me-1"
                        @click.prevent="resetItemsForPosition('before')"
                    >
                        <VCIcon name="fa6-solid:rotate-left" />
                    </VCButton>
                    <VCButton
                        size="xs"
                        color="primary"
                        :disabled="readonly"
                        @click.prevent="props.add()"
                    >
                        <VCIcon name="fa6-solid:plus" />
                    </VCButton>
                </template>
                <template #noItems>
                    <VCAlert
                        color="info"
                        variant="soft"
                        size="sm"
                        class="mb-3"
                    >
                        No command arguments are selected to be placed between command and entrypoint.
                    </VCAlert>
                </template>
            </FFormInputList>
        </div>
        <div class="flex-1 basis-0 px-2">
            <FFormInputList
                ref="itemsAfter"
                :readonly="readonly"
                :names="itemsAfter"
                :min-items="0"
                @changed="handleItemsAfterChanged"
            >
                <template #headerLabel>
                    After
                </template>
                <template #headerActions="props">
                    <VCButton
                        :disabled="readonly"
                        size="xs"
                        color="error"
                        class="me-1"
                        @click.prevent="resetItemsForPosition('after')"
                    >
                        <VCIcon name="fa6-solid:rotate-left" />
                    </VCButton>
                    <VCButton
                        size="xs"
                        color="primary"
                        :disabled="readonly"
                        @click.prevent="props.add()"
                    >
                        <VCIcon name="fa6-solid:plus" />
                    </VCButton>
                </template>
                <template #noItems>
                    <VCAlert
                        color="info"
                        variant="soft"
                        size="sm"
                        class="mb-3"
                    >
                        No command arguments are selected to be placed after the entrypoint.
                    </VCAlert>
                </template>
            </FFormInputList>
        </div>
    </div>
</template>
