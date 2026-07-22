<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Node } from '@privateaim/core-kit';
import type { NodeClientCredentialsUpdate } from '@privateaim/core-http-kit';
import { VCButton } from '@vuecs/button';
import { VCAlert } from '@vuecs/elements';
import { VCIcon } from '@vuecs/icon';
import { useClipboard } from '@vueuse/core';
import {
    type PropType,
    defineComponent,
    onMounted,
    ref,
    watch,
} from 'vue';
import { injectCoreHTTPClient } from '../../core';

export default defineComponent({
    components: {
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
    emits: ['failed'],
    setup(props, { emit }) {
        const httpClient = injectCoreHTTPClient();
        const clipboard = useClipboard();

        const clientId = ref<string | null>(null);
        const name = ref<string>('');
        const displayName = ref<string>('');
        const secret = ref<string>('');
        const revealed = ref(false);
        const busy = ref(false);
        const loaded = ref(false);

        // Monotonic token identifying the most recent load(). The parent reuses
        // this component across node ids, so a slow in-flight request for a
        // previous node must never overwrite the credentials of the node that is
        // shown now — otherwise a node renders another node's client secret (and
        // a stale response would also clobber in-progress edits to the form).
        // Only the response whose token still matches is applied.
        let loadToken = 0;

        const load = async () => {
            const token = ++loadToken;
            const nodeId = props.entity.id;

            // Reset so a previous node's credentials never linger while the
            // current one is (re)loaded.
            revealed.value = false;
            clientId.value = null;
            name.value = '';
            displayName.value = '';
            secret.value = '';

            if (!props.entity.client_id) {
                busy.value = false;
                loaded.value = true;
                return;
            }

            busy.value = true;
            loaded.value = false;
            try {
                const credentials = await httpClient.node.getClientCredentials(nodeId);
                if (token !== loadToken) {
                    // A newer load() superseded this request — drop the result.
                    return;
                }

                clientId.value = credentials.id;
                name.value = credentials.name ?? '';
                displayName.value = credentials.display_name ?? '';
                secret.value = credentials.secret ?? '';
            } catch (e) {
                if (token === loadToken) {
                    emit('failed', e);
                }
            } finally {
                if (token === loadToken) {
                    busy.value = false;
                    loaded.value = true;
                }
            }
        };

        onMounted(load);
        watch(() => props.entity.id, load);

        const copy = (value: string | null) => {
            if (!value) {
                return;
            }

            clipboard.copy(value);
        };

        const toggleReveal = () => {
            revealed.value = !revealed.value;
        };

        const submit = async () => {
            if (busy.value || !props.entity.client_id) {
                return;
            }

            // This write is the latest intent for the shown node: bump the token
            // so any in-flight load()'s response is dropped, and capture the node
            // id so that if the parent switches nodes mid-request our own result
            // is discarded instead of overwriting the newly shown node.
            const token = ++loadToken;
            const nodeId = props.entity.id;

            // The form is the desired state: a non-empty name/display-name is
            // written, an empty secret rotates to a freshly generated one.
            const data: NodeClientCredentialsUpdate = {
                secret: secret.value ? secret.value : undefined,
                name: name.value ? name.value : undefined,
                display_name: displayName.value ? displayName.value : null,
            };

            busy.value = true;
            try {
                const credentials = await httpClient.node.setClientCredentials(nodeId, data);
                if (token !== loadToken) {
                    return;
                }

                clientId.value = credentials.id;
                name.value = credentials.name ?? '';
                displayName.value = credentials.display_name ?? '';
                secret.value = credentials.secret ?? '';
                // Reveal the freshly written secret so the admin can copy it.
                revealed.value = true;
            } catch (e) {
                if (token === loadToken) {
                    emit('failed', e);
                }
            } finally {
                if (token === loadToken) {
                    busy.value = false;
                }
            }
        };

        return {
            busy,
            loaded,
            clientId,
            name,
            displayName,
            secret,
            revealed,
            copy,
            toggleReveal,
            submit,
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

        <VCAlert
            v-if="!entity.client_id"
            color="warning"
            variant="soft"
            size="sm"
            class="mb-3"
        >
            The node has not been assigned to a client yet.
        </VCAlert>
        <div
            v-else-if="busy || !loaded"
            class="flex flex-row items-center gap-2"
        >
            <VCIcon
                name="fa6-solid:circle-notch"
                class="animate-spin"
            />
            <span>Loading credentials…</span>
        </div>
        <form
            v-else
            class="flex flex-col gap-2"
            @submit.prevent="submit"
        >
            <VCFormGroup :label-class="'w-full mb-1'">
                <template #label>
                    <div class="flex flex-row">
                        <div>Client ID</div>
                        <div class="ms-auto">
                            <VCButton
                                size="xs"
                                color="neutral"
                                :disabled="!clientId"
                                @click.prevent="copy(clientId)"
                            >
                                <VCIcon name="fa6-solid:copy" /> Copy
                            </VCButton>
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
                    Name
                </template>
                <template #default>
                    <VCFormInput v-model="name" />
                </template>
            </VCFormGroup>

            <VCFormGroup :label-class="'w-full mb-1'">
                <template #label>
                    Display Name
                </template>
                <template #default>
                    <VCFormInput v-model="displayName" />
                </template>
            </VCFormGroup>

            <VCFormGroup :label-class="'w-full mb-1'">
                <template #label>
                    <div class="flex flex-row">
                        <div>Secret</div>
                        <div class="ms-auto flex flex-row gap-1">
                            <VCButton
                                size="xs"
                                color="neutral"
                                @click.prevent="toggleReveal"
                            >
                                <VCIcon :name="revealed ? 'fa6-solid:eye-slash' : 'fa6-solid:eye'" />
                                {{ revealed ? 'Hide' : 'Reveal' }}
                            </VCButton>
                            <VCButton
                                size="xs"
                                color="neutral"
                                :disabled="!secret"
                                @click.prevent="copy(secret)"
                            >
                                <VCIcon name="fa6-solid:copy" /> Copy
                            </VCButton>
                        </div>
                    </div>
                </template>
                <template #default>
                    <VCFormInput
                        v-model="secret"
                        :type="revealed ? 'text' : 'password'"
                    />
                    <small class="text-fg-muted">Leave empty to generate a new secret.</small>
                </template>
            </VCFormGroup>

            <div class="flex flex-row">
                <VCButton
                    type="submit"
                    color="primary"
                    size="sm"
                    class="ms-auto"
                    :disabled="busy"
                >
                    <VCIcon name="fa6-solid:floppy-disk" /> Update
                </VCButton>
            </div>
        </form>
    </div>
</template>
