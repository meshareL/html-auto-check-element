'use strict';

export default class XHRError extends Error {
    response: Response;
    /**
     * xhrError constructor
     * @param response fetch response
     */
    constructor(response: Response) {
        super();
        this.response = response;
    }
}