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
    defineComponent, nextTick, ref, toRef, watch,
} from 'vue';
import type { Analysis, MasterImage, MasterImageCommandArgument } from '@privateaim/core-kit';
import FFormInputList from '../utility/form-input-list/FFormInputList.vue';
import { injectCoreHTTPClient, wrapFnWithBusyState } from '../../core';
import { useUpdatedAt } from '../../composables';

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
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['failed', 'updated'],
    setup(props, { emit }) {
        const httpClient = injectCoreHTTPClient();

        const items = ref<MasterImageCommandArgument[]>([]);

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

        const entity = toRef(props, 'entity');
        const entityUpdatedAt = useUpdatedAt(entity);

        const masterImageEntity = toRef(props, 'masterImageEntity');
        const masterImageEntityId = computed(() => {
            if (masterImageEntity.value) {
                return masterImageEntity.value.id;
            }

            return undefined;
        });

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

        const setItems = (value: MasterImageCommandArgument[]) => {
            items.value = value;

            updateVNodes();
        };

        const loadItemsByProps = () => {
            if (props.entity.image_command_arguments) {
                setItems([...props.entity.image_command_arguments]);
            } else if (props.masterImageEntity && props.masterImageEntity.command_arguments) {
                setItems([...props.masterImageEntity.command_arguments]);
            } else {
                setItems([]);
            }
        };

        loadItemsByProps();

        watch(entityUpdatedAt, () => loadItemsByProps());
        watch(masterImageEntityId, () => loadItemsByProps());

        const extractItemsByPosition = (
            items: MasterImageCommandArgument[],
            position: 'before' | 'after',
        ) => {
            if (position === 'before') {
                return items
                    .filter((item) => item.position === 'before' || !item.position);
            }

            return items
                .filter((item) => item.position === 'after');
        };

        const isBusy = ref(false);
        const submit = wrapFnWithBusyState(isBusy, async (value: MasterImageCommandArgument[]) => {
            const prev = [...items.value];
            setItems(value);

            try {
                const response = await httpClient.analysis.update(props.entity.id, {
                    image_command_arguments: value,
                });

                emit('updated', response);
            } catch (e) {
                setItems(prev);
                emit('failed', e);
            }
        });

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
            if (
                !props.entity.image_command_arguments ||
                !props.masterImageEntity ||
                !props.masterImageEntity.command_arguments
            ) {
                // nothing to do.
                return Promise.resolve();
            }

            let next : MasterImageCommandArgument[];
            if (position === 'before') {
                next = [
                    ...extractItemsByPosition(props.masterImageEntity.command_arguments, 'before'),
                    ...itemsAfter.value.map((value) => ({ position: 'after', value } satisfies MasterImageCommandArgument)),
                ];
            } else {
                next = [
                    ...itemsBefore.value.map((value) => ({ position: 'before', value } satisfies MasterImageCommandArgument)),
                    ...extractItemsByPosition(props.masterImageEntity.command_arguments, 'after'),
                ];
            }

            return submit(next);
        };

        return {
            isBusy,

            handleItemsBeforeChanged,
            handleItemsAfterChanged,

            items,

            itemsBefore,
            itemsBeforeVNode,

            itemsAfter,
            itemsAfterVNode,

            resetItemsForPosition,
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
                :min-items="0"
                @changed="handleItemsBeforeChanged"
            >
                <template #headerLabel>
                    Before
                </template>
                <template #headerActions="props">
                    <button
                        :disabled="isBusy|| readonly"
                        class="btn btn-xs btn-danger me-1"
                        @click.prevent="resetItemsForPosition('before')"
                    >
                        <i class="fa fa-undo" />
                    </button>
                    <button
                        class="btn btn-xs btn-primary"
                        type="button"
                        :disabled="isBusy|| readonly"
                        @click.prevent="props.add()"
                    >
                        <i class="fa fa-plus" />
                    </button>
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
                @changed="handleItemsAfterChanged"
            >
                <template #headerLabel>
                    After
                </template>
                <template #headerActions="props">
                    <button
                        :disabled="isBusy|| readonly"
                        class="btn btn-xs btn-danger me-1"
                        @click.prevent="resetItemsForPosition('after')"
                    >
                        <i class="fa fa-undo" />
                    </button>
                    <button
                        class="btn btn-xs btn-primary"
                        type="button"
                        :disabled="isBusy || readonly"
                        @click.prevent="props.add()"
                    >
                        <i class="fa fa-plus" />
                    </button>
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
