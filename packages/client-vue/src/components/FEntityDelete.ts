/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useTranslation } from '@authup/client-web-kit';
import {
    TranslatorTranslationActionKey,
    TranslatorTranslationAppKey,
    TranslatorTranslationNamespace,
} from '@authup/i18n';
import { VCButton } from '@vuecs/button';
import type { ButtonColor, ButtonSize, ButtonVariant } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import { useAlertDialog } from '@vuecs/overlays';
import type { DomainType as CoreDomainType } from '@privateaim/core-kit';
import type { DomainType as StorageDomainType } from '@privateaim/storage-kit';
import type { DomainType as TelemetryDomainType } from '@privateaim/telemetry-kit';
import type {
    Component,
    PropType,
    VNodeArrayChildren,
} from 'vue';
import {
    defineComponent,
    getCurrentInstance,
    h,
    ref,
    resolveDynamicComponent,
} from 'vue';
import type { DomainAPISlim } from '@privateaim/core-http-kit';
import { injectCoreHTTPClient, injectStorageHTTPClient, injectTelemetryHTTPClient } from '../core';
import { ElementType } from './constants';

export default defineComponent({
    name: 'FEntityDelete',
    props: {
        service: {
            type: String as PropType<'core' | 'storage' | 'telemetry'>,
            default: 'core',
        },
        elementIcon: {
            type: String,
            default: 'fa6-solid:trash',
        },
        withText: {
            type: Boolean,
            default: true,
        },
        elementType: {
            type: String as PropType<`${ElementType}`>,
            default: `${ElementType.BUTTON}`,
        },

        entityId: {
            type: String,
            required: true,
        },
        entityType: {
            // Accept core / storage / telemetry domain types — the `service`
            // prop selects which API client resolves it.
            type: String as PropType<`${CoreDomainType}` | `${StorageDomainType}` | `${TelemetryDomainType}`>,
            required: true,
        },

        hint: {
            type: String,
            default: undefined,
        },
        locale: {
            type: String,
            default: undefined,
        },

        // Button styling (BUTTON elementType). Baked into the rendered
        // <VCButton> so call sites no longer pass the retired `.btn*`
        // compat classes.
        size: {
            type: String as PropType<ButtonSize>,
            default: 'sm' satisfies ButtonSize,
        },
        color: {
            type: String as PropType<ButtonColor>,
            default: 'error' satisfies ButtonColor,
        },
        variant: {
            // Danger-outline by default — mirrors authup's <AEntityDelete>
            // and the adjacent outline "details" action buttons (the VCButton
            // default is solid, which renders a filled-red button that clashes).
            type: String as PropType<ButtonVariant>,
            default: 'outline' satisfies ButtonVariant,
        },
        disabled: {
            type: Boolean,
            default: false,
        },

        // Gate the (irreversible) delete behind a confirmation dialog rendered
        // by the app-level <VCAlertDialogProvider> via useAlertDialog(). On by
        // default — opt out per call site with :with-prompt="false".
        withPrompt: {
            type: Boolean,
            default: true,
        },
    },
    emits: ['deleted', 'failed'],
    setup(props, ctx) {
        const coreClient = injectCoreHTTPClient();
        const telemetryClient = injectTelemetryHTTPClient();
        const storageClient = injectStorageHTTPClient();

        const instance = getCurrentInstance();
        const busy = ref(false);

        const submit = async () => {
            if (busy.value) return;

            let domainAPI : DomainAPISlim<any> | undefined;
            switch (props.service) {
                case 'core': {
                    domainAPI = (coreClient as Record<string, any>)[props.entityType] as DomainAPISlim<any> | undefined;
                    break;
                }
                case 'storage': {
                    domainAPI = (storageClient as Record<string, any>)[props.entityType] as DomainAPISlim<any> | undefined;
                    break;
                }
                case 'telemetry': {
                    domainAPI = (telemetryClient as Record<string, any>)[props.entityType] as DomainAPISlim<any> | undefined;
                    break;
                }
            }

            if (!domainAPI) {
                return;
            }

            if (typeof domainAPI.delete !== 'function') {
                return;
            }

            busy.value = true;

            try {
                const response = await domainAPI.delete(props.entityId);
                response.id = props.entityId;
                ctx.emit('deleted', response);
            } catch (e) {
                ctx.emit('failed', e);
            }

            busy.value = false;
        };

        const translation = useTranslation({
            namespace: TranslatorTranslationNamespace.ACTION,
            key: TranslatorTranslationActionKey.DELETE,
        });

        // Imperative confirmation dialog, resolved ONLY when prompting is
        // enabled — so `<FEntityDelete :with-prompt="false">` never injects the
        // AlertDialogManager and therefore doesn't require the app-level
        // <VCAlertDialogProvider>. `useAlertDialog()` only calls inject() (no
        // lifecycle hooks), so this one-time conditional resolution in setup is
        // safe. It resolves true (Delete) / false (Abort / Escape).
        const confirmDialog = props.withPrompt ? useAlertDialog() : undefined;

        // Singular, localized entity noun (`count: 1`) interpolated into the
        // confirmation title. Hub entity types are not part of authup's ENTITY
        // namespace, so most fall back to the raw key (e.g. "node") — still
        // readable, and superseded once the hub ships its own i18n catalog.
        const entityLabel = useTranslation({
            namespace: TranslatorTranslationNamespace.ENTITY,
            key: props.entityType,
            count: 1,
        });
        const abortLabel = useTranslation({
            namespace: TranslatorTranslationNamespace.ACTION,
            key: TranslatorTranslationActionKey.ABORT,
        });
        const promptTitle = useTranslation({
            namespace: TranslatorTranslationNamespace.APP,
            key: TranslatorTranslationAppKey.DELETE_CONFIRM_TITLE,
            data: { entity: entityLabel },
        });
        const promptDescription = useTranslation({
            namespace: TranslatorTranslationNamespace.APP,
            key: TranslatorTranslationAppKey.DELETE_CONFIRM_DESCRIPTION,
        });

        const onClick = async ($event: any) => {
            $event.preventDefault();

            // Re-entrancy guard: a fast double-click could otherwise stack two
            // confirmation dialogs (or fire two deletes) before submit() flips
            // `busy`, since the button stays enabled while confirmDialog() is
            // pending.
            if (busy.value) {
                return undefined;
            }

            if (props.withPrompt && confirmDialog) {
                // Mark busy across the confirmation so the button is disabled
                // while the dialog is open, then release it before submit() —
                // which owns `busy` for the delete request and early-returns if
                // it is still set. No await between the release and submit(), so
                // no re-entrancy window reopens.
                busy.value = true;
                let confirmed: boolean;
                try {
                    confirmed = await confirmDialog({
                        title: promptTitle.value,
                        description: promptDescription.value,
                        confirmLabel: translation.value,
                        cancelLabel: abortLabel.value,
                        tone: 'error',
                    });
                } finally {
                    busy.value = false;
                }

                if (!confirmed) {
                    return undefined;
                }
            }

            return submit();
        };

        const render = () => {
            // Default (button) path — mirrors authup's <AEntityDelete>: a
            // self-styled <VCButton> with the icon via `iconLeft` (leading
            // span) and text via `label`, so hub + authup delete buttons
            // render identically.
            if (props.elementType === ElementType.BUTTON) {
                return h(VCButton, {
                    color: props.color,
                    variant: props.variant,
                    size: props.size,
                    iconLeft: props.elementIcon || undefined,
                    label: props.withText ? translation.value : undefined,
                    disabled: busy.value || props.disabled,
                    onClick,
                });
            }

            // Link / dropdown-item paths keep the bare element — their call
            // sites style them as nav/dropdown entries, not buttons.
            let tag : Component | string = 'a';
            if (props.elementType === ElementType.DROP_DOWN_ITEM) {
                if (
                    instance &&
                    typeof instance.appContext.app.component('VCDropdownMenuItem') !== 'undefined'
                ) {
                    tag = resolveDynamicComponent('VCDropdownMenuItem') as Component;
                }
            }

            let icon : VNodeArrayChildren = [];
            if (props.elementIcon) {
                icon = [
                    h(VCIcon, {
                        name: props.elementIcon,
                        class: props.withText ? 'pe-1' : undefined,
                    }),
                ];
            }

            let text : VNodeArrayChildren = [];
            if (props.withText) {
                text = [
                    translation.value,
                ];
            }

            return h(
                tag as string,
                {
                    disabled: busy.value || props.disabled,
                    onClick,
                },
                [
                    icon,
                    text,
                ],
            );
        };

        return () => render();
    },
});
