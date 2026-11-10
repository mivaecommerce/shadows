/**
 * MMX / PRODUCT WAITLIST
 */
class MMX_ProductWaitlist extends MMX_Element {

	static get props() {
		return {};
	}

	styleResourceCodes = ['mmx-base', 'mmx-product-waitlist'];
	renderUniquely = true;

	#productCode = '';
	#variantId = 0;
	#outOfStock = false;
	#confirmed = false;

	#settings = {};

	constructor() {
		super();
		this.makeComponent();
	}

	// Data
	onDataChange() {
		this.#productCode = this.data?.product?.code ?? '';
		this.#variantId = MMX.coerceNumber(this.data?.product?.variant_id);
		this.#outOfStock = MMX.isTruthy(this.data?.out_of_stock);
		this.#settings = this.data?.settings ?? {};
	}

	// Public API (called by mmx-product-details on variant/pricing changes)
	setOutOfStock(outOfStock = false) {
		outOfStock = MMX.isTruthy(outOfStock);

		if (this.#outOfStock === outOfStock) {
			return;
		}

		this.#outOfStock = outOfStock;

		const wrapper = this.shadowRoot.querySelector('[part~="wrapper"]');

		if (wrapper) {
			wrapper.hidden = !outOfStock;
		}
	}

	setVariantId(variantId = 0) {
		this.#variantId = MMX.coerceNumber(variantId);
	}

	// Render
	render() {
		return /*html*/`
			<div part="wrapper" ${this.#outOfStock ? '' : 'hidden'}>
				<div part="cta-area">
					${this.#confirmed ? this.#renderConfirmation() : this.#renderCta()}
				</div>
			</div>
			${this.#renderDialog()}
		`;
	}

	afterRender() {
		this.#bindComponentEvents();
	}

	#ctaButtonText() {
		const value = this.#settings?.cta_settings?.cta_button?.value;

