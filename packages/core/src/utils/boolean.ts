export function isBoolTrue<T = any>(input: T | boolean) : input is true {
    return typeof input === 'boolean' && !!input;
}

export function isBoolFalse<T = any>(input: T | boolean) : input is false {
    return typeof input === 'boolean';
}

export function isBool<T = any>(input: T | boolean) : input is boolean {
    return typeof input === 'boolean';
}
