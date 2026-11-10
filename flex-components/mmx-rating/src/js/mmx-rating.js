/**
 * MMX / Rating
 */

class MMX_Rating extends MMX_Element {

	static get props() {
		return {
			rating: {
				allowAny: true,
				isNumeric: true,
				default: 0
			},
			count: {
				allowAny: true,
				isNumeric: true,
				default: 0
			},
			'max-rating': {
				allowAny: true,
				default: 5,
				isNumeric: true
			},
			'icon-set': {
				options: [
					'star',
					'heart'
				],
				default: 'star'
			},
			'active-color': {
				allowAny: true
			},
			'inactive-color': {
				allowAny: true
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-rating'];
	renderUniquely = true;

	constructor() {
		super();
		this.makeComponent();
	}

	render() {
		return /*html*/ `
			<span
				part="wrapper"
				class="mmx-rating"
				title="${MMX.encodeEntities(this.#getReviewRatingTitle())}"
			>
				${this.#renderIconsOverlay()}
				${this.#renderCount()}
			</span>
		`;
	}

	styles() {
		const activeColor = this.getPropValue('active-color');
		const inactiveColor = this.getPropValue('inactive-color');

		return /*css*/ `
			:host {
				${activeColor ? `--mmx-rating__active-color: ${MMX.encodeEntities(activeColor)};` : ''}
				${inactiveColor ? `--mmx-rating__inactive-color: ${MMX.encodeEntities(inactiveColor)};` : ''}
				--mmx-rating__active-percent: ${MMX.encodeEntities(this.#getActiveWidth())};
			}

			[part~="row-active"] {
				width: var(--mmx-rating__active-percent);
			}
		`;
	}

	#getReviewRatingTitle() {
		if (!this.#hasRating()) {
			return 'This product has not been rated';
		}

		const maxRating = this.getPropValue('max-rating');
		const ratingText = this.#getDisplayRatingText();
		const count = this.getPropValue('count');

		let title = `This product has a ${ratingText}/${maxRating} rating`;

		if (count > 0) {
			return `${title} with ${count} ${MMX.pluralize('review', count)}`;
		}

		return title;
	}

	#getDisplayRatingText() {
		const maxRating = this.getPropValue('max-rating');
		let rating = this.getPropValue('rating');

		if (rating > maxRating) {
			rating = maxRating;
		}

		return rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
	}

	#hasRating() {
		return this.getPropValue('rating') > 0;
	}

	#renderCount() {
		const count = this.getPropValue('count');

		if (count <= 0) {
			return '';
		}

		return /*html*/ `<span part="count">(${MMX.encodeEntities(count)})</span>`;
	}

	#getActiveWidth() {
		const rating = this.getPropValue('rating');
		const maxRating = this.getPropValue('max-rating');

		if (rating <= 0 || maxRating <= 0) {
			return 0;
		}

		const percent = (rating / maxRating) * 100;

		return `${Math.max(0, Math.min(100, percent))}%`;
	}

	#renderIconsOverlay() {
		const icon = this.getPropValue('icon-set');
		const fullIcon = `${icon}-full`;
		const emptyIcon = `${icon}-empty`;

		return /*html*/ `
			<span part="track">
				<span part="row row-inactive">
					<mmx-icon part="icon icon-inactive">${emptyIcon}</mmx-icon>
					<mmx-icon part="icon icon-inactive">${emptyIcon}</mmx-icon>
					<mmx-icon part="icon icon-inactive">${emptyIcon}</mmx-icon>
					<mmx-icon part="icon icon-inactive">${emptyIcon}</mmx-icon>
					<mmx-icon part="icon icon-inactive">${emptyIcon}</mmx-icon>
				</span>

				<span part="row row-active">
					<mmx-icon part="icon icon-active">${fullIcon}</mmx-icon>
					<mmx-icon part="icon icon-active">${fullIcon}</mmx-icon>
					<mmx-icon part="icon icon-active">${fullIcon}</mmx-icon>
					<mmx-icon part="icon icon-active">${fullIcon}</mmx-icon>
					<mmx-icon part="icon icon-active">${fullIcon}</mmx-icon>
				</span>
			</span>
		`;
	}
}

if (!customElements.get('mmx-rating')) {
	customElements.define('mmx-rating', MMX_Rating);
}

/**
 * MMX / Rating Input
 */

class MMX_RatingInput extends MMX_Rating {

	static formAssociated = true;

	static get props() {
		return {
			...super.props,
			name: {
				allowAny: true,
				default: ''
			}
		};
	}

	#value = 0;

	constructor() {
		super();
		this.#value = MMX.coerceNumber(this.getPropValue('rating'));
		this.#bindComponentEvents();
		this.#setFormValue();
	}

	afterRender() {
		// Re-assert validity once the stars exist so the anchor is focusable
		this.#setValidity();
	}

	#bindComponentEvents() {
		this.on('change', '.mmx-rating__star-input', (e, input) => this.#onStarInputChange(input));
	}

	// Render
	render() {
		const maxRating = MMX.coerceNumber(this.getPropValue('max-rating'), 5);
		const icon = `${this.getPropValue('icon-set')}-full`;
		let stars = '';

		for (let rating = 1; rating <= maxRating; rating++) {
			stars += /*html*/`
				<label part="star" class="mmx-rating__star">
					<input
						part="star-input"
						class="mmx-rating__star-input"
						type="radio"
						name="rating"
						value="${rating}"
						aria-label="${rating} of ${maxRating} ${MMX.pluralize('star', maxRating)}"
						${this.#value === rating ? 'checked' : ''}
					/>
					<mmx-icon part="icon" class="mmx-rating__star-icon">${icon}</mmx-icon>
				</label>
			`;
		}

		return /*html*/`
			<span part="wrapper" class="mmx-rating mmx-rating--input" role="radiogroup" aria-label="Rating">
				${stars}
			</span>
		`;
	}

