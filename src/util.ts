'use strict';

function camelCase(str: string): string {
    return str.replace(/([a-zA-Z]+)[-_]([a-z])/g, (_, a, b) => `${a}${b.toUpperCase()}`);
}

export { camelCase };
