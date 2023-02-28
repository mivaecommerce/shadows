(function () {
	'use strict';

	const contactForm = document.querySelector('[data-hook="contact-form"]');

	if (contactForm) {
		let contactFormAction = contactForm.getAttribute('data-action');
		let contactFormButton = document.querySelector('[data-hook="contact-form__submit"]');
		let requiredLabels = contactForm.querySelectorAll('label.is-required');
		let enableForm = function enableForm() {
			if (contactForm.action === document.location.href) {
				contactForm.setAttribute('action', contactFormAction);
				contactFormButton.removeAttribute('disabled');
				Array.prototype.forEach.call(requiredLabels, function (label) {
					let span = document.createElement('span');

					span.setAttribute('aria-hidden', 'true');
					span.innerText = ' *';
					label.append(span);
				});
			}
		};

		contactForm.classList.remove('u-hidden');

		/**
		 * Unlock the form if the user is utilizing a touch interface, keyboard navigation, or can hover over elements.
		 */
		['touchstart', 'keydown', 'mouseover'].forEach(function (type) {
			window.addEventListener(type, function powerUp(event) {
				enableForm();
				window.removeEventListener(type, powerUp, false);
			}, false);
		});
	}
})();