	// Public Values
	get value() {
		return this.#value;
	}

	set value(value) {
		this.#value = MMX.coerceNumber(value);
		this.#setFormValue();
		this.forceUpdate();
	}

	get name() {
		return this.getPropValue('name');
	}

	get required() {
		return this.hasAttribute('required');
	}

	formResetCallback() {
		this.value = 0;
	}

	#onStarInputChange(input) {
		this.#value = MMX.coerceNumber(input?.value);
		this.#setFormValue();
		this.#dispatchChangeEvent();
	}

	#dispatchChangeEvent() {
		this.dispatchEvent(new Event('change', {
			bubbles: true
		}));
	}

	#setFormValue() {
		this.#setValidity();

		if (this.#value <= 0) {
			this.setFormValue(null);
			return;
		}

		const formData = new FormData();
		formData.append(this.name, this.#value);
		this.setFormValue(formData);
	}

	#setValidity() {
		if (this.required && this.#value <= 0) {
			this.setValidity({valueMissing: true}, 'Please select a rating.', this.shadowRoot?.querySelector('.mmx-rating__star-input') ?? undefined);
			return;
		}

		this.setValidity({}, '');
	}
}

if (!customElements.get('mmx-rating-input')) {
	customElements.define('mmx-rating-input', MMX_RatingInput);
}

/**
 * MMX / Rating Form
 */

class MMX_RatingForm extends MMX_Element {

	static get props() {
		return {};
	}

	static #recaptchaLoader;

	styleResourceCodes = ['mmx-base', 'mmx-forms', 'mmx-rating', 'mm-theme-styles'];
	renderUniquely = true;

	#product = {};
	#moduleSettings = {};
	#flexSettings = {};
	#recaptchaWidgetId = null;

	constructor() {
		super();
		this.makeComponent();
		this.#bindComponentEvents();
	}

	afterRender() {
		new MMX_FormValidator({root: this.shadowRoot});
	}

	// Data
	onDataChange() {
		this.#product = this.data?.product ?? {};
		this.#moduleSettings = this.data?.moduleSettings ?? {};
		this.#flexSettings = this.data?.flexSettings ?? {};
	}

	#additionalFields() {
		return Array.isArray(this.#moduleSettings?.additional_fields) ? this.#moduleSettings.additional_fields : [];
	}

	#recaptchaEnabled() {
		return MMX.isTruthy(this.#moduleSettings?.recaptcha?.enabled) && !MMX.valueIsEmpty(this.#moduleSettings?.recaptcha?.public_key);
	}

	// Render
	render() {
		return /*html*/`
			<div part="wrapper" class="mmx-rating-form">
				${this.#renderCta()}
				${this.#renderDialog()}
			</div>
		`;
	}

	#renderCta() {
		const ctaButton = this.#flexSettings?.cta_settings?.cta_button;
		const theme_available = ctaButton?.textsettings?.fields?.normal?.button_theme?.theme_available || false;
		const text = MMX.coerceString(ctaButton?.value, {fallback: 'Write a Review'});
		const align = MMX.coerceString(this.#flexSettings?.cta_settings?.align?.value, {fallback: 'center'});
		const justify = {left: 'flex-start', center: 'center', right: 'flex-end'}[align] ?? 'center';

		return /*html*/`
			<div part="cta" class="mmx-rating-form__cta" style="justify-content: ${MMX.encodeEntities(justify)};">
				<mmx-button
					part="cta-button"
					data-theme="${theme_available}"
					data-theme-class="${MMX.encodeEntities(ctaButton?.textsettings?.fields?.normal?.button_theme?.classname ?? '')}"
					data-style="${theme_available ? '' : 'display-link'}"
					data-size="${theme_available ? '' : 'm'}"
				>
					${this.renderThemeStylesheetTemplate(theme_available)}
					${MMX.encodeEntities(text)}
				</mmx-button>
			</div>
		`;
	}

