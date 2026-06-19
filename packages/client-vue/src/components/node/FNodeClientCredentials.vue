<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Node } from '@privateaim/core-kit';
import { useClipboard } from '@vueuse/core';
import {
    type PropType,
    defineComponent,
    onMounted,
    ref,
} from 'vue';
import { injectCoreHTTPClient } from '../../core';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Node>,
            required: true,
        },
    },
    emits: ['failed'],
    setup(props, { emit }) {
        const httpClient = injectCoreHTTPClient();
        const clipboard = useClipboard();

        const clientId = ref<string | null>(null);
        const secret = ref<string | null>(null);
        const revealed = ref(false);
        const busy = ref(false);

        const load = async () => {
            if (!props.entity.client_id || busy.value) {
                return;
            }

            busy.value = true;
            try {
                const credentials = await httpClient.node.getClientCredentials(props.entity.id);
                clientId.value = credentials.id;
                secret.value = credentials.secret;
            } catch (e) {
                emit('failed', e);
            } finally {
                busy.value = false;
            }
        };

        onMounted(load);

        const copy = (value: string | null) => {
            if (!value) {
                return;
            }

            clipboard.copy(value);
        };

        const toggleReveal = () => {
            revealed.value = !revealed.value;
        };

        return {
            busy,
            clientId,
            secret,
            revealed,
            copy,
            toggleReveal,
        };
    },
});
</script>
<template>
    <div>
        <h6>Client Credentials</h6>

        <p>
            These credentials authenticate the node's dedicated client against the Hub.
            Keep the secret confidential.
        </p>

        <div
            v-if="!entity.client_id"
            class="alert alert-sm alert-warning"
        >
            The node has not been assigned to a client yet.
        </div>
        <div
            v-else
            class="flex flex-col gap-2"
        >
            <VCFormGroup :label-class="'w-full mb-1'">
                <template #label>
                    <div class="flex flex-row">
                        <div>Client ID</div>
                        <div class="ms-auto">
                            <button
                                type="button"
                                class="btn btn-xs btn-dark"
                                :disabled="!clientId"
                                @click.prevent="copy(clientId)"
                            >
                                <VCIcon name="fa6-solid:copy" /> Copy
                            </button>
                        </div>
                    </div>
                </template>
                <template #default>
                    <VCFormInput
                        :model-value="clientId"
                        :readonly="true"
                    />
                </template>
            </VCFormGroup>

            <VCFormGroup :label-class="'w-full mb-1'">
                <template #label>
                    <div class="flex flex-row">
                        <div>Secret</div>
                        <div class="ms-auto flex flex-row gap-1">
                            <button
                                type="button"
                                class="btn btn-xs btn-dark"
                                @click.prevent="toggleReveal"
                            >
                                <VCIcon :name="revealed ? 'fa6-solid:eye-slash' : 'fa6-solid:eye'" />
                                {{ revealed ? 'Hide' : 'Reveal' }}
                            </button>
                            <button
                                type="button"
                                class="btn btn-xs btn-dark"
                                :disabled="!secret"
                                @click.prevent="copy(secret)"
                            >
                                <VCIcon name="fa6-solid:copy" /> Copy
                            </button>
                        </div>
                    </div>
                </template>
                <template #default>
                    <VCFormInput
                        :model-value="secret"
                        :type="revealed ? 'text' : 'password'"
                        :readonly="true"
                    />
                </template>
            </VCFormGroup>
        </div>
    </div>
</template>
