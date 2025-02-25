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
import type { Analysis, MasterImage } from '@privateaim/core-kit';
import type { MasterImageCommandArgument } from '@privateaim/core-kit/src';
import FFormInputList from '../utility/form-input-list/FFormInputList.vue';
import { injectCoreHTTPClient, wrapFnWithBusyState } from '../../core';
import { useUpdatedAt } from '../../composables';
import { FTranslationDefault } from '../utility';

export default defineComponent({
    components: { FTranslationDefault, FFormInputList },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        masterImageEntity: {
            type: Object as PropType<MasterImage>,
        },
    },
    emits: ['failed', 'updated'],
    setup(props, { emit }) {
        const httpClient = injectCoreHTTPClient();

        const items = ref<MasterImageCommandArgument[]>([]);

        const entity = toRef(props, 'entity');
        const entityUpdatedAt = useUpdatedAt(entity);

        const masterImageEntity = toRef(props, 'masterImageEntity');
        const masterImageEntityId = computed(() => {
            if (masterImageEntity.value) {
                return masterImageEntity.value.id;
            }

            return undefined;
        });

        const setItems = () => {
            if (props.entity.image_command_arguments) {
                items.value = [...props.entity.image_command_arguments];
            } else if (props.masterImageEntity && props.masterImageEntity.command_arguments) {
                items.value = [...props.masterImageEntity.command_arguments];
            } else {
                items.value = [];
            }
        };

        setItems();

        watch(entityUpdatedAt, () => setItems());
        watch(masterImageEntityId, () => setItems());

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

        const isBusy = ref(false);
        const handleItemsBeforeChanged = wrapFnWithBusyState(isBusy, async (
            names: string[],
        ) => {
            const next : MasterImageCommandArgument[] = [
                ...names,
                ...itemsAfter.value,
            ].map((value) => ({
                position: 'before',
                value,
            } satisfies MasterImageCommandArgument));

            const prev = [...items.value];

            items.value = next;

            try {
                const response = await httpClient.analysis.update(props.entity.id, {
                    image_command_arguments: next,
                });

                // todo: remove after upgrade
                response.image_command_arguments = next;

                emit('updated', response);
            } catch (e) {
                items.value = prev;
                emit('failed', e);
            }
        });
        const handleItemsAfterChanged = wrapFnWithBusyState(isBusy, async (
            names: string[],
        ) => {
            const next : MasterImageCommandArgument[] = [
                ...itemsBefore.value,
                ...names,
            ].map((value) => ({
                position: 'after',
                value,
            } satisfies MasterImageCommandArgument));

            const prev = [...items.value];

            items.value = next;

            try {
                const response = await httpClient.analysis.update(props.entity.id, {
                    image_command_arguments: next,
                });

                // todo: remove after upgrade
                response.image_command_arguments = next;

                emit('updated', response);
            } catch (e) {
                items.value = prev;
                emit('failed', e);
            }
        });

        return {
            handleItemsBeforeChanged,
            handleItemsAfterChanged,

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
                :min-items="0"
                @changed="handleItemsBeforeChanged"
            >
                <template #headerLabel>
                    Before
                </template>
                <template #headerActions="props">
                    <button
                        class="btn btn-xs btn-primary"
                        type="button"
                        :disabled="!props.canAdd"
                        @click.prevent="props.add()"
                    >
                        <i class="fa fa-plus" /> <FTranslationDefault :name="'add'" />
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
                <template #noItems>
                    <div class="alert alert-sm alert-info">
                        No command arguments are selected to be placed after the entrypoint.
                    </div>
                </template>
            </FFormInputList>
        </div>
    </div>
</template>
