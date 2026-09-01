<!--
  - Copyright (c) 2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Node } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { VCButton } from '@vuecs/button';
import { VCAlert } from '@vuecs/elements';
import { VCIcon } from '@vuecs/icon';
import {
    computed,
    defineComponent,
    ref,
    toRef,
    watch,
} from 'vue';
import type { PropType } from 'vue';
import { createEntityManager, defineEntityManagerEvents, wrapFnWithBusyState } from '../../core';
import FRegistries from '../registry/FRegistries';

export default defineComponent({
    components: {
        FRegistries,
        VCAlert,
        VCButton,
        VCIcon,
    },
    props: {
        entity: {
            type: Object as PropType<Node>,
            required: true,
        },
    },
    emits: defineEntityManagerEvents<Node>(),
    setup(props, setup) {
        const entity = toRef(props, 'entity');
        const busy = ref(false);

        // The node's own entity manager — connecting/disconnecting is a plain
        // `registryId` update. The server reacts to it by provisioning a
        // registry project (+ Harbor robot account) or tearing the existing one
        // down, and answers with the updated node.
        const manager = createEntityManager({
            type: DomainType.NODE,
            setup,
            props: { entity: entity.value },
        });

        // `manager.data` wins over the prop: after an update it holds the fresh
        // server response, while the parent's copy is only patched afterwards.
        const current = computed(() => manager.data.value ?? entity.value);
        const connected = computed(() => !!current.value.registryId);
        const currentRegistryId = computed(() => current.value.registryId);
        const hasProject = computed(() => !!current.value.registryProjectId);

        // Staged selection: picking a registry in the list only marks it, the
        // update is deferred to an explicit Connect click. Provisioning is not
        // free (it creates a Harbor project + robot account), so it should never
        // fire from a stray click in the list.
        const selectedId = ref<string | null>(null);

        watch(entity, (value) => {
            manager.data.value = value;
            selectedId.value = null;
        });

        const select = (id: string) => {
            selectedId.value = selectedId.value === id ? null : id;
        };

        const connect = wrapFnWithBusyState(busy, async () => {
            const id = selectedId.value;
            if (!id) return;

            await manager.update({ registryId: id });

            // `update()` reports failure through the `failed` event rather than
            // throwing, so confirm it landed before dropping the selection —
            // otherwise a failed connect silently loses the user's pick.
            if (manager.data.value?.registryId === id) {
                selectedId.value = null;
            }
        });

        const disconnect = wrapFnWithBusyState(busy, async () => {
            await manager.update({ registryId: null });
        });

        return {
            busy,
            connected,
            currentRegistryId,
            hasProject,
            selectedId,
            select,
            connect,
            disconnect,
        };
    },
});
</script>
<template>
    <div>
        <h6>Registry</h6>

        <p>
            Connecting the node to a registry provisions a dedicated registry project
            with its own robot account, which the node uses to push and pull images.
        </p>

        <VCAlert
            v-if="connected"
            color="success"
            variant="soft"
            size="sm"
            class="mb-3"
        >
            <VCIcon
                name="fa6-solid:plug"
                class="pe-1"
            /> This node is connected to a registry.
            <template v-if="!hasProject">
                Its registry project has not been provisioned yet.
            </template>
        </VCAlert>
        <VCAlert
            v-else
            color="warning"
            variant="soft"
            size="sm"
            class="mb-3"
        >
            This node is not connected to a registry. Select one below to connect it.
        </VCAlert>

        <VCAlert
            v-if="connected"
            color="warning"
            variant="soft"
            size="sm"
            class="mb-3"
        >
            Switching to another registry provisions a new registry project there and
            removes the current one together with its robot account — the node will
            have to pull fresh credentials. Disconnecting removes it without a
            replacement.
        </VCAlert>

        <!--
            The list stays visible while connected: a node is assigned a registry on
            creation, so re-assigning is the normal interaction, not the exception.
            The server handles it in a single update (it tears the stale project down
            and provisions a fresh one on the new registry) — going through
            Disconnect first would destroy the project for no reason.
        -->
        <FRegistries>
            <template #itemActions="itemProps">
                <!--
                    Icon-only, so each carries its own accessible name — the icon
                    conveys the state visually and nothing else would announce it.
                -->
                <VCButton
                    v-if="itemProps.data.id === currentRegistryId"
                    disabled
                    size="xs"
                    color="success"
                    :aria-label="`${itemProps.data.name} is the registry this node is connected to`"
                    :title="`${itemProps.data.name} is the registry this node is connected to`"
                >
                    <VCIcon name="fa6-solid:plug" />
                </VCButton>
                <VCButton
                    v-else
                    :disabled="itemProps.busy || busy"
                    size="xs"
                    :color="selectedId === itemProps.data.id ? 'warning' : 'neutral'"
                    :aria-label="selectedId === itemProps.data.id ?
                        `Deselect ${itemProps.data.name}` :
                        `Select ${itemProps.data.name}`"
                    :title="selectedId === itemProps.data.id ?
                        `Deselect ${itemProps.data.name}` :
                        `Select ${itemProps.data.name}`"
                    @click.prevent="select(itemProps.data.id)"
                >
                    <VCIcon :name="selectedId === itemProps.data.id ? 'fa6-solid:minus' : 'fa6-solid:plus'" />
                </VCButton>
            </template>
        </FRegistries>

        <div class="mt-3 flex gap-2">
            <VCButton
                color="primary"
                size="xs"
                :disabled="busy || !selectedId"
                @click.prevent="connect"
            >
                <VCIcon
                    name="fa6-solid:plug"
                    class="pe-1"
                /> {{ connected ? 'Switch' : 'Connect' }}
            </VCButton>

            <VCButton
                v-if="connected"
                color="error"
                size="xs"
                :disabled="busy"
                @click.prevent="disconnect"
            >
                <VCIcon
                    name="fa6-solid:power-off"
                    class="pe-1"
                /> Disconnect
            </VCButton>
        </div>
    </div>
</template>
