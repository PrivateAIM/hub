<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { injectStore } from '@authup/client-web-kit';
import { IVuelidate } from '@ilingo/vuelidate';
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import {
    computed,
    defineComponent,
    reactive,
    ref,
    toRef,
    watch,
} from 'vue';
import { VCButton } from '@vuecs/button';
import { VCFormInput, useSubmitButton } from '@vuecs/forms';

export default defineComponent({
    components: {
        IVuelidate,
        VCButton,
        VCFormInput,
    },
    props: { realmId: { type: String } },
    emits: ['done', 'failed'],
    setup(props, { emit }) {
        const store = injectStore();

        const realmId = toRef(props, 'realmId');

        const form = reactive({
            name: '',
            password: '',
            realm_id: '',
        });

        if (realmId.value) {
            form.realm_id = realmId.value;
        }

        watch(realmId, (val) => {
            form.realm_id = val ?? '';
        });

        const vuelidate = useVuelidate({
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(255),
            },
            password: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(255),
            },
            realm_id: {},
        }, form);

        const busy = ref(false);

        const submitButton = useSubmitButton({
            loading: busy,
            disabled: computed(() => busy.value || vuelidate.value.$invalid),
        });

        const submit = async () => {
            try {
                await store.login({
                    name: form.name,
                    password: form.password,
                    realmId: form.realm_id,
                });

                emit('done');
            } catch (e: any) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        };

        return {
            vuelidate,
            form,
            submit,
            busy,
            submitButton,
        };
    },
});
</script>
<template>
    <form @submit.prevent="submit">
        <IVuelidate :validation="vuelidate.name">
            <template #default="props">
                <VCFormGroup
                    :validation-messages="props.data"
                    :validation-severity="props.severity"
                >
                    <template #label>
                        Name
                    </template>
                    <template #default>
                        <VCFormInput
                            v-model="vuelidate.name.$model"
                        />
                    </template>
                </VCFormGroup>
            </template>
        </IVuelidate>

        <IVuelidate :validation="vuelidate.password">
            <template #default="props">
                <VCFormGroup
                    :validation-messages="props.data"
                    :validation-severity="props.severity"
                >
                    <template #label>
                        Password
                    </template>
                    <template #default>
                        <VCFormInput
                            v-model="vuelidate.password.$model"
                            type="password"
                        />
                    </template>
                </VCFormGroup>
            </template>
        </IVuelidate>

        <VCButton
            v-bind="submitButton"
            label="Login"
            class="w-full"
        />
    </form>
</template>
