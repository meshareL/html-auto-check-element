'use strict';

function debounce(fun: Function, interval = 300) {
    let time: number | null = null;
    return function (this: any) {
        if (time) {
            window.clearTimeout(time);
            time = null;
        }
        time = window.setTimeout(() => {
            const args = [];
            for (let i = 0; i < arguments.length; i++) {
                args[i] = arguments[i];
            }
            fun.apply(this, args);
        }, interval);
    };
}

export { debounce };