	#renderDialog() {
		return /*html*/`
			<mmx-dialog part="dialog" data-max-width="48rem">
				<div slot="header">
					${this.#renderDialogHeading()}
				</div>
				<div slot="content" part="form-area" class="mmx-rating-form__form-area${this.typographyThemeClass(this.#flexSettings?.form_text_typography)}">
					<div part="message" role="status" aria-live="polite"></div>
					${this.#renderForm()}
				</div>
			</mmx-dialog>
		`;
	}

	#renderDialogHeading() {
		const heading = {...(this.#flexSettings?.dialog_heading_settings?.heading ?? {})};
		heading.value = MMX.coerceString(heading.value, {fallback: 'Write a Review'});

		return this.renderTextProperty(heading, {
			className: 'dialog-heading',
			defaultStyle: 'title-4',
			defaultTag: 'p'
		});
	}

	#renderConfirmation() {
		const text = MMX.coerceString(this.#flexSettings?.messages?.success_message?.value, {fallback: "Thank you! Your review has been submitted and will be posted once it's approved."});

		return this.renderBadgeMessage({
			badgeTheme: this.#flexSettings?.messages?.success_message?.textsettings?.fields?.normal?.badge_theme,
			style: 'success',
			attributes: {
				part: 'confirmation'
			},
			content: /*html*/`
				<mmx-icon data-name="check"></mmx-icon>
				${MMX.encodeEntities(text)}
			`
		});
	}

	#renderForm() {
		return /*html*/`
			<form part="form" class="mmx-form-fields" data-mmx-form-validator novalidate>
				${this.#renderRatingField()}
				${this.#renderField({
					name: 'TGR_Name',
					label: 'Name',
					autocomplete: 'name',
					...this.#getFieldSettings('name')
				})}
				${this.#renderField({
					name: 'TGR_Email',
					label: 'Email',
					type: 'email',
					autocomplete: 'email',
					...this.#getFieldSettings('email')
				})}
				${this.#renderNotifyField()}
				${this.#renderField({
					name: 'TGR_Location',
					label: 'Location',
					...this.#getFieldSettings('loc')
				})}
				${this.#renderField({
					name: 'TGR_Title',
					label: 'Title',
					...this.#getFieldSettings('title')
				})}
				${this.#renderField({
					name: 'TGR_Summary',
					label: 'Summary',
					textarea: true,
					...this.#getFieldSettings('summry')
				})}
				${this.#renderAdditionalFields()}
				<slot name="review-form-fragment"></slot>
				${this.#renderRecaptchaField()}
				<div class="mmx-form-footer" part="footer">
					<!-- Native submit enables Enter-to-submit; the visible mmx-button is not form-associated -->
					<button type="submit" hidden></button>
					${this.#renderSubmitButton()}
				</div>
			</form>
		`;
	}

	#getFieldSettings(name = '') {
		const setting = this.#moduleSettings?.settings?.[`fld_${name}`] ?? 'O';

		return {
			hidden: setting === 'H',
			required: setting === 'R'
		};
	}

	#renderRatingField() {
		return /*html*/`
			<div class="mmx-form-field" part="field field--rating">
				<span class="mmx-form-label mmx-form-label--required">Your Rating</span>
				<mmx-rating-input
					part="rating"
					class="mmx-rating-form__rating"
					data-name="TGR_Rating"
					data-icon-set="${MMX.encodeEntities(MMX.coerceString(this.#flexSettings?.icon?.value, {fallback: 'star'}))}"
					data-active-color="${MMX.encodeEntities(this.#flexSettings?.active_color?.value ?? '')}"
					data-inactive-color="${MMX.encodeEntities(this.#flexSettings?.inactive_color?.value ?? '')}"
					required
				></mmx-rating-input>
			</div>
		`;
	}

	#renderField({name, label, type = 'text', required = false, hidden = false, autocomplete = '', textarea = false} = {}) {
		if (hidden) {
			return '';
		}

		const id = name;
		const attributes = `
			class="${textarea ? 'mmx-form-textarea' : 'mmx-form-input'} mmx-form-control"
			name="${MMX.encodeEntities(name)}"
			id="${MMX.encodeEntities(id)}"
			${MMX.valueIsEmpty(autocomplete) ? '' : `autocomplete="${MMX.encodeEntities(autocomplete)}"`}
			${required ? 'required' : ''}
		`;

		return /*html*/`
			<div class="mmx-form-field" part="field">
				<label class="mmx-form-label${required ? ' mmx-form-label--required' : ''}" for="${MMX.encodeEntities(id)}">
					${MMX.encodeEntities(label)}
				</label>
				${textarea ?
					/*html*/`<textarea ${attributes}></textarea>` :
					/*html*/`<input type="${MMX.encodeEntities(type)}" ${attributes} />`
				}
			</div>
		`;
	}

	#renderAdditionalFields() {
		return this.#additionalFields().reduce((content, field) => {
			if (MMX.valueIsEmpty(field?.code)) {
				return content;
			}

			return content + this.#renderField({
				name: `TGR_AdditionalFields:${field.code}`,
				label: field?.name ?? field.code
			});
		}, '');
	}

	#renderNotifyField() {
		if (!MMX.isTruthy(this.#flexSettings?.show_notify?.value) || this.#getFieldSettings('email').hidden) {
			return '';
		}

		return /*html*/`
			<div class="mmx-form-field" part="field field--notify">
				<label class="mmx-form-checkbox">
					<input class="mmx-form-checkbox__input" type="checkbox" name="TGR_Notify" value="1" />
					<span class="mmx-form-checkbox__caption">Notify me when my review is approved</span>
				</label>
			</div>
		`;
	}

	#renderRecaptchaField() {
		if (!this.#recaptchaEnabled()) {
			return '';
		}

		return /*html*/`
			<div class="mmx-form-field" part="field field--recaptcha" data-name="TGR_reCAPTCHA">
				<slot name="recaptcha"></slot>
			</div>
		`;
	}

	#renderSubmitButton() {
		const submitButton = this.#flexSettings?.submit_button;
		const theme_available = submitButton?.textsettings?.fields?.normal?.button_theme?.theme_available || false;
		const text = MMX.coerceString(submitButton?.value, {fallback: 'Submit'});

		return /*html*/`
			<mmx-button
				part="submit"
				data-type="button"
				data-theme="${theme_available}"
				data-theme-class="${MMX.encodeEntities(submitButton?.textsettings?.fields?.normal?.button_theme?.classname ?? '')}"
				data-width="${theme_available ? MMX.encodeEntities(submitButton?.textsettings?.fields?.normal?.button_width?.value ?? '') : ''}"
				data-style="${theme_available ? '' : 'primary'}"
				data-size="${theme_available ? '' : 'm'}"
			>
				${this.renderThemeStylesheetTemplate(theme_available)}
				${MMX.encodeEntities(text)}
			</mmx-button>
		`;
	}

	// Listeners
	#bindComponentEvents() {
		this.on('click', '[part~="cta-button"]', () => this.openDialog());
		this.on('click', '[part~="submit"]', (e) => this.#onSubmitClick(e));
		this.on('submit', '[part~="form"]', (e) => this.#onFormSubmit(e));
	}

	#dialog() {
		return this.shadowRoot.querySelector('[part~="dialog"]');
	}

	#form() {
		return this.shadowRoot.querySelector('[part~="form"]');
	}

	#submitButton() {
		return this.shadowRoot.querySelector('[part~="submit"]');
	}

	openDialog() {
		const dialog = this.#dialog();

		dialog?.showModal?.();
		dialog?.addEventListener?.('close', () => this.#setMessage(''), {once: true});
		this.#initRecaptcha();
	}

	// reCAPTCHA
	static #loadRecaptchaApi() {
		if (!MMX_RatingForm.#recaptchaLoader) {
			MMX_RatingForm.#recaptchaLoader = new Promise((resolve) => {
				window.mmxRatingFormRecaptchaLoaded = () => resolve(window.grecaptcha);

				const script = document.createElement('script');
				script.src = 'https://www.google.com/recaptcha/api.js?onload=mmxRatingFormRecaptchaLoaded&render=explicit';
				script.async = true;
				document.head.append(script);
			});
		}

		return MMX_RatingForm.#recaptchaLoader;
	}

	#initRecaptcha() {
		if (!this.#recaptchaEnabled() || this.#recaptchaWidgetId !== null) {
			return;
		}

		MMX_RatingForm.#loadRecaptchaApi().then((grecaptcha) => {
			if (this.#recaptchaWidgetId !== null) {
				return;
			}

			const container = this.#recaptchaContainer();

			// A container left behind by a replaced form instance still holds
			// its orphaned widget; clear it so a fresh widget can render
			if (container.hasChildNodes()) {
				container.replaceChildren();
			}

			this.#recaptchaWidgetId = grecaptcha.render(container, {
				sitekey: this.#moduleSettings.recaptcha.public_key
			});
		});
	}

	// reCAPTCHA's frames find each other through named window properties, which
	// only exist for iframes in the document tree, so the widget's container
	// must live in the OUTERMOST host's light DOM and reach the dialog through
	// a chain of forwarding slots (each enclosing component renders
	// <slot name="recaptcha" slot="recaptcha"> inside this element's tag).
	// Living outside every shadow root also means re-renders never destroy it.
	#recaptchaContainer() {
		let host = this;

		while (host.getRootNode() instanceof ShadowRoot) {
			host = host.getRootNode().host;
		}

		let container = host.querySelector(':scope > [slot="recaptcha"]');

		if (!container) {
			container = MMX.createElement({
				type: 'div',
				attributes: {
					slot: 'recaptcha',
					class: 'mmx-skip-mutation'
				}
			});
			host.append(container);
		}

		return container;
	}

	#recaptchaToken() {
		if (!this.#recaptchaEnabled()) {
			return '';
		}

		try {
			return window.grecaptcha?.getResponse?.(this.#recaptchaWidgetId) ?? '';
		} catch (e) {
			return '';
		}
	}

	// Form Submit / AJAX
	#onSubmitClick(e) {
		e?.preventDefault?.();

		if (this.#submitButton()?.disabled) {
			return;
		}

		this.#form()?.requestSubmit?.();
	}

	#onFormSubmit(e) {
		e.preventDefault();

		const form = e.target;
		const submitButton = this.#submitButton();

		if (!form.checkValidity()) {
			return;
		}

		this.#setMessage('');
		this.#clearFieldErrors(form);

		if (this.#recaptchaEnabled() && MMX.valueIsEmpty(this.#recaptchaToken())) {
			this.#setMessage('Please complete the reCAPTCHA.', 'error');
			return;
		}

		if (submitButton) {
			submitButton.disabled = true;
		}

		this.#addReview(form)
			.then(() => this.#formSubmitted())
			.catch((response) => this.#formSubmitError({response, form, submitButton}));
	}

	#addReview(form) {
		return MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'tgreviews',
				Module_Function: 'Runtime_Product_Review_Insert',
				TGR_Product_Code: this.#product?.code,
				TGR_Order_ID: MMX.coerceNumber(this.#moduleSettings?.order_id),
				...this.#reviewParams(form)
			}
		})
		.then((data) => {
			return data?.success ? Promise.resolve(data) : Promise.reject(data);
		});
	}

	#reviewParams(form) {
		const additionalFieldPrefix = 'TGR_AdditionalFields:';
		const params = {
			TGR_AdditionalFields: {}
		};
		const formData = new FormData(form);

		this.#fragmentForms().forEach((fragmentForm) => {
			new FormData(fragmentForm).forEach((value, name) => formData.append(name, value));
		});

		formData.forEach((value, name) => {
			if (name.startsWith(additionalFieldPrefix)) {
				params.TGR_AdditionalFields[name.slice(additionalFieldPrefix.length)] = value;
				return;
			}

			params[name] = value;
		});

		params.TGR_Rating = MMX.coerceNumber(params.TGR_Rating);
		params.TGR_Notify = MMX.isTruthy(params.TGR_Notify);

		if (this.#recaptchaEnabled()) {
			params.TGR_reCAPTCHA = this.#recaptchaToken();
		}

		return params;
	}

	#fragmentForms() {
		const slot = this.shadowRoot?.querySelector?.('slot[name="review-form-fragment"]');

		return (slot?.assignedElements?.({flatten: true}) ?? []).map((container) => {
			if (container instanceof HTMLFormElement) {
				return container;
			}

			let form = container.querySelector(':scope form');

			if (!form) {
				form = document.createElement('form');
				form.addEventListener('submit', (e) => e.preventDefault());
				form.append(...container.childNodes);
				container.append(form);
			}

			return form;
		});
	}

	#formSubmitted() {
		this.#showConfirmation();

		this.dispatchEvent(new CustomEvent('review:added', {
			bubbles: true,
			composed: true,
			detail: {
				product_code: this.#product?.code
			}
		}));
	}

	#showConfirmation() {
		const form = this.#form();

		if (!form) {
			return;
		}

		const confirmation = document.createElement('div');
		confirmation.innerHTML = this.#renderConfirmation();
		form.replaceWith(...confirmation.childNodes);
	}

	#formSubmitError({response, form, submitButton} = {}) {
		const fallback = MMX.coerceString(this.#flexSettings?.messages?.error_message?.value, {fallback: 'An error has occurred.'});
		const errorFieldLabels = this.#applyFieldErrors(form, response?.error_fields);

		if (errorFieldLabels.length) {
			this.#setMessage(`Please correct the following ${errorFieldLabels.length === 1 ? 'field' : 'fields'}: ${errorFieldLabels.join(', ')}`, 'error');
		} else {
			this.#setMessage(response?.error_message ?? fallback, 'error');
		}

		if (this.#recaptchaEnabled() && this.#recaptchaWidgetId !== null) {
			window.grecaptcha?.reset?.(this.#recaptchaWidgetId);
		}

		if (submitButton) {
			submitButton.disabled = false;
		}
	}

	#applyFieldErrors(form, errors) {
		const labels = [];

		if (!form || MMX.arrayIsEmpty(errors)) {
			return labels;
		}

		let firstInvalidElement;

		errors.forEach((error) => {
			if (MMX.valueIsEmpty(error?.error_field)) {
				return;
			}

			const element = form.querySelector(`[name="${CSS.escape(error.error_field)}"], [data-name="${CSS.escape(error.error_field)}"]`);
			const field = element?.closest?.('.mmx-form-field');

			labels.push(this.#fieldErrorLabel(field, error.error_field));

			if (!field) {
				return;
			}

			field.classList.add('mmx-form-field--error');

			const message = document.createElement('div');
			message.className = 'mmx-form-field-error-message';
			message.textContent = error?.error_message ?? '';
			field.append(message);

			firstInvalidElement ??= element;
		});

		firstInvalidElement?.focus?.();

		return labels;
	}

	#fieldErrorLabel(field, errorField) {
		const label = field?.querySelector?.('label, .mmx-form-label')?.textContent?.trim();

		return MMX.valueIsEmpty(label) ? errorField.replace(/^TGR_(AdditionalFields:)?/, '') : label;
	}

	#clearFieldErrors(form) {
		if (!form) {
			return;
		}

		form.querySelectorAll('.mmx-form-field--error').forEach((field) => field.classList.remove('mmx-form-field--error'));
		form.querySelectorAll('.mmx-form-field-error-message').forEach((message) => message.remove());
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
			badgeTheme: style === 'error' ? this.#flexSettings?.messages?.error_message?.textsettings?.fields?.normal?.badge_theme : undefined,
			style,
			content: MMX.encodeEntities(text)
		});
	}
}

