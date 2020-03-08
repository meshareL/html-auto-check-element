'use strict';

describe('html-auto-check-element', () => {
    describe('create element', () => {
        it('from document.createElement', () => {
            const element = document.createElement('auto-check');
            assert.equal(element.nodeName, 'AUTO-CHECK');
        });

        it('from constructor', () => {
            const element = new window.HTMlAutoCheckElement();
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
            document.addEventListener('auto-check:ajax-end', () => events.push('ajax-end'), {once: true});
            document.addEventListener('auto-check:ajax-success', () => events.push('ajax-success'), {once: true});
            document.addEventListener('auto-check:success', () => events.push('success'), {once: true});

            const all =  Promise.all([
                new Promise(resolve => document.addEventListener('auto-check:native-success', resolve, {once: true})),
                new Promise(resolve => document.addEventListener('auto-check:ajax-start', resolve, {once: true})),
                new Promise(resolve => document.addEventListener('auto-check:ajax-end', resolve, {once: true})),
                new Promise(resolve => document.addEventListener('auto-check:ajax-success', resolve, {once: true})),
                new Promise(resolve => document.addEventListener('auto-check:success', resolve, {once: true}))
            ]);

            input.dispatchEvent(new InputEvent('input', {bubbles: true}));

            await all;
            assert.deepEqual(['native-success', 'ajax-start', 'ajax-end', 'ajax-success', 'success'], events);
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
            document.addEventListener('auto-check:error', /** @type {CustomEvent<{message: string}>} */event => {
                assert.equal(event.detail.message, 'type mismatch');
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
            document.addEventListener('auto-check:ajax-error', /** @type {CustomEvent<{message: string}>} */event => {
                assert.equal(event.detail.message, 'error');
                done();
            }, {once: true});
            element.href = '/fail';
            input.value = 'validation@email.com';
            input.dispatchEvent(new InputEvent('input', {bubbles: true}));
        });
    });
});
