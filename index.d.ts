/**
 * Input element local and remote validation
 *
 * @example
 * <auto-check href="/validate" msg='{"type_mismatch": "type mismatch"}'>
 *     <label for="email">Email</label>
 *     <input id="email" name="email" required type="email"/>
 * </auto-check>
 */
declare class HTMLAutoCheckElement extends HTMLElement {
    readonly input: HTMLInputElement | null;
    /**
     * Absolute or relative urls
     */
    href: string | null;
    /**
     * Invalid message
     *
     * @example
     * '{"typeMismatch": "type mismatch"}'
     * '{"type-mismatch": "type mismatch"}'
     * '{"type_mismatch": "type mismatch"}'
     *
     * @see InvalidMessage
     */
    msg: string | null;
}

/**
 * 元素值无效的提示信息
 * @see <a href="https://developer.mozilla.org/en-US/docs/Web/API/ValidityState">ValidityState</a>
 */
interface InvalidMessage {
    /** 如果元素的值出现语法错误 */
    typeMismatch?: string;
    /** 如果用户提供了浏览器无法转换的输入 */
    badInput?: string;
    /** 如果元素设置了 required 属性且值为空 */
    valueMissing?: string;
    /** 如果元素的值小于所设置的最小长度 */
    tooShort?: string;
    /** 如果元素的值超过所设置的最大长度 */
    tooLong?: string;
    /** 如果元素的值低于所设置的最小值 */
    rangeUnderflow?: string;
    /** 如果元素的值高于所设置的最大值 */
    rangeOverflow?: string;
    /** 如果元素的值不符合 step 属性的规则 */
    stepMismatch?: string;
    /** 如果元素的值不匹配所设置的正则表达式 */
    patternMismatch?: string;
    /** 如果未匹配上述所有错误 */
    all?: string;
}

declare type AutoCheckSuccessEvent = CustomEvent<{ response?: Response }>;
declare type AutoCheckErrorEvent = CustomEvent<{ response: string | Response }>;
declare type AutoCheckAjaxSendEvent = CustomEvent<{ requestInit: RequestInit }>;
declare type AutoCheckAjaxSuccessEvent = CustomEvent<{ response: Response }>;
declare type AutoCheckAjaxErrorEvent = CustomEvent<{ response: Response }>;
declare type AutoCheckNetworkErrorEvent = CustomEvent<{ error: any }>;

declare global {
    interface Window {
        HTMLAutoCheckElement: typeof HTMLAutoCheckElement;
    }

    interface HTMLElementTagNameMap {
        'auto-check': HTMLAutoCheckElement;
    }

    interface GlobalEventHandlersEventMap {
        'auto-check:success': AutoCheckSuccessEvent;
        'auto-check:error': AutoCheckErrorEvent;
        'auto-check:ajax-start': CustomEvent<void>;
        'auto-check:ajax-send': AutoCheckAjaxSendEvent;
        'auto-check:ajax-end': CustomEvent<void>;
        'auto-check:ajax-success': AutoCheckAjaxSuccessEvent;
        'auto-check:ajax-error': AutoCheckAjaxErrorEvent;
        'auto-check:network-error': AutoCheckNetworkErrorEvent;
    }
}

export default HTMLAutoCheckElement;
export {
    InvalidMessage,
    AutoCheckSuccessEvent,
    AutoCheckErrorEvent,
    AutoCheckAjaxSendEvent,
    AutoCheckAjaxSuccessEvent,
    AutoCheckAjaxErrorEvent,
    AutoCheckNetworkErrorEvent
};