if (!customElements.get('mmx-rating-form')) {
	customElements.define('mmx-rating-form', MMX_RatingForm);
}

/**
 * MMX / Rating Reviews
 */

class MMX_RatingReviews extends MMX_Element {

	static get props() {
		return {};
	}

	styleResourceCodes = ['mmx-base', 'mmx-forms', 'mmx-rating', 'mm-theme-styles'];
	renderUniquely = true;
	lifecycleReady = false;

	#product = {};
	#moduleSettings = {};
	#flexSettings = {};
	#observer = null;

	#loaded = false;
	#appendReviews = false;
	#errorMessage = '';
	#reviews = [];
	#breakdown = [];
	#average = {};
	#reviewCount = 0;
	#totalCount = 0;
	#offset = 0;
	#sort = '';
	#ratingFilter = 0;

	constructor() {
		super();
		this.makeComponent();
		this.#bindComponentEvents();
	}

	// Data
	onDataChange() {
		this.#product = this.data?.product ?? {};
		this.#moduleSettings = this.data?.moduleSettings ?? {};
		this.#flexSettings = this.data?.flexSettings ?? {};
		this.#sort = MMX.coerceString(this.#flexSettings?.default_sort?.value, {fallback: '-created'});
		this.#lazyLoad();
	}

	// Defer the first request until the component is near the viewport. A hidden
	// tab panel / closed accordion never intersects, so revealing it triggers the load.
	#lazyLoad() {
		this.#observer?.disconnect();

