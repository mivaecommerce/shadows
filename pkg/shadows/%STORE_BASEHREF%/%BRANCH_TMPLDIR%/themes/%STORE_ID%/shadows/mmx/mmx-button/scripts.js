/**
 * MMX / BUTTON
 */

class MMX_Button extends MMX_Element {

	static get props() {
		return {
			style: {
				options: ['primary', 'secondary', 'display-link', 'primary-link', 'secondary-link', 'dark-primary', 'dark-secondary', 'dark-display-link', 'dark-primary-link', 'dark-secondary-link'],
				default: 'primary'
			},
			size: {
				options: ['xs', 's', 'm', 'l'],
				default: 'm'
			},
			width: {
				options: ['auto', 'full'],
				default: 'auto'
			},
			type: {
				options: ['submit', 'reset', 'button', 'link'],
				default: '' // Default can be either `button` or `link` and is determined in getType()
			}
		};
	}

	themeResourcePattern = /mmx-(base|button)\/styles.css|family=Inter/i;
	hideOnEmpty = true;

	constructor() {
		super();
		this.makeShadow();
	}

	render() {
		const tag = this.getTag();

		return /*html*/`
			<${tag} class="mmx-button ${this.getStyleClass()} mmx-button__size--${this.getPropValue('size')} mmx-button__width--${this.getPropValue('width')} ${this.darkClass()}" ${this.inheritAttrs()} part="button">
				<slot></slot>
			</${tag}>
		`;
	}

	afterRender() {
		var type, button, listener;

		if (!(button = this.getButton())) {
			return;
		}

		for (type in this.#listeners) {
			if (!this.#listeners.hasOwnProperty(type)) {
				continue;
			}

			for (listener of this.#listeners[type]) {
				button.addEventListener(type, listener.listener, listener.options);
			}
		}

		switch (this.getType()) {
			case 'submit'	: button.addEventListener('click', MMX_Button.eventSubmitClick, false);	break;
			case 'reset'	: button.addEventListener('click', MMX_Button.eventResetClick, false);	break;
		}
	}

	static eventSubmitClick(e) {
		const form = MMX.closestElement('form', this);

		if (form) {
			form.addEventListener('submit', MMX_Button.eventSubmitClickForm, false);
			form.dispatchEvent(new Event('submit', { cancelable: true }));
		}
	}

	static eventSubmitClickForm(e) {
		if (!e.defaultPrevented) {
			this.submit();
		}

		this.removeEventListener('submit', MMX_Button.eventSubmitClickForm, false);
	}

	static eventResetClick(e) {
		const form = MMX.closestElement('form', this);

		if (form) {
			form.addEventListener('reset', MMX_Button.eventResetClickForm, false);
			form.dispatchEvent(new Event('reset'));
		}
	}

	static eventResetClickForm(e) {
		if (!e.defaultPrevented) {
			this.reset();
		}

		this.removeEventListener('reset', MMX_Button.eventResetClickForm, false);
	}

	getStyleClass() {
		const style = this.getPropValue('style');
		let result = `mmx-button__${style}`;
		if ( style.indexOf('link') > -1 ) {
			result += '  mmx-button__link';
		} else {
			result += '  mmx-button__button';
		}

		return result;
	}

	getButton() {
		return this.shadowRoot.querySelector('.mmx-button');
	}

	getTag() {
		return this.hasAttribute('href') ? 'a' : 'button';
	}

	getType() {
		switch (this.getPropValue('type')) {
			case 'submit'	: return 'submit';
			case 'reset'	: return 'reset';
			case 'button'	: return 'button';
			case 'link'		: return 'link';
			default: {
				if (this.hasAttribute('href')) {
					return 'link';
				}

				return 'button';
			}
		}
	}

	darkClass() {
		return this.isDark() ? 'mmx-theme--dark' : '';
	}

	isDark() {
		return this.hasAttribute('data-dark') || this.getPropValue('style').indexOf('dark') === 0;
	}

	//
	// Attributes
	//

	static get observedAttributes() {
		return ['disabled', ...MMX_Element.observedAttributes];
	}

	attributeChanged(name, oldValue, newValue) {
		var button;

		if (name === 'disabled') {
			if (button = this.getButton()) {
				if (MMX.getBooleanAttribute(this, 'disabled')) {
					this.classList.add('disabled');
					button.disabled = true;
				}
				else {
					this.classList.remove('disabled');
					button.disabled = false;
				}
			}
		}
	}

	get disabled()			{ return MMX.getBooleanAttribute(this, 'disabled'); }
	set disabled(disabled)	{ MMX.setBooleanAttribute(this, 'disabled', disabled); }

	//
	// Listeners
	//

	#listeners = new Object();

	addButtonEventListener(type, listener, options) {
		var button;

		if (!Array.isArray(this.#listeners[type])) {
			this.#listeners[type] = new Array();
		}

		if (this.#listeners[type].find(search_listener => search_listener.listener === listener && JSON.stringify(search_listener.options) === JSON.stringify(options))) {
			return;
		}

		this.#listeners[type].push({listener: listener, options: options});

		if (button = this.getButton()) {
			button.addEventListener(type, listener, options);
		}
	}

	removeButtonEventListener(type, listener, options) {
		var index, button;

		if (!Array.isArray(this.#listeners[type])) {
			return;
		}

		if ((index = this.#listeners[type].findIndex(search_listener => search_listener.listener === listener && JSON.stringify(search_listener.options) === JSON.stringify(options))) === -1) {
			return;
		}

		this.#listeners[type].splice(index, 1);

		if (button = this.getButton()) {
			button.removeEventListener(type, listener, options);
		}
	}
}

if (!customElements.get('mmx-button')){
	customElements.define('mmx-button', MMX_Button);
}
