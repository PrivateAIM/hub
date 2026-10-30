/*
 * Form submit-button helper over @vuecs/forms.
 *
 * The other builder wrappers (`buildFormGroup`, `buildFormInput`, …) were
 * inlined into direct `<VCFormGroup>` / `<VCFormInput>` usage at their call
 * sites — they added no value over the components. Only `buildFormSubmit`
 * remains: it wires `@vuecs/forms`' `useSubmitButton` (label / icon / color /
 * loading / disabled resolution) which is non-trivial and shared across forms.
 */

import type { FormSubmitOptionsInput } from './types';
import type { VNodeChild } from 'vue';
import { h, unref } from 'vue';
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import { useSubmitButton } from '@vuecs/forms';



export function buildFormSubmit(input: FormSubmitOptionsInput): VNodeChild {
    // Delegate label / icon / color resolution to @vuecs/forms's
    // `useSubmitButton` composable. Per-call options below still override
    // the bindings.
    const bindings = useSubmitButton({
        isEditing: () => !!input.isEditing,
        loading: () => !!unref(input.busy),
        disabled: () => !!input.invalid || !!unref(input.busy),
    });

    const isEditing = !!input.isEditing;
    const resolved = bindings.value;

    const label = (isEditing ? input.updateText : input.createText) ?? resolved.label;

    let iconLeft: string | undefined;

    if (input.icon === false) {
        iconLeft = undefined;
    } else {
        const iconOverride = isEditing ? input.updateIcon : input.createIcon;

        iconLeft = iconOverride ?? resolved.iconLeft;
    }

    return h(
        VCButton,
        {
            type: input.type ?? resolved.type,
            color: resolved.color,
            size: 'xs',
            loading: resolved.loading,
            disabled: resolved.disabled,
            // `mt-3` matches the `mb-3` inter-group spacing applied to every
            // form-group root so the submit button sits at one consistent
            // gap below the last form field.
            class: 'mt-3',
            onClick: () => {
                void input.submit();
            },
        },
        () => [
            iconLeft ? h(VCIcon, { name: iconLeft, class: 'pe-1' }) : null,
            label,
        ],
    );
}
