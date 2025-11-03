<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { MasterImageCommandArgument } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

const filterImageCommandArgumentsForPosition = (
    input: MasterImageCommandArgument[],
    position: 'before' | 'after' = 'before',
) => {
    if (position === 'before') {
        return input.filter((item) => !item.position || item.position === 'before');
    }

    return input.filter((item) => item.position === 'after');
};

export default defineComponent({
    props: {
        tag: {
            type: String,
            default: 'div',
        },
        command: {
            type: String as PropType<string | null>,
        },
        commandArguments: {
            type: Object as PropType<MasterImageCommandArgument[] | null>,
        },
        file: {
            type: String as PropType<string | null>,
        },
    },
    setup(props) {
        const commandArgumentsAfter = computed(() => {
            if (!props.commandArguments) {
                return [];
            }

            return filterImageCommandArgumentsForPosition(props.commandArguments, 'after')
                .map((item) => item.value);
        });

        const commandArgumentsBefore = computed(() => {
            if (!props.commandArguments) {
                return [];
            }

            return filterImageCommandArgumentsForPosition(props.commandArguments, 'before')
                .map((item) => item.value);
        });

        return {
            commandArgumentsAfter,
            commandArgumentsBefore,
        };
    },
});
</script>
<template>
    <component
        :is="tag"
        class="command-box d-flex flex-row gap-1 flex-wrap"
    >
        <div class="shell-sign">
            $
        </div>

        <div>
            <template v-if="command">
                /usr/bin/{{ command }}
            </template>
            <template v-else>
                [Command]
            </template>
        </div>

        <template
            v-for="(item, key) in commandArgumentsBefore"
            :key="key"
        >
            <div>{{ item }}</div>
        </template>

        <div>
            <template v-if="file">
                {{ file }}
            </template>
            <template v-else>
                [File]
            </template>
        </div>

        <template
            v-for="(item, key) in commandArgumentsAfter"
            :key="key"
        >
            <div>{{ item }}</div>
        </template>
    </component>
</template>