		this.#observer = new IntersectionObserver((entries) => {
			if (!entries.some(entry => entry.isIntersecting)) {
				return;
			}

			this.#observer.disconnect();
			this.#load();
		}, {rootMargin: '200px'});

		this.#observer.observe(this);
	}

	disconnected() {
		this.#observer?.disconnect();
	}

	#perPage() {
		const perPage = MMX.coerceNumber(this.#flexSettings?.per_page?.value);

		return perPage > 0 ? perPage : 5;
	}

	#showBreakdown() {
		return MMX.isTruthy(this.#flexSettings?.show_breakdown?.value);
	}

	#sortOptions() {
		const options = this.#moduleSettings?.sort_options;

		if (Array.isArray(options) && options.length) {
			return options;
		}

		return [
			{value: '-id', label: 'Default'},
			{value: '-created', label: 'Most Recent'},
			{value: 'created', label: 'Least Recent'},
			{value: '-rating', label: 'Highest Rating'},
			{value: 'rating', label: 'Lowest Rating'}
		];
	}

	#additionalFields() {
		return Array.isArray(this.#moduleSettings?.additional_fields) ? this.#moduleSettings.additional_fields : [];
	}

	// Public API
	reload() {
		this.#observer?.disconnect();
		this.#load();
	}

	loadMore() {
		if (!this.#hasMoreReviews()) {
			return;
		}

		this.#offset = this.#reviews.length;
		this.#appendReviews = true;
		this.#load();
	}

	// Load
	#load() {
		if (MMX.valueIsEmpty(this.#product?.code)) {
			return;
		}

		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'tgreviews',
				Module_Function: 'Runtime_Load_Product_Reviews',
				TGR_Product_Code: this.#product?.code,
				TGR_Count: this.#perPage(),
				TGR_Offset: this.#offset,
				TGR_Sort: this.#sort,
				TGR_Show_Rating: this.#ratingFilter > 0 ? this.#ratingFilter : undefined,
				filter: MMX.cacheKeysFilters(this.#product)
			}
		})
		.then((response) => this.#reviewsLoaded(response))
		.catch((response) => this.#reviewsFailedToLoad(response));
	}

	#reviewsLoaded(response) {
		const data = response?.data ?? {};

		this.#breakdown = Array.isArray(data?.breakdown) ? data.breakdown : [];
		this.#average = data?.average ?? {};
		this.#reviewCount = MMX.coerceNumber(this.#average?.count);
		this.#totalCount = MMX.coerceNumber(data?.total_count);
		this.#offset = MMX.coerceNumber(data?.start_offset);

		const reviews = Array.isArray(data?.data) ? data.data : [];

		this.#reviews = this.#appendReviews ? [...this.#reviews, ...reviews] : reviews;
		this.#appendReviews = false;
		this.#errorMessage = '';
		this.#loaded = true;
		this.forceUpdate();
	}

	#reviewsFailedToLoad(response = {}) {
		this.#appendReviews = false;

		if (response?.error_code === 'EOF') {
			this.#reviewsLoaded({data: {}});
			return;
		}

		this.#errorMessage = MMX.coerceString(response?.error_message, {fallback: 'There was a problem loading the reviews.'});
		this.#loaded = true;
		this.forceUpdate();
	}

	// Load More
	#hasMoreReviews() {
		return this.#reviews.length < this.#totalCount;
	}

	// Render
	render() {
		return /*html*/`
			<div
				part="wrapper"
				class="mmx-rating-reviews${this.typographyThemeClass(this.#flexSettings?.review_text_typography)}"
				style="${MMX.valueIsEmpty(this.#flexSettings?.active_color?.value) ? '' : `--mmx-rating__active-color: ${MMX.encodeEntities(this.#flexSettings.active_color.value)};`}${MMX.valueIsEmpty(this.#flexSettings?.inactive_color?.value) ? '' : ` --mmx-rating__inactive-color: ${MMX.encodeEntities(this.#flexSettings.inactive_color.value)};`}"
			>
				${this.#renderHeading()}
				${this.#renderContent()}
			</div>
		`;
	}

	#renderHeading() {
		const heading = this.#flexSettings?.heading;

		if (MMX.valueIsEmpty(heading?.value)) {
			return '';
		}

		return /*html*/`
			<div part="heading" class="mmx-rating-reviews__heading">
				${this.renderTextProperty(heading, {
					className: 'heading',
					defaultStyle: 'title-4',
					defaultTag: 'p'
				})}
			</div>
		`;
	}

	#renderContent() {
		if (!this.#loaded) {
			return /*html*/'<div part="loading" class="mmx-rating-reviews__loading">Loading reviews&hellip;</div>';
		}

		if (this.#errorMessage) {
			return /*html*/`
				<div part="error" class="mmx-rating-reviews__error">
					${this.renderBadgeMessage({
						badgeTheme: this.#flexSettings?.message_badges?.error_badge,
						style: 'warning',
						content: MMX.encodeEntities(this.#errorMessage)
					})}
				</div>
			`;
		}

		if (this.#reviewCount <= 0) {
			return /*html*/`
				<div part="empty" class="mmx-rating-reviews__empty">
					${this.renderBadgeMessage({
						badgeTheme: this.#flexSettings?.message_badges?.empty_badge,
						style: 'info',
						content: 'There are no reviews for this product yet.'
					})}
				</div>
			`;
		}

		return /*html*/`
			${this.#renderBreakdown()}
			${this.#renderToolbar()}
			${this.#renderReviews()}
			${this.#renderLoadMore()}
		`;
	}

	// Render: Breakdown
	#renderBreakdown() {
		if (!this.#showBreakdown() || this.#reviewCount <= 0) {
			return '';
		}

		return /*html*/`
			<div part="breakdown" class="mmx-rating-reviews__breakdown">
				${this.#renderBreakdownSummary()}
				${this.#renderBreakdownRows()}
			</div>
		`;
	}

	#renderBreakdownRows() {
		if (MMX.arrayIsEmpty(this.#breakdown)) {
			return '';
		}

		const rows = [...this.#breakdown].sort((a, b) => b.rating - a.rating);

		return /*html*/`
			<div part="breakdown-rows" class="mmx-rating-reviews__breakdown-rows">
				${rows.map((row) => this.#renderBreakdownRow(row)).join('')}
			</div>
		`;
	}

	#averageRating() {
		return Math.round(MMX.coerceNumber(this.#average?.rating) * 10) / 10;
	}

	#renderBreakdownSummary() {
		const average = this.#averageRating();

		return /*html*/`
			<div part="breakdown-summary" class="mmx-rating-reviews__breakdown-summary">
				<span part="breakdown-summary-score" class="mmx-rating-reviews__breakdown-summary-score">${MMX.encodeEntities(average)}</span>
				<mmx-rating part="breakdown-summary-rating" data-rating="${MMX.encodeEntities(average)}" ${this.#ratingAttributes()}></mmx-rating>
				${this.#renderBreakdownSummaryCount()}
			</div>
		`;
	}

	#renderBreakdownSummaryCount() {
		const text = `${MMX.encodeEntities(this.#reviewCount)} ${MMX.pluralize('review', this.#reviewCount)}`;

		if (this.#ratingFilter <= 0) {
			return /*html*/`<span part="breakdown-summary-count" class="mmx-rating-reviews__breakdown-summary-count">${text}</span>`;
		}

		return this.#renderLinkButton({
			part: 'clear-filter breakdown-summary-count breakdown-summary-count-button',
			title: 'Show all reviews',
			content: text
		});
	}

	#renderBreakdownRow(row = {}) {
		const rating = MMX.coerceNumber(row?.rating);
		const count = MMX.coerceNumber(row?.count);
		const percent = this.#reviewCount > 0 ? Math.max(0, Math.min(100, Math.round((count / this.#reviewCount) * 100))) : 0;
		const active = this.#ratingFilter === rating;

		return /*html*/`
			<button
				type="button"
				part="breakdown-row"
				class="mmx-rating-reviews__breakdown-row"
				data-rating="${MMX.encodeEntities(rating)}"
				aria-pressed="${active}"
				title="Show only ${MMX.encodeEntities(rating)}-${MMX.pluralize('star', rating)} reviews"
			>
				<span part="breakdown-label" class="mmx-rating-reviews__breakdown-label">
					${MMX.encodeEntities(rating)}
					<mmx-icon part="breakdown-icon">${MMX.encodeEntities(MMX.coerceString(this.#flexSettings?.icon?.value, {fallback: 'star'}))}-full</mmx-icon>
				</span>
				<span part="breakdown-bar" class="mmx-rating-reviews__breakdown-bar">
					<span part="breakdown-bar-fill" class="mmx-rating-reviews__breakdown-bar-fill" style="width: ${MMX.encodeEntities(percent)}%;"></span>
				</span>
				<span part="breakdown-count" class="mmx-rating-reviews__breakdown-count">${MMX.encodeEntities(count)}</span>
			</button>
		`;
	}

	// Render: Toolbar
	#renderToolbar() {
		return /*html*/`
			<div part="toolbar" class="mmx-rating-reviews__toolbar">
				<span part="count" class="mmx-rating-reviews__count" role="status">
					${MMX.encodeEntities(this.#countText())}
					${this.#renderClearFilter()}
				</span>
				${this.#renderSortSelect()}
			</div>
		`;
	}

	#countText() {
		if (this.#totalCount <= 0) {
			return this.#ratingFilter > 0 ? `No ${this.#ratingFilter}-star reviews` : 'No reviews';
		}

		return `Showing ${this.#reviews.length} of ${this.#totalCount} ${MMX.pluralize('review', this.#totalCount)}`;
	}

	#renderClearFilter() {
		if (this.#ratingFilter <= 0) {
			return '';
		}

		return this.#renderLinkButton({
			part: 'clear-filter',
			content: `Clear ${MMX.encodeEntities(this.#ratingFilter)}-star filter`
		});
	}

	#renderSortSelect() {
		return /*html*/`
			<div class="mmx-form-select" part="sort-select">
				<select class="mmx-form-select__dropdown" part="sort-select-dropdown" aria-label="Sort Reviews">
					${this.#sortOptions().map((option) => /*html*/`
						<option value="${MMX.encodeEntities(option?.value)}" ${option?.value === this.#sort ? 'selected' : ''}>${MMX.encodeEntities(option?.label)}</option>
					`).join('')}
				</select>
			</div>
		`;
	}

	// Render: Reviews
	#renderReviews() {
		if (MMX.arrayIsEmpty(this.#reviews)) {
			return /*html*/'<div part="empty" class="mmx-rating-reviews__empty">No reviews matched.</div>';
		}

		return /*html*/`
			<div part="reviews" class="mmx-rating-reviews__reviews">
				${this.#reviews.map((review) => this.#renderReview(review)).join('')}
			</div>
		`;
	}

	#ratingAttributes() {
		const icon = MMX.coerceString(this.#flexSettings?.icon?.value, {fallback: 'star'});

		return `
			data-icon-set="${MMX.encodeEntities(icon)}"
			data-active-color="${MMX.encodeEntities(this.#flexSettings?.active_color?.value ?? '')}"
			data-inactive-color="${MMX.encodeEntities(this.#flexSettings?.inactive_color?.value ?? '')}"
		`;
	}

	#renderLinkButton({part = '', title = '', content = ''} = {}) {
		const buttonTheme = this.#flexSettings?.link_button_theme;
		const theme_available = buttonTheme?.theme_available ?? false;

		return /*html*/`
			<mmx-button
				part="${part}"
				data-type="button"
				${MMX.valueIsEmpty(title) ? '' : `title="${MMX.encodeEntities(title)}"`}
				data-theme="${theme_available}"
				data-theme-class="${MMX.encodeEntities(buttonTheme?.classname ?? '')}"
				data-style="${theme_available ? '' : 'secondary-link'}"
				data-size="${theme_available ? '' : 's'}"
			>
				${this.renderThemeStylesheetTemplate(theme_available)}
				${content}
			</mmx-button>
		`;
	}

	#renderReview(review = {}) {
		return /*html*/`
			<article part="review" class="mmx-rating-reviews__review">
				<div part="review-header" class="mmx-rating-reviews__review-header">
					<mmx-rating data-rating="${MMX.encodeEntities(review?.rating)}" ${this.#ratingAttributes()}></mmx-rating>
					${MMX.valueIsEmpty(review?.title) ? '' : /*html*/`<span part="review-title" class="mmx-rating-reviews__review-title${this.typographyThemeClass(this.#flexSettings?.review_title_typography)}">${MMX.encodeEntities(review.title)}</span>`}
				</div>
				<div part="review-meta" class="mmx-rating-reviews__review-meta">
					${this.#renderReviewMeta(review)}
				</div>
				${MMX.valueIsEmpty(review?.summary) ? '' : /*html*/`<p part="review-summary" class="mmx-rating-reviews__review-summary">${MMX.encodeEntities(review.summary)}</p>`}
				${this.#renderReviewAdditionalFields(review)}
				${this.#renderReviewReply(review)}
			</article>
		`;
	}

	#renderReviewMeta(review = {}) {
		const meta = [review?.name, review?.location, this.#reviewDate(review)]
			.filter((value) => !MMX.valueIsEmpty(value))
			.map((value) => /*html*/`<span class="mmx-rating-reviews__review-meta-item">${MMX.encodeEntities(value)}</span>`)
			.join('');

		return meta + this.#renderVerifiedBadge(review);
	}

	#reviewDate(review = {}) {
		const created = MMX.coerceNumber(review?.created);

		if (created <= 0) {
			return '';
		}

		return new Date(created * 1000).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
	}

	#renderVerifiedBadge(review = {}) {
		if (!MMX.isTruthy(review?.verified)) {
			return '';
		}

		return this.renderBadgeMessage({
			badgeTheme: this.#flexSettings?.verified_badge,
			style: 'success',
			attributes: {
				part: 'review-verified',
				class: 'mmx-rating-reviews__review-verified',
				'data-display': 'inline-block'
			},
			content: /*html*/`
				<mmx-icon part="review-verified-icon">check</mmx-icon>
				Verified Buyer
			`
		});
	}

	#renderReviewAdditionalFields(review = {}) {
		const labels = new Map(this.#additionalFields().map((field) => [field?.code, field?.name]));
		const content = Object.entries(review?.AdditionalFields ?? {})
			.filter(([, value]) => !MMX.valueIsEmpty(value))
			.map(([code, value]) => /*html*/`
				<div part="review-additional-field" class="mmx-rating-reviews__review-additional-field">
					<span part="review-additional-field-label" class="mmx-rating-reviews__review-additional-field-label">${MMX.encodeEntities(labels.get(code) ?? code)}:</span>
					${MMX.encodeEntities(value)}
				</div>
			`)
			.join('');

		if (MMX.valueIsEmpty(content)) {
			return '';
		}

		return /*html*/`<div part="review-additional-fields" class="mmx-rating-reviews__review-additional-fields">${content}</div>`;
	}

	#renderReviewReply(review = {}) {
		if (MMX.valueIsEmpty(review?.store_rply)) {
			return '';
		}

		return /*html*/`
			<div part="review-reply" class="mmx-rating-reviews__review-reply">
				<span part="review-reply-label" class="mmx-rating-reviews__review-reply-label">Store Response</span>
				${MMX.encodeEntities(review.store_rply)}
			</div>
		`;
	}

	// Render: Load More
	#renderLoadMore() {
		if (!this.#hasMoreReviews()) {
			return '';
		}

		const loadMoreButton = this.#flexSettings?.load_more_button;
		const theme_available = loadMoreButton?.textsettings?.fields?.normal?.button_theme?.theme_available || false;
		const text = MMX.coerceString(loadMoreButton?.value, {fallback: 'Load More Reviews'});

		return /*html*/`
			<div part="load-more" class="mmx-rating-reviews__load-more">
				<mmx-button
					part="load-more-button"
					data-type="button"
					data-theme="${theme_available}"
					data-theme-class="${MMX.encodeEntities(loadMoreButton?.textsettings?.fields?.normal?.button_theme?.classname ?? '')}"
					data-style="${theme_available ? '' : 'secondary'}"
					data-size="${theme_available ? '' : 'm'}"
				>
					${this.renderThemeStylesheetTemplate(theme_available)}
					${MMX.encodeEntities(text)}
				</mmx-button>
			</div>
		`;
	}

	// Listeners
	#bindComponentEvents() {
		this.on('change', '[part~="sort-select-dropdown"]', (e, select) => this.#onSortChange(select));
		this.on('click', '[part~="breakdown-row"]', (e, row) => this.#onBreakdownRowClick(row));
		this.on('click', '[part~="clear-filter"]', () => this.#onClearFilterClick());
		this.on('click', '[part~="load-more-button"]', () => this.loadMore());
	}

	#onSortChange(select) {
		this.#sort = select?.value ?? '';
		this.#offset = 0;
		this.#load();
	}

	#onBreakdownRowClick(row) {
		const rating = MMX.coerceNumber(row?.dataset?.rating);

		this.#ratingFilter = this.#ratingFilter === rating ? 0 : rating;
		this.#offset = 0;
		this.#load();
	}

	#onClearFilterClick() {
		this.#ratingFilter = 0;
		this.#offset = 0;
		this.#load();
	}
}

if (!customElements.get('mmx-rating-reviews')) {
	customElements.define('mmx-rating-reviews', MMX_RatingReviews);
}