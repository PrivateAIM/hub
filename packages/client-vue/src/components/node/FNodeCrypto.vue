<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Node } from '@privateaim/core-kit';
import {
    CryptoAsymmetricAlgorithm,
    exportAsymmetricPrivateKey,
    exportAsymmetricPublicKey,
    hexToUTF8,
    isHex,
} from '@privateaim/kit';
import { VCButton } from '@vuecs/button';
import { VCAlert } from '@vuecs/elements';
import { VCIcon } from '@vuecs/icon';
import { useClipboard } from '@vueuse/core';
import {
    type PropType,
    defineComponent,
    ref,
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
    emits: ['updated', 'failed', 'keyCopied', 'keyPairGenerated'],
    setup(props, { emit }) {
        const httpClient = injectCoreHTTPClient();

        const privateKey = ref<string | null>(null);
        const publicKey = ref<string | null>(null);

        const clipboard = useClipboard();

        const init = () => {
            if (props.entity.public_key) {
                publicKey.value = isHex(props.entity.public_key) ?
                    hexToUTF8(props.entity.public_key) :
                    props.entity.public_key;
            }
        };

        init();

        const copy = (type: string) => {
            if (type === 'privateKey') {
                if (!privateKey.value) {
                    return;
                }

                clipboard.copy(privateKey.value);

                emit('keyCopied');
                return;
            }

            if (!publicKey.value) {
                return;
            }

            clipboard.copy(publicKey.value);
            emit('keyCopied');
        };

        const busy = ref(false);

        const save = async () => {
            if (busy.value) return;
            busy.value = true;

            try {
                const response = await httpClient.node.update(props.entity.id, { public_key: publicKey.value });

                emit('updated', response);
            } catch (e) {
                emit('failed', e);
            } finally {
                busy.value = false;
            }
        };

        const generate = async () => {
            if (busy.value) return;

            busy.value = true;

            try {
                const algorithm = new CryptoAsymmetricAlgorithm({
                    name: 'ECDH',
                    namedCurve: 'P-256',
                });

                const keyPair = await algorithm.generateKeyPair();

                publicKey.value = await exportAsymmetricPublicKey(keyPair.publicKey);
                privateKey.value = await exportAsymmetricPrivateKey(keyPair.privateKey);

                emit('keyPairGenerated');
            } finally {
                busy.value = false;
            }
        };

        return {
            busy,

            copy,
            generate,
            save,

            publicKey,
            privateKey,
        };
    },
});
</script>
<template>
    <div>
        <h6>KeyPair</h6>

        <p>
            The public key of the key pair is used to encrypt data that is transmitted between
            different nodes through the storage service.
        </p>

        <div class="flex flex-col gap-1">
            <div class="flex flex-wrap -mx-2">
                <div class="w-4/12 px-2">
                    <VCFormGroup :label-class="'w-full mb-1'">
                        <template #label>
                            <div class="flex flex-row">
                                <div>
                                    PublicKey
                                </div>
                                <div class="ms-auto">
                                    <VCButton
                                        v-show="!!publicKey"
                                        size="xs"
                                        color="neutral"
                                        @click.prevent="copy('publicKey')"
                                    >
                                        <VCIcon name="fa6-solid:copy" /> Copy
                                    </VCButton>
                                </div>
                            </div>
                        </template>
                        <template #default>
                            <VCFormTextarea
                                v-model="publicKey"
                                rows="8"
                            />
                        </template>
                    </VCFormGroup>
                </div>
                <div class="w-8/12 px-2">
                    <VCFormGroup :label-class="'w-full mb-1'">
                        <template #label>
                            <div class="flex flex-row">
                                <div>
                                    PrivateKey
                                </div>
                                <div class="ms-auto">
                                    <VCButton
                                        v-show="!!privateKey"
                                        size="xs"
                                        color="neutral"
                                        @click.prevent="copy('privateKey')"
                                    >
                                        <VCIcon name="fa6-solid:copy" /> Copy
                                    </VCButton>
                                </div>
                            </div>
                        </template>
                        <template #default>
                            <VCFormTextarea
                                v-model="privateKey"
                                :disabled="true"
                                rows="8"
                            />
                        </template>
                    </VCFormGroup>

                    <template v-if="privateKey">
                        <VCAlert
                            color="error"
                            variant="soft"
                            size="sm"
                            class="mb-3"
                        >
                            <VCIcon name="fa6-solid:triangle-exclamation" />
                            Please copy the key to a safe location, as it is not stored remotely.
                        </VCAlert>
                    </template>
                </div>
            </div>
            <div class="flex flex-row gap-1">
                <div>
                    <VCButton
                        :disabled="busy"
                        color="primary"
                        size="xs"
                        @click.prevent="save"
                    >
                        <VCIcon name="fa6-solid:floppy-disk" /> Save
                    </VCButton>
                </div>
                <div>
                    <VCButton
                        :disabled="busy"
                        color="neutral"
                        size="xs"
                        @click.prevent="generate"
                    >
                        <VCIcon name="fa6-solid:arrows-rotate" /> Generate
                    </VCButton>
                </div>
            </div>
        </div>
    </div>
</template>
