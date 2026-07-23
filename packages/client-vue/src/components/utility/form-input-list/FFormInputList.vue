<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { VCButton } from '@vuecs/button';
import { VCAlert } from '@vuecs/elements';
import { VCIcon } from '@vuecs/icon';
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
        VCAlert,
        VCButton,
        VCIcon,
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
        readonly: {
            type: Boolean,
            default: false,
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

        setup.expose({ assign });

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
                const item = items.value[index];
                if (item) {
                    item.value = value;
                }
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
    <div class="flex flex-col gap-2">
        <div class="flex flex-row">
            <div class="self-end">
                <slot name="headerLabel">
                    Names
                </slot>
            </div>
            <div class="ms-auto">
                <slot
                    name="headerActions"
                    :add="add"
                    :can-add="canAdd && !readonly"
                >
                    <VCButton
                        size="xs"
                        color="primary"
                        :disabled="!canAdd || readonly"
                        @click.prevent="add()"
                    >
                        <VCIcon name="fa6-solid:plus" /> <FTranslationDefault :name="'add'" />
                    </VCButton>
                </slot>
            </div>
        </div>
        <div class="flex flex-col gap-1">
            <template v-if="items.length === 0">
                <slot name="noItems">
                    <VCAlert
                        color="info"
                        variant="soft"
                        size="sm"
                        class="mb-3"
                    >
                        The form list has no items yet
                    </VCAlert>
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
                        :can-drop="canDrop"
                        :readonly="readonly"
                        :name="item.value"
                        @updated="(input) => { handleUpdated(item.id, input) }"
                        @deleted="() => { handleDeleted(item.id) }"
                    />
                </slot>
            </template>
        </div>
    </div>
</template>
