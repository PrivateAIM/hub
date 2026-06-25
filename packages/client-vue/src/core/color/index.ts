/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ButtonColor } from '@vuecs/button';

/*
 * Maps the legacy Bootstrap "classSuffix" (primary / secondary / success /
 * danger / warning / info / dark) — built dynamically by status / command
 * components — onto vuecs button colors and static Tailwind utility classes.
 *
 * The class strings below are LITERAL so the Tailwind JIT (which scans
 * `packages/client-vue/src`) generates them; a runtime-built `text-${suffix}`
 * is invisible to the scanner. This replaces the retired `.text-*` / `.bg-*`
 * Bootstrap-compat aliases.
 */

export function resolveButtonColor(suffix?: string): ButtonColor {
    switch (suffix) {
        case 'success': return 'success';
        case 'danger': return 'error';
        case 'warning': return 'warning';
        case 'info': return 'info';
        case 'secondary':
        case 'dark': return 'neutral';
        default: return 'primary';
    }
}

const TEXT_COLOR_CLASS: Record<string, string> = {
    primary: 'text-primary-600',
    secondary: 'text-neutral-500',
    success: 'text-success-600',
    warning: 'text-warning-600',
    danger: 'text-error-600',
    info: 'text-info-600',
    dark: 'text-fg',
    light: 'text-white',
};

export function resolveTextColorClass(suffix?: string): string {
    return (suffix && TEXT_COLOR_CLASS[suffix]) || 'text-fg';
}
