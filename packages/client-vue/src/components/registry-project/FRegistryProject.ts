/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { useFieldValidation } from '@ilingo/validup-vue';
import { useValidup } from '@validup/vue';
import type { Severity } from '@validup/vue';
import type {
    RegistryProject,
} from '@privateaim/core-kit';
import {
    DomainType,
    RegistryAPICommand,
    ServiceID,
    registryRobotSecretRegex,
} from '@privateaim/core-kit';
import { TypedContainer } from '@privateaim/kit';
import { createValidator } from '@validup/zod';
import { z } from 'zod';
import { VCButton } from '@vuecs/button';
import { VCAlert } from '@vuecs/elements';
import { VCFormGroup, VCFormInput } from '@vuecs/forms';
import type { SlotsType, VNodeChild } from 'vue';
import {
    defineComponent,
    h,
    reactive,
    ref,
    resolveComponent,
} from 'vue';
import type { EntityManagerSlotsType } from '../../core';
import {
    createEntityManager,
    defineEntityManagerEvents,
    defineEntityManagerProps,
    injectCoreHTTPClient,
    wrapFnWithBusyState,
} from '../../core';

class RegistryProjectSecretValidator extends TypedContainer<{ secret: string }> {
    protected override initialize() {
        super.initialize();

        this.mount(
            'secret',
            { optional: true },
            createValidator(z.string().regex(registryRobotSecretRegex)),
        );
    }
}

export default defineComponent({
    props: defineEntityManagerProps<RegistryProject>(),
    emits: defineEntityManagerEvents<RegistryProject>(),
    slots: Object as SlotsType<EntityManagerSlotsType<RegistryProject>>,
    async setup(props, setup) {
        const apiClient = injectCoreHTTPClient();
        const busy = ref(false);

        const form = reactive({ secret: '' });

        const $v = useValidup(new RegistryProjectSecretValidator(), form);

        const secretValidation = useFieldValidation($v.fields.secret);

        const toSeverity = (input: Severity) => (input === 'error' || input === 'warning' ? input : undefined);

        const manager = createEntityManager({
            type: `${DomainType.REGISTRY_PROJECT}`,
            setup,
            props,
            onResolved(entity) {
                if (entity) {
                    form.secret = entity.accountSecret || '';
                }
            },
            // The socket payload no longer carries `accountSecret` — BaseSubscriber
            // strips every `select: false` column from entity events, so the room
            // (joinable with REGISTRY_PROJECT_MANAGE) cannot leak a field whose HTTP
            // read requires REGISTRY_MANAGE. Re-read over HTTP instead, which does
            // enforce it. Deliberately NOT `manager.resolve({ reset: true })`: that
            // nulls the entity first, unmounting the panel for a frame and leaving
            // it blank for good if the re-read fails.
            onUpdated: (entity) => {
                if (!entity || !entity.id) {
                    return;
                }

                void apiClient.registryProject
                    .getOne(entity.id, { fields: ['+accountId', '+accountName', '+accountSecret'] })
                    .then(({ data }) => {
                        form.secret = data.accountSecret || '';
                    })
                    .catch(() => {
                        // keep rendering the record already on screen
                    });
            },
        });

        await manager.resolve({ query: { fields: ['+accountId', '+accountName', '+accountSecret'] } });

        const execute = async (command: RegistryAPICommand) => wrapFnWithBusyState(busy, async () => {
            if (!manager.data.value) return;

            try {
                await apiClient.service.runCommand(ServiceID.REGISTRY, command, {
                    id: manager.data.value.id,
                    secret: form.secret,
                });

                setup.emit('updated', manager.data.value);
            } catch (e) {
                if (e instanceof Error) {
                    setup.emit('failed', e);
                }
            }
        })();

        if (!manager.data.value) {
            return () => h(
                VCAlert,
                {
                    color: 'warning', 
                    variant: 'soft', 
                    size: 'sm', 
                    class: 'mb-3', 
                },
                () => [
                    'The registry-project details can not be displayed.',
                ],
            );
        }

        return () => {
            const VCIcon = resolveComponent('VCIcon');
            const fallback = () : VNodeChild => h('div', [
                h('div', { class: 'mb-2 flex flex-col' }, [
                    h('div', { class: 'mb-3' }, [
                        h('label', { class: 'pe-1' }, 'Project'),
                        h('input', {
                            class: 'form-control',
                            type: 'text',
                            value: manager.data.value?.externalName || '',
                            disabled: true,
                        }),
                    ]),

                    h('div', [
                        h('div', { class: 'mb-3' }, [
                            h('label', { class: 'pe-1' }, 'Account ID'),
                            h('input', {
                                class: 'form-control',
                                type: 'text',
                                value: manager.data.value?.accountName || '',
                                placeholder: '...',
                                disabled: true,
                            }),
                        ]),
                        h(
                            VCFormGroup,
                            {
                                label: true,
                                labelContent: 'Account Secret',
                                validationMessages: secretValidation.messages,
                                validationSeverity: toSeverity(secretValidation.severity),
                            },
                            {
                                default: () => h(VCFormInput, {
                                    modelValue: form.secret == null ? '' : String(form.secret),
                                    'onUpdate:modelValue': (value: string) => {
                                        form.secret = value;
                                    },
                                    placeholder: '...',
                                }),
                            },
                        ),
                    ]),

                    h('div', [
                        h('strong', { class: 'pe-1' }, 'Webhook:'),
                        h(VCIcon, {
                            name: manager.data.value?.webhookExists ? 'fa6-solid:check' : 'fa6-solid:xmark',
                            class: manager.data.value?.webhookExists ? 'text-success-600' : 'text-error-600',
                        }),
                    ]),
                ]),
                h('hr'),
                h('div', { class: 'flex flex-wrap -mx-2' }, [
                    h('div', { class: 'flex-1 basis-0 px-2' }, [
                        h(VCAlert, {
                            color: 'info', 
                            variant: 'soft', 
                            size: 'sm', 
                            class: 'mb-3', 
                        }, () => [
                            'Connect the database entity to the registry.',
                        ]),
                        h('div', { class: 'text-center' }, [
                            h(VCButton, {
                                color: 'primary',
                                size: 'xs',
                                disabled: busy.value,
                                onClick($event: any) {
                                    $event.preventDefault();

                                    return execute(RegistryAPICommand.PROJECT_LINK);
                                },
                            }, () => [
                                h(VCIcon, { name: 'fa6-solid:plug', class: 'pe-1' }),
                                'Connect',
                            ]),
                        ]),
                    ]),
                    h('div', { class: 'flex-1 basis-0 px-2' }, [
                        h(VCAlert, {
                            color: 'warning', 
                            variant: 'soft', 
                            size: 'sm', 
                            class: 'mb-3', 
                        }, () => [
                            'Disconnect the database entity of the registry.',
                        ]),
                        h('div', { class: 'text-center' }, [
                            h(VCButton, {
                                color: 'error',
                                size: 'xs',
                                disabled: busy.value,
                                onClick($event: any) {
                                    $event.preventDefault();
                                    return execute(RegistryAPICommand.PROJECT_UNLINK);
                                },
                            }, () => [
                                h(VCIcon, { name: 'fa6-solid:power-off', class: 'pe-1' }),
                                'Disconnect',
                            ]),
                        ]),
                    ]),
                ]),
            ]);

            return manager.render(fallback);
        };
    },
});