		return MMX.valueIsEmpty(value) ? 'Join The Waitlist' : value;
	}

	#renderCta() {
		const ctaButton = this.#settings?.cta_settings?.cta_button;
		const theme_available = ctaButton?.textsettings?.fields?.normal?.button_theme?.theme_available || false;

		return /*html*/`
			<div part="cta">
				<mmx-button
					part="cta-button"
					data-theme="${theme_available}"
					data-theme-class="${MMX.encodeEntities(ctaButton?.textsettings?.fields?.normal?.button_theme?.classname ?? '')}"
					data-width="${!theme_available ? 'full' : MMX.encodeEntities(ctaButton?.textsettings?.fields?.normal?.button_width?.value ?? 'full')}"
					data-style="${theme_available ? '' : 'secondary'}"
					data-size="${theme_available ? '' : 'm'}"
				>
					${this.renderThemeStylesheetTemplate(theme_available)}
					${MMX.encodeEntities(this.#ctaButtonText())}
				</mmx-button>
			</div>
		`;
	}

	#renderDialog() {
		return /*html*/`
			<mmx-dialog part="dialog" data-max-width="36rem">
				<div slot="header">
					${this.#renderDialogHeading()}
				</div>
				<div slot="content" part="form">
					<div part="message" role="status" aria-live="polite"></div>
					${this.#renderFormHeading()}
					${this.#renderFormFields()}
				</div>
			</mmx-dialog>
		`;
	}

	#renderDialogHeading() {
		return this.renderTextProperty(this.#settings?.dialog_heading_settings?.heading, {
			className: 'dialog-heading',
			defaultStyle: 'title-4',
			defaultTag: 'p'
		});
	}

	#renderFormHeading() {
		return this.renderTextProperty(this.#settings?.heading_settings?.heading, {
			className: 'heading',
			defaultStyle: 'body',
			defaultTag: 'p'
		});
	}

	#emailLabel() {
		return MMX.coerceString(this.#settings?.input_settings?.label?.value, {fallback: 'Email Address'});
	}

	#emailPlaceholder() {
		return this.#settings?.input_settings?.placeholder?.value ?? '';
	}

	#renderFormFields() {
		return /*html*/`
			<div part="input-group">
				<label part="input-label">${MMX.encodeEntities(this.#emailLabel())}</label>
				<input
					type="email"
					part="input input--email"
					name="Email"
					aria-label="${MMX.encodeEntities(this.#emailLabel())}"
					placeholder="${MMX.encodeEntities(this.#emailPlaceholder())}"
					required
				/>
			</div>
			${this.#renderSubmitButton()}
		`;
	}

	#renderSubmitButton() {
		const submitButtonSettings = this.#settings?.submit_button ?? {};
		const submitButtonText = MMX.valueIsEmpty(submitButtonSettings?.value) ? 'Notify Me' : submitButtonSettings.value;
		const theme_available = submitButtonSettings?.textsettings?.fields?.normal?.button_theme?.theme_available || false;

		return /*html*/`
			<mmx-button
				part="submit"
				data-type="button"
				data-theme="${theme_available}"
				data-theme-class="${MMX.encodeEntities(submitButtonSettings?.textsettings?.fields?.normal?.button_theme?.classname ?? '')}"
				data-style="${theme_available ? '' : 'primary'}"
				data-width="${theme_available ? MMX.encodeEntities(submitButtonSettings?.textsettings?.fields?.normal?.button_width?.value ?? 'full') : 'full'}"
			>
				${this.renderThemeStylesheetTemplate(theme_available)}
				${MMX.encodeEntities(submitButtonText)}
			</mmx-button>
		`;
	}

	#renderConfirmation() {
		const text = MMX.coerceString(this.#settings?.messages?.success_message?.value, {fallback: "We'll email you when it's back."});

		return this.renderBadgeMessage({
			badgeTheme: this.#settings?.messages?.success_message?.textsettings?.fields?.normal?.badge_theme,
			style: 'success',
			content: /*html*/`
				<mmx-icon data-name="check"></mmx-icon>
				${MMX.encodeEntities(text)}
			`,
			attributes: {
				part: 'confirmation',
				'data-align': 'left',
				'data-dismissible': true
			}
		});
	}

	// Listeners
	#bindComponentEvents() {
		this.on('click', '[part~="cta-button"]', () => this.#openDialog());
		this.on('dismiss', '[part~="confirmation"]', () => this.#onConfirmationDismissClick());
		this.on('click', '[part~="submit"]', (e) => this.#onFormSubmit(e));
	}

	#dialog() {
		return this.shadowRoot.querySelector('mmx-dialog[part~="dialog"]');
	}

	#openDialog() {
		const dialog = this.#dialog();
		dialog?.showModal?.();
		dialog?.addEventListener('close', () => this.#setMessage(''), { once: true });
	}

	#onConfirmationDismissClick() {
		this.#confirmed = false;
		this.forceUpdate();
	}

	// Form Submit / AJAX
	#onFormSubmit(e) {
		e?.preventDefault?.();

		const emailInput = this.shadowRoot.querySelector('input[name="Email"]');
		const submitButton = this.shadowRoot.querySelector('[part~="submit"]');

		if (submitButton?.disabled || !emailInput?.reportValidity?.()) {
			return;
		}

		this.#setMessage('');
		submitButton.disabled = true;

		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'TGWaitlist',
				Module_Function: 'Waitlist_API',
				WaitlistFunction: 'WAITLIST_ADD',
				Email: emailInput.value,
				Product_Code: this.#productCode,
				Variant_ID: this.#variantId
			}
		})
		.then(() => this.#formSubmitted())
		.catch(response => this.#formSubmitError({response, submitButton}));
	}

	#formSubmitted() {
		this.#dialog()?.close?.();
		this.#confirmed = true;
		this.forceUpdate();
	}

	#formSubmitError({response, submitButton} = {}) {
		const fallback = MMX.coerceString(this.#settings?.messages?.error_message?.value, {fallback: 'An error has occurred.'});

		this.#setMessage(response?.error_message ?? fallback, 'error');
		submitButton.disabled = false;
	}

	#setMessage(text = '', style = '') {
		const messageElement = this.shadowRoot.querySelector('[part~="message"]');

		if (!messageElement) {
			return;
		}

		if (MMX.valueIsEmpty(text)) {
			messageElement.innerHTML = '';
			return;
		}

		messageElement.innerHTML = this.renderBadgeMessage({
			badgeTheme: style === 'error' ? this.#settings?.messages?.error_message?.textsettings?.fields?.normal?.badge_theme : {},
			style,
			content: MMX.encodeEntities(text)
		});
	}
}

if (!customElements.get('mmx-product-waitlist')) {
	customElements.define('mmx-product-waitlist', MMX_ProductWaitlist);
}