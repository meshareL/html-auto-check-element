'use strict';

describe('html-auto-check-element', () => {
    describe('create element', () => {
        it('from document.createElement', () => {
            const element = document.createElement('auto-check');
            assert.equal(element.nodeName, 'AUTO-CHECK');
        });

        it('from constructor', () => {
            const element = new window.HTMLAutoCheckElement();
            assert.equal(element.nodeName, 'AUTO-CHECK');
        });
    });

    describe('event', () => {
        /** @type {HTMLAutoCheckElement} */
        let element;
        /** @type {HTMLInputElement} */
        let input;
        beforeEach(() => {
            const el = document.createElement('auto-check');
            el.href = '/success';
            el.msg = JSON.stringify({typeMismatch: 'type mismatch', valueMissing: 'value missing'});
            el.innerHTML = `<input name="email" value="validation@email.com" required type="email"/>`;
            document.body.append(el.cloneNode(true));

            element = document.querySelector('auto-check');
            input = document.querySelector('input');
        });
        afterEach(() => {
            element = null;
            input = null;
            document.body.innerHTML = '';
        });
        it('event order', async () => {
            const events = [];
            document.addEventListener('auto-check:native-success', () => events.push('native-success'), {once: true});
            document.addEventListener('auto-check:ajax-start', () => events.push('ajax-start'), {once: true});
            document.addEventListener('auto-check:ajax-send', () => events.push('ajax-send'), {once: true});
            document.addEventListener('auto-check:ajax-end', () => events.push('ajax-end'), {once: true});
            document.addEventListener('auto-check:ajax-success', () => events.push('ajax-success'), {once: true});
            document.addEventListener('auto-check:success', () => events.push('success'), {once: true});

            const all =  Promise.all([
                new Promise(resolve => document.addEventListener('auto-check:native-success', resolve, {once: true})),
                new Promise(resolve => document.addEventListener('auto-check:ajax-start', resolve, {once: true})),
                new Promise(resolve => document.addEventListener('auto-check:ajax-send', resolve, {once: true})),
                new Promise(resolve => document.addEventListener('auto-check:ajax-end', resolve, {once: true})),
                new Promise(resolve => document.addEventListener('auto-check:ajax-success', resolve, {once: true})),
                new Promise(resolve => document.addEventListener('auto-check:success', resolve, {once: true}))
            ]);

            input.dispatchEvent(new InputEvent('input', {bubbles: true}));

            await all;
            assert.deepEqual(['native-success', 'ajax-start', 'ajax-send', 'ajax-end', 'ajax-success', 'success'], events);
        });
    });

    describe('validate', () => {
        /** @type {HTMLAutoCheckElement} */
        let element;
        /** @type {HTMLInputElement} */
        let input;
        beforeEach(() => {
            const el = document.createElement('auto-check');
            el.href = '/success';
            el.msg = JSON.stringify({typeMismatch: 'type mismatch', valueMissing: 'value missing'});
            el.innerHTML = `<input name="email" required type="email"/>`;
            document.body.append(el.cloneNode(true));

            element = document.querySelector('auto-check');
            input = document.querySelector('input');
        });
        afterEach(() => {
            element = null;
            input = null;
            document.body.innerHTML = '';
        });

        it('local validate error', done => {
            document.addEventListener('auto-check:error', /** @type {CustomEvent<{response: string}>} */event => {
                assert.equal(event.detail.response, 'type mismatch');
                done();
            }, {once: true});
            input.value = 'email';
            input.dispatchEvent(new InputEvent('input', {bubbles: true}));
        });

        it('local validate success ', done => {
            document.addEventListener('auto-check:native-success', () => done(), {once: true});
            input.value = 'validation@email.com';
            input.dispatchEvent(new InputEvent('input', {bubbles: true}));
        });

        it('remote validate response ok', done => {
            document.addEventListener('auto-check:ajax-success', () => done(), {once: true});
            input.value = 'validation@email.com';
            input.dispatchEvent(new InputEvent('input', {bubbles: true}));
        });

        it('remote validate response error', done => {
            document.addEventListener('auto-check:ajax-error', async event => {
                const json = await event.detail.response.json();
                assert.equal(json.message, 'error');
                done();
            }, {once: true});
            element.href = '/fail';
            input.value = 'validation@email.com';
            input.dispatchEvent(new InputEvent('input', {bubbles: true}));
        });
    });

    describe('validation message', () => {
        /** @type {HTMLAutoCheckElement} */
        let element;
        /** @type {HTMLInputElement} */
        let input;
        beforeEach(() => {
            const el = document.createElement('auto-check');
            el.innerHTML = `<input name="username" required pattern="^[a-z]{1,5}$" type="text"/>`;
            document.body.append(el.cloneNode(true));

            element = document.querySelector('auto-check');
            input = element.input;
        });
        afterEach(() => {
            element = null;
            input = null;
            document.body.innerHTML = '';
        });

        it('when the msg attribute cannot be parsed to json, it is used as a fallback error message', done => {
            const message = 'validation failed';
            element.msg = message;

            document.addEventListener('auto-check:error', event => {
                assert.equal(event.detail.response, message);
                done();
            }, {once: true});

            input.value = 'validation';
            input.dispatchEvent(new InputEvent('input', {bubbles: true}));
        });

        describe('support multiple writing styles', () => {
            it('kebab-case', done => {
                const message = {'value-missing':  'value missing', 'pattern-mismatch': 'pattern mismatch'};
                element.msg = JSON.stringify(message);
                document.addEventListener('auto-check:error', event => {
                    assert.equal(event.detail.response, 'pattern mismatch');
                    done();
                }, {once: true});

                input.value = 'validation';
                input.dispatchEvent(new InputEvent('input', {bubbles: true}));
            });

            it('snake_case', done => {
                const message = {'value_missing':  'value missing', 'pattern_mismatch': 'pattern mismatch'};
                element.msg = JSON.stringify(message);

                document.addEventListener('auto-check:error', event => {
                    assert.equal(event.detail.response, 'value missing');
                    done();
                }, {once: true});

                input.value = '';
                input.dispatchEvent(new InputEvent('input', {bubbles: true}));
            });
        });
    });
});
