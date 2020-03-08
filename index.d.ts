export default class HTMLAutoCheckElement extends HTMLElement {
    readonly input: HTMLInputElement | null;
    href: string | null;
    msg: string | null;
}

declare global {
    interface Window {
        HTMLAutoCheckElement: typeof HTMLAutoCheckElement;
    }
}
