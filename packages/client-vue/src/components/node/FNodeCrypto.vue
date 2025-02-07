<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Node } from '@privateaim/core-kit';
import {
    type AsymmetricAlgorithmParams,
    CryptoAsymmetricAlgorithm,
    exportAsymmetricPrivateKey,
    exportAsymmetricPublicKey,
    hexToUTF8,
    isHex,
} from '@privateaim/kit';
import { useClipboard } from '@vueuse/core';
import {
    type PropType, defineComponent, ref,
} from 'vue';
import type { FormSelectOption } from '@vuecs/form-controls';
import { injectCoreHTTPClient } from '../../core';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Node>,
            required: true,
        },
    },
    emits: ['updated', 'failed', 'keyCopied', 'keyPairGenerated'],
    setup(props, { emit }) {
        const httpClient = injectCoreHTTPClient();

        const keyTypeOptions : FormSelectOption[] = [
            { id: 'rsa', value: 'RSA' },
            { id: 'ecdh', value: 'ECDH' },
        ];
        const keyType = ref<string>('rsa');

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
                const response = await httpClient.node.update(props.entity.id, {
                    public_key: publicKey.value,
                });

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
                let algorithmOptions : AsymmetricAlgorithmParams;
                if (keyType.value === 'ecdh') {
                    algorithmOptions = {
                        name: 'ECDH',
                        namedCurve: 'P-384',
                    };
                } else {
                    algorithmOptions = {
                        name: 'RSA-OAEP',
                        modulusLength: 2048,
                        hash: 'SHA-256',
                        publicExponent: new Uint8Array([1, 0, 1]),
                    };
                }

                const algorithm = new CryptoAsymmetricAlgorithm(algorithmOptions);
                const keyPair = await algorithm.generateKeyPair();

                publicKey.value = await exportAsymmetricPublicKey(keyPair.publicKey);
                privateKey.value = await exportAsymmetricPrivateKey(keyPair.privateKey);

                emit('keyPairGenerated');
            } finally {
                busy.value = false;
            }
        };

        return {
            keyType,
            keyTypeOptions,

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

        <div class="d-flex flex-column gap-1">
            <div class="row">
                <div class="col-4">
                    <VCFormGroup :label-class="'w-100 mb-1'">
                        <template #label>
                            <div class="d-flex flex-row">
                                <div>
                                    PublicKey
                                </div>
                                <div class="ms-auto">
                                    <button
                                        v-show="!!publicKey"
                                        type="button"
                                        class="btn btn-xs btn-dark"
                                        @click.prevent="copy('publicKey')"
                                    >
                                        <i class="fa fa-copy" /> Copy
                                    </button>
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
                <div class="col-8">
                    <VCFormGroup :label-class="'w-100 mb-1'">
                        <template #label>
                            <div class="d-flex flex-row">
                                <div>
                                    PrivateKey
                                </div>
                                <div class="ms-auto">
                                    <button
                                        v-show="!!privateKey"
                                        type="button"
                                        class="btn btn-xs btn-dark"
                                        @click.prevent="copy('privateKey')"
                                    >
                                        <i class="fa fa-copy" /> Copy
                                    </button>
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
                        <div class="alert alert-sm alert-warning">
                            Please copy the key to a safe location, as it is not stored remotely.
                        </div>
                    </template>
                </div>
            </div>
            <div>
                <VCFormGroup>
                    <template #label>
                        KeyType
                    </template>

                    <VCFormSelect
                        v-model="keyType"
                        :options="keyTypeOptions"
                    />
                </VCFormGroup>
            </div>
            <div class="d-flex flex-row gap-1">
                <div>
                    <button
                        :disabled="busy"
                        type="button"
                        class="btn btn-primary btn-xs"
                        @click.prevent="save"
                    >
                        <i class="fa fa-save" /> Save
                    </button>
                </div>
                <div>
                    <button
                        :disabled="busy"
                        type="button"
                        class="btn btn-dark btn-xs"
                        @click.prevent="generate"
                    >
                        <i class="fas fa-sync-alt" /> Generate
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
