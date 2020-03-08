'use strict';
import {debounce} from './strict';
import XHRError from './xhr-error';

const verifying = 'Verifying.....';
const validationFailed = 'Validation failed';
const checkFunctions = new WeakMap<HTMLAutoCheckElement, Function>();
/**
 * HTML5验证错误类型
 * 去除customError与valid键
 * @type {string[]}
 */
const errorTypes = [
    'typeMismatch',
    'badInput',
    'valueMissing',
    'tooShort',
    'tooLong',
    'rangeUnderflow',
    'rangeOverflow',
    'stepMismatch',
    'patternMismatch'
];

/**
 * Local validation
 *
 * @param event Event
 */
function nativeValidate(event: Event): void {
    const checkElement = event.currentTarget;
    if (!(checkElement instanceof HTMLAutoCheckElement)) return;

    const input = checkElement.input;
    if (!(input instanceof HTMLInputElement)) return;

    if (input.validity.customError) {
        input.setCustomValidity('');
    }

    if (input.checkValidity()) {
        checkElement.dispatchEvent(new CustomEvent(`auto-check:${checkElement.href ? 'native-success' : 'success'}`, {bubbles: true}));

        if (checkElement.href) {
            const remoteCheckFunction = checkFunctions.get(checkElement);
            if (remoteCheckFunction) {
                const dispatched = checkElement.dispatchEvent(new CustomEvent('auto-check:ajax-start', {bubbles: true, cancelable: true}));
                if (!dispatched) return;

                input.setCustomValidity(verifying);
                remoteCheckFunction(checkElement);
            }
        }
    } else {
        const message = hintText(input.validity, checkElement);
        if (!message) return;

        checkElement.dispatchEvent(new CustomEvent('auto-check:error', {detail: {message}, bubbles: true}));
    }
}

/**
 * remote validation
 *
 * @param checkElement HTMLAutoCheckElement
 */
function remoteValidate(checkElement: HTMLAutoCheckElement): void {
    const url = checkElement.href
        , input = checkElement.input;

    if (!url || !input || !input.value.trim()) return;

    input.setCustomValidity(verifying);

    const href = `${url.includes('?') ? url : `${url}?`}${new URLSearchParams({[input.name]: input.value.trim()}).toString()}`
        , init: RequestInit = {
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        headers: new Headers({'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json'})
    };

    fetch(href, init)
        .then(stream => {
            if (stream.ok) {
                return stream.text();
            } else {
                throw new XHRError(stream);
            }
        })
        .then(() => {
            input.setCustomValidity('');
            checkElement.dispatchEvent(new CustomEvent('auto-check:ajax-end', {bubbles: true}));
            checkElement.dispatchEvent(new CustomEvent('auto-check:ajax-success', {bubbles: true}));
            checkElement.dispatchEvent(new CustomEvent('auto-check:success', {bubbles: true}));
        })
        .catch(async err => {
            const eventInit: CustomEventInit = {bubbles: true, detail: {}};
            if (err instanceof XHRError) {
                try {
                    const res = await err.response.json();
                    eventInit.detail.message = res.message;
                } catch (e) {
                    eventInit.detail.message = validationFailed;
                }
            } else {
                eventInit.detail.message = validationFailed;
            }
            input.setCustomValidity(eventInit.detail.message);
            checkElement.dispatchEvent(new CustomEvent('auto-check:ajax-end', {bubbles: true}));
            checkElement.dispatchEvent(new CustomEvent('auto-check:ajax-error', eventInit));
            checkElement.dispatchEvent(new CustomEvent('auto-check:error', eventInit));
        });
}

/**
 * error text
 *
 * @param validityState input validity state
 * @param checkElement HTMLAutoCheckElement
 * @return text
 */
function hintText(validityState: ValidityState, checkElement: HTMLAutoCheckElement): string | null {
    let validationMessage = checkElement.msg;
    if (!validationMessage) return null;

    let obj: {[key: string]: string};
    try {
        const message = JSON.parse(validationMessage);
        if (typeof message === 'object') {
            obj = Object.assign({all: ''}, message);
        } else {
          obj = {all: message};
        }
    } catch (e) {
        obj = {all: validationMessage};
    }
    const type = errorTypes.find(value => Reflect.get(validityState, value)) || 'all';

    return obj[type];
}

/**
 *
 */
class HTMLAutoCheckElement extends HTMLElement {
    constructor() {
        super();
        checkFunctions.set(this, debounce(remoteValidate.bind(this), 500));
    }

    connectedCallback() {
        this.addEventListener('input', nativeValidate);

        const input = this.input;
        if (!input) return;

        input.autocomplete = 'off';
        input.spellcheck = false;
    }

    disconnectedCallback() {
        this.removeEventListener('input', nativeValidate);

        checkFunctions.delete(this);

        const input = this.input;
        if (!input) return;

        input.setCustomValidity('');
    }

    get href(): string | null {
        const href = this.getAttribute('href');
        if (!href) return '';

        const link = this.ownerDocument.createElement('a');
        link.href = href;
        return link.href;
    }
    set href(value: string | null) {
        if (value) {
            this.setAttribute('href', value);
        } else {
            this.removeAttribute('href');
        }
    }

    /**
     * 获取验证提示信息
     * @returns 提示信息
     */
    get msg(): string | null {
        return this.getAttribute('msg');
    }
    set msg(value: string | null) {
        if (value) {
            this.setAttribute('msg', value);
        } else {
            this.removeAttribute('msg');
        }
    }

    get input(): HTMLInputElement | null {
        return this.querySelector('input');
    }
}

if (!window.customElements.get('auto-check')) {
    window.HTMlAutoCheckElement = HTMLAutoCheckElement;
    window.customElements.define('auto-check', HTMLAutoCheckElement);
}

declare global {
    interface Window {
        HTMlAutoCheckElement: typeof HTMLAutoCheckElement
    }
}

export default HTMLAutoCheckElement;