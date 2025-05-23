<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
    ref,
} from 'vue';
import FFormInputListItem from './FFormInputListItem.vue';
import { FTranslationDefault } from '../translation';

export default defineComponent({
    components: {
        FTranslationDefault,
        FFormInputListItem,
    },
    props: {
        names: {
            type: Array as PropType<string[]>,
            default: () => [],
        },
        minItems: {
            type: Number,
            default: 0,
        },
        maxItems: {
            type: Number,
            default: 100,
        },
    },
    emits: ['changed'],
    setup(props, setup) {
        let counter = 0;
        const items = ref<{ id: number, value: string }[]>([]);

        const add = (item?: string) => {
            items.value.push({
                id: counter++,
                value: item || '',
            });
        };

        function assign() {
            items.value = [];

            props.names.map((el) => add(el));

            if (items.value.length < props.minItems) {
                for (let i = 0; i < props.minItems - items.value.length; i++) {
                    add();
                }
            }
        }

        setup.expose({
            assign,
        });

        assign();

        const canAdd = computed(() => items.value.length < props.maxItems);

        const canDrop = computed(() => items.value.length > props.minItems);

        const emitUpdated = () => {
            setup.emit('changed', [
                ...items.value
                    .map((el) => el.value)
                    .filter(Boolean),
            ]);
        };

        const handleUpdated = (id: number, value: string) => {
            const index = items.value.findIndex((el) => el.id === id);
            if (index > -1) {
                items.value[index].value = value;
            }

            emitUpdated();
        };

        const handleDeleted = (id: number) => {
            if (items.value.length <= props.minItems) {
                return;
            }

            const index = items.value.findIndex((el) => el.id === id);
            if (index > -1) {
                items.value.splice(index, 1);
            }

            emitUpdated();
        };

        return {
            add,

            canAdd,
            canDrop,

            handleDeleted,
            handleUpdated,

            items,
        };
    },
});
</script>
<template>
    <div class="d-flex flex-column gap-2">
        <div class="d-flex flex-row">
            <div class="align-self-end">
                <slot name="headerLabel">
                    Names
                </slot>
            </div>
            <div class="ms-auto">
                <slot
                    name="headerActions"
                    :add="add"
                    :can-add="canAdd"
                >
                    <button
                        class="btn btn-xs btn-primary"
                        type="button"
                        :disabled="!canAdd"
                        @click.prevent="add()"
                    >
                        <i class="fa fa-plus" /> <FTranslationDefault :name="'add'" />
                    </button>
                </slot>
            </div>
        </div>
        <div class="d-flex flex-column gap-1">
            <template v-if="items.length === 0">
                <slot name="noItems">
                    <div class="alert alert-sm alert-info">
                        The form list has no items yet
                    </div>
                </slot>
            </template>
            <template
                v-for="item in items"
                :key="item.id"
            >
                <slot
                    name="default"
                    :item="item"
                    :updated="handleUpdated"
                    :deleted="handleDeleted"
                >
                    <FFormInputListItem
                        :key="item.id"
                        :disabled="!canDrop"
                        :name="item.value"
                        @updated="(input) => { handleUpdated(item.id, input) }"
                        @deleted="() => { handleDeleted(item.id) }"
                    />
                </slot>
            </template>
        </div>
    </div>
</template>
