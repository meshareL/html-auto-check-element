(function() {
	const native = window.fetch;
		const faked = function (url, options) {
			url = decodeURIComponent(url);
			const path = `https://httpbin.org/status/${url.includes('validate@email.com') ? '422' : '200'}`;
			return native(path, options);
		};
		window.fetch = faked;

		function autoCheckEvent(event) {
			const checkElement = event.target;
			if (!(checkElement instanceof window.HTMlAutoCheckElement)) return;

			const state = checkElement.querySelector('.state');
			if (!(state instanceof HTMLElement)) return;

			switch (event.type) {
				case 'auto-check:success':
					checkElement.classList.remove('is-loading', 'is-errored');
					checkElement.classList.add('is-successful');
					state.classList.add('text-green');
					state.classList.remove('text-red');
					state.textContent = 'successful';
					break;
				case 'auto-check:error':
					checkElement.classList.remove('is-loading', 'is-successful');
					checkElement.classList.add('is-errored');
					state.classList.add('text-red');
					state.classList.remove('text-green');
					state.textContent = event.detail.message;
					break;
				case 'auto-check:ajax-start':
					checkElement.classList.remove('is-successful', 'is-errored');
					checkElement.classList.add('is-loading');
					state.classList.remove('text-green', 'text-red');
					state.textContent = 'server endpoint start';
					break;
				default:
					return;
			}
		}
		document.addEventListener('auto-check:success', autoCheckEvent);
		document.addEventListener('auto-check:error', autoCheckEvent);
		document.addEventListener('auto-check:ajax-start', autoCheckEvent);
}());