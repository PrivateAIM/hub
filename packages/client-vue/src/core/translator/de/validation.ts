/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { LinesRecord } from 'ilingo';

export const LanguageValidationGerman : LinesRecord = {
    email: 'Die Eingabe muss eine gültige E-Mail sein.',
    maxLength: 'Die Länge der Eingabe muss kleiner als {{max}} sein.',
    minLength: 'Die Länge der Eingabe muss größer als {{min}} sein.',
    required: 'Ein Eingabewert wird benötigt.',
    sameAs: 'Der Eingabewert entspricht nicht dem Wert der Eingabe von {{equalTo}}',
    url: 'Der Eingabewert muss dem URL-Format entsprechen.',
    alphaNumHyphenUnderscore: 'Der Eingabewert darf nur aus folgenden Zeichen bestehen: [0-9a-z-_]+',
    alphaWithUpperNumHyphenUnderscore: 'Der Eingabewert darf nur aus folgenden Zeichen bestehen: [0-9a-zA-Z-_]+',
    permissionNamePattern: 'Die Eingabe muss folgendes regex pattern erfüllen: : [a-zA-Z-]+_[a-zA-Z-]+',
};
