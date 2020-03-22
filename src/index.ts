'use strict';
import {debounce} from './strict';
import {camelCase} from './util';

const verifying = 'Verifying.....';
const validationFailed = 'Validation failed';
const checkFunctions = new WeakMap<HTMLAutoCheckElement, Function>();
const validationMessages = new WeakMap<HTMLAutoCheckElement, { [key: string]: string }>();

/**
 * HTML5验证错误类型
 * 去除customError与valid键
 */
const errorTypes: string[] = [
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
        // The 'auto-check:native-success' event need to be dispatched ?
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

        checkElement.dispatchEvent(new CustomEvent('auto-check:error', {detail: {response: message}, bubbles: true}));
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
        headers: new Headers({'X-Requested-With': 'XMLHttpRequest', 'Accept': '*/*'})
    };

    checkElement.dispatchEvent(new CustomEvent('auto-check:ajax-send', {bubbles: true, detail: {requestInit: init}}));

    fetch(href, init)
        .then(stream => {
            if (stream.ok) {
                input.setCustomValidity('');
                checkElement.dispatchEvent(new CustomEvent('auto-check:ajax-end', {bubbles: true}));
                checkElement.dispatchEvent(new CustomEvent('auto-check:ajax-success', {bubbles: true, detail: {response: stream.clone()}}));
                checkElement.dispatchEvent(new CustomEvent('auto-check:success', {bubbles: true, detail: {response: stream.clone()}}));
            } else {
                input.setCustomValidity(validationFailed);
                checkElement.dispatchEvent(new CustomEvent('auto-check:ajax-end', {bubbles: true}));
                checkElement.dispatchEvent(new CustomEvent('auto-check:ajax-error', {bubbles: true, detail: {response: stream.clone()}}));
                checkElement.dispatchEvent(new CustomEvent('auto-check:error', {bubbles: true, detail: {response: stream.clone()}}));
            }
        })
        .catch(error => {
            checkElement.dispatchEvent(new CustomEvent('auto-check:network-error', {bubbles: true, detail: {error}}));
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
    const validationMessage = validationMessages.get(checkElement) || function () {
        const msg = checkElement.msg;
        if (!msg) return null;

        let obj: { [key: string]: string };
        try {
            const message = JSON.parse(msg);
            if (typeof message === 'object') {
                obj = Object.assign(
                    {all: ''},
                    Object
                        .entries<string>(message)
                        .reduce((prev, [key, value]) => ({...prev, [camelCase(key)]: value}), {})
                );
            } else {
                obj = {all: msg};
            }
        } catch (e) {
            obj = {all: msg};
        }
        validationMessages.set(checkElement, obj);
        return obj;
    }();

    if (!validationMessage) return null;

    const type = errorTypes.find(value => Reflect.get(validityState, value) === true) || 'all';

    return validationMessage[type] || validationMessage.all;
}

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

    static get observedAttributes(): string[] {
        return ['msg'];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (name === 'msg') {
            validationMessages.delete(this);
        }
    }

    get href(): string | null {
        const href = this.getAttribute('href');
        if (!href) return '';

        const link = (this.ownerDocument || document).createElement('a');
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
    window.HTMLAutoCheckElement = HTMLAutoCheckElement;
    window.customElements.define('auto-check', HTMLAutoCheckElement);
}

declare global {
    interface Window {
        HTMLAutoCheckElement: typeof HTMLAutoCheckElement
    }
}

export default HTMLAutoCheckElement;