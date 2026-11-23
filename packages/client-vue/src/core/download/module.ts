/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Start a browser download of `url` by clicking a detached anchor.
 * The referrer is withheld so a query token never leaks to the target.
 */
export function downloadViaAnchor(url: string): void {
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = '';
    anchor.rel = 'noopener noreferrer';
    anchor.referrerPolicy = 'no-referrer';
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
}
