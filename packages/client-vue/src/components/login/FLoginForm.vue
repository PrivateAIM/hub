<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { injectStore } from '@authup/client-web-kit';
import { IFieldValidation } from '@ilingo/validup-vue';
import { useValidup } from '@validup/vue';
import { createValidator } from '@validup/zod';
import { Container } from 'validup';
import { z } from 'zod';
import {
    computed,
    defineComponent,
    reactive,
    ref,
    toRef,
    watch,
} from 'vue';
import { VCButton } from '@vuecs/button';
import { VCFormGroup, VCFormInput, useSubmitButton } from '@vuecs/forms';

class LoginCredentialsValidator extends Container<{
    name: string;
    password: string;
    realm_id: string;
}> {
    protected override initialize() {
        super.initialize();
        this.mount('name', createValidator(z.string().min(3).max(255)));
        this.mount('password', createValidator(z.string().min(3).max(255)));
        this.mount('realm_id', { optional: true }, createValidator(z.string()));
    }
}

export default defineComponent({
    components: {
        IFieldValidation,
        VCButton,
        VCFormGroup,
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

        const v = useValidup(new LoginCredentialsValidator(), form);

        const busy = ref(false);

        const submitButton = useSubmitButton({
            loading: busy,
            disabled: computed(() => busy.value || v.$invalid.value),
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
            v,
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
        <IFieldValidation
            v-slot="{ value }"
            :field="v.fields.name"
        >
            <VCFormGroup :validation="value">
                <template #label>
                    Name
                </template>
                <VCFormInput v-model="v.fields.name.$model.value" />
            </VCFormGroup>
        </IFieldValidation>

        <IFieldValidation
            v-slot="{ value }"
            :field="v.fields.password"
        >
            <VCFormGroup :validation="value">
                <template #label>
                    Password
                </template>
                <VCFormInput
                    v-model="v.fields.password.$model.value"
                    type="password"
                />
            </VCFormGroup>
        </IFieldValidation>

        <VCButton
            v-bind="submitButton"
            label="Login"
            class="w-full"
        />
    </form>
</template>
