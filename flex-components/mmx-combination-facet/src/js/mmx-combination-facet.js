class MMX_CombinationFacet extends MMX_Element {
	static get props() {
		return {
			'auto-submit': {
				default: true,
				isBoolean: true
			},
			'controls-background-color': {
				allowAny: true,
				default: 'none'
			},
			'controls-border-radius': {
				allowAny: true,
				default: 8,
				isNumeric: true
			},
			'count-optional': {
				allowAny: true,
				default: 0,
				isNumeric: true
			},
			'destination-url': {
				allowAny: true
			},
			'facet-code': {
				allowAny: true,
				default: null
			},
			'input-size': {
				default: 'm',
				options: ['s', 'm', 'l']
			},
			'label-applied-style': {
				allowAny: true,
				default: 'paragraph-s'
			},
			'label-applied-styles': {
				allowAny: true,
				default: ''
			},
			'label-applied-text': {
				allowAny: true,
				default: ''
			},
			'label-inactive-style': {
				allowAny: true,
				default: 'paragraph-s'
			},
			'label-inactive-styles': {
				allowAny: true,
				default: ''
			},
			'label-inactive-text': {
				allowAny: true,
				default: ''
			},
			'reset-text': {
				allowAny: true,
				default: 'Reset'
			},
			'submit-style': {
				allowAny: true,
				default: 'primary'
			},
			'submit-text': {
				allowAny: true,
				default: 'Submit'
			},
			'text-align': {
				default: 'center',
				options: ['left', 'center', 'right']
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-button', 'mmx-text', 'mmx-combination-facet'];
	renderUniquely = true;

	#facet;
	#appliedValues = [];

	constructor() {
		super();
		this.makeShadow();
	}

	render() {
		return /*html*/`
			<div part="wrapper" class="mmx-combination-facet mmx-combination-facet--size-${MMX.encodeEntities(this.getPropValue('input-size'))}">
				<div part="title" class="mmx-combination-facet__title">
					<slot name="title"></slot>
				</div>
				<form part="form" class="mmx-combination-facet__form" method="post" action="${MMX.encodeEntities(this.#destinationUrl())}">
					${this.#renderControls()}
				</form>
			</div>
		`;
	}

	styles() {
		const controlsBackgroundColor = this.getPropValue('controls-background-color');
		return /*css*/`
			.mmx-combination-facet {
				--mmx-combination-facet--controls-background-color: ${controlsBackgroundColor};
				--mmx-combination-facet--controls-border-radius: ${this.getPropValue('controls-border-radius')}px;
				--mmx-combination-facet--controls-padding: ${controlsBackgroundColor === 'none' ? '0' : 'var(--mmx-combination-facet--size)'};
				--mmx-combination-facet--text-align: ${this.getPropValue('text-align')};
			}
		`;
	}

	afterRender(){
		this.#bindEvents();
	}

	#bindEvents() {
		this.#dropdowns()?.forEach((dropdown, index) => {
			dropdown.addEventListener('change', () => {
				this.#onDropdownChange({dropdown, index});
			});
		});

		this.#form()?.addEventListener('submit', (e) => {
			this.#onFormSubmit(e);
		});
	}

	onDataChange() {
		MMX.setElementAttributes(this, {
			'data-auto-submit': this.data?.advanced?.auto_submit?.value,
			'data-controls-background-color': this.data?.controls?.background_color?.value,
			'data-controls-border-radius': this.data?.controls?.border_radius?.value,
			'data-count-optional': this.data?.advanced?.count_optional?.value,
			'data-destination-url': this.data?.controls?.submit_destination?.url,
			'data-facet-code': this.data?.controls?.facet_code?.value,
			'data-input-size': this.data?.controls?.input_size?.value,
			'data-label-applied-style': this.data?.controls?.label_applied?.textsettings?.fields?.normal?.label_applied_style?.value,
			'data-label-applied-styles': this.data?.controls?.label_applied?.textsettings?.styles?.normal,
			'data-label-applied-text': this?.data?.controls?.label_applied?.value,
			'data-label-inactive-style': this.data?.controls?.label_inactive?.textsettings?.fields?.normal?.label_inactive_style?.value,
			'data-label-inactive-styles': this.data?.controls?.label_inactive?.textsettings?.styles?.normal,
			'data-label-inactive-text': this?.data?.controls?.label_inactive?.value,
			'data-reset-text': this?.data?.controls?.reset_text?.value,
			'data-submit-style': this.data?.controls?.submit_button_style?.value,
			'data-submit-text': this?.data?.controls?.submit_text?.value,
			'data-text-align': this.data?.content?.align?.value
		});
	}

	attributeChanged(name, oldValue, newValue) {
		if (name === 'data-facet-code' && newValue !== oldValue) {
			this.#loadFacet();
		}
	}

	// Load Facet
	#facetStatus() {
		const facetVariableType = MMX.variableType(this.#facet);

		if (!this.#hasFacetCode()) {
			return 'missing-code';
		}

		if (facetVariableType === 'undefined') {
			return 'loading';
		}

		if (facetVariableType !== 'object') {
			return 'load-failure';
		}

		if (!this.#facet.code?.length) {
			return 'not-found';
		}

		if (this.#fieldCount() === 0) {
			return 'missing-fields';
		}

		return 'valid';
	}

	#hasFacetCode() {
		const facetCode = this.getPropValue('facet-code');
		return typeof facetCode === 'string' && facetCode.length > 0;
	}

	#loadFacet() {
		if (!this.#hasFacetCode()) {
			this.forceUpdate();
			return;
		}

		this.#facet = undefined;

		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'combofacets',
				Module_Function: 'CombinationFacetAndFieldList_Load_All',
				CombinationFacet_Code: this.getPropValue('facet-code')
			}
		})
		.then(response => {
			this.#afterLoadFacet(response.data);
		})
		.catch((error) => {
			if (error?.error_message === 'Unable to load combination facet') {
				this.#facet = {};
				return;
			}

			this.#facet = null;
		})
		.finally(() => {
			this.forceUpdate();
		});
	}

	#afterLoadFacet(facet) {
		this.#setFacetAndFields(facet);
		this.#loadAppliedValues();
	}

	// Fields
	#fieldCount() {
		return MMX.coerceNumber(this.#facet?.fields?.length, 0);
	}

	#getFieldByIndex(index = 0) {
		return this.#facet?.fields?.at(index);
	}

	#setFacetAndFields(facet) {
		this.#facet = MMX.variableType(facet) === 'object' && Array.isArray(facet.fields) ? structuredClone(facet) : null;
		this.#facet?.fields?.map(field => {
			return this.#setField(field);
		});
	}

	#setField(field = {}) {
		if (typeof field.code !== 'string') {
			return field;
		}

		field.selection = typeof field.selection === 'string' ? field.selection : '';
		field.values = Array.isArray(field.values) ? field.values : [];

		return field;
	}

	// Form
	#form() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__form');
	}

	#formIsValid() {
		return this.#allRequiredDropdownsHaveValues();
	}

	#onFormSubmit(e) {
		if (this.#hasAppliedValues()) {
			e.preventDefault();
			this.#clearCookie();
			return;
		}

		this.submitForm(e);
	}

	submitForm(e) {
		if (!this.#formIsValid()) {
			e?.preventDefault();
			return;
		}

		this.#setCookie();
	}

	#destinationUrl() {
		const destinationUrl = this.getPropValue('destination-url');

		if (MMX.valueIsEmpty(destinationUrl)) {
			return new URL(window.location.href);
		}

		try {
			return new URL(destinationUrl);
		}
		catch (e) {
			return new URL(destinationUrl, window.location.origin);
		}
	}

	// Controls
	#renderControls() {
		const facetStatus = this.#facetStatus();
		switch (facetStatus) {
			case 'missing-code':
				return this.#renderMessage({
					code: facetStatus,
					message: 'The combination facet code is required.'
				});
			case 'loading':
				return this.#renderLoadingForm();
			case 'not-found':
				return this.#renderMessage({
					code: facetStatus,
					message: `Combination facet "${this.getPropValue('facet-code')}" does not exist.`
				});
			case 'missing-fields':
				return this.#renderMessage({
					code: facetStatus,
					message: `Combination facet "${this.#facet?.name}" does not have any fields to select.`
				});
			case 'valid':
				return this.#renderDropdownForm();
			case 'load-failure':
			default:
				return this.#renderMessage({
					code: facetStatus,
					message: 'There was a problem loading the facet.'
				});
		}
	}

	#renderMessage({code = '', message = ''} = {}) {
		return /*html*/`
			<div
				part="message ${MMX.encodeEntities(code)}"
				class="mmx-combination-facet__message"
			>
				${message}
			</div>`;
	}

	#renderLoadingForm() {
		return /*html*/`
			${this.#renderLabelText()}
			<div part="loading" class="mmx-combination-facet__loading"></div>
			${this.#renderSubmitButton()}
		`;
	}

	#renderDropdownForm() {
		return /*html*/`
			${this.#renderLabelText()}
			${this.#renderDropdowns()}
			${this.#renderSubmitButton()}
		`;
	}

	// Dropdowns
	#dropdowns() {
		return this.shadowRoot.querySelectorAll('.mmx-combination-facet__dropdown-select');
	}

	#optionalDropdownCount() {
		return MMX.coerceNumber(this.getPropValue('count-optional'), this.constructor.props['count-optional'].default);
	}

	#allDropdownsHaveValues() {
		return this.#allDropdownValues().length === this.#fieldCount();
	}

	#allRequiredDropdownsHaveValues() {
		return this.#allDropdownValues().length >= this.#fieldCount() - this.#optionalDropdownCount();
	}

	#allDropdownValues() {
		return Array.from(this.#dropdowns()).reduce(this.#reduceDropdownValue, []);
	}

	#getDropdownByFieldCode(fieldCode) {
		return Array.from(this.#dropdowns()).find(dropdown => dropdown.dataset.fieldCode === fieldCode);
	}

	#getDependentDropdownValues(index = -1) {
		return Array.from(this.#dropdowns()).slice(0, index + 1).reduce(this.#reduceDropdownValue, []);
	}

	#reduceDropdownValue(values, dropdown) {
		if (dropdown.value) {
			values.push(dropdown.value);
		}
		return values;
	}

	#renderDropdowns() {
		return this.#facet?.fields?.map((field, index) => {
			return this.#renderDropdown(field, index);
		}).join('');
	}

	#renderDropdown(field, index = 0) {
		const required = index < this.#fieldCount() - this.#optionalDropdownCount() ? 'required' : '';
		const disabled = field.values.length > 0 ? '' : 'disabled';
		return /*html*/`
			<div
				part="dropdown"
				class="mmx-combination-facet__dropdown"
			>
				<select
					part="dropdown-select"
					class="mmx-combination-facet__dropdown-select"
					data-field-code="${MMX.encodeEntities(field.code)}"
					${required}
					${disabled}
				>
					${this.#renderDropdownOptions(field)}
				</select>
			</div>
		`;
	}

	#renderDropdownOptions(field) {
		const firstOption = field.appliedValue ?? field.name;
		let options = /*html*/`<option value="">${MMX.encodeEntities(firstOption)}</option>`;

		return field.values.reduce((options, value) => {
			const selected = field.selection === value ? 'selected' : '';
			options += /*html*/`<option ${selected}>${MMX.encodeEntities(value)}</option>`;
			return options;
		}, options);
	}

	#onDropdownChange({dropdown, index} = {}) {
		const field = this.#getFieldByIndex(index);
		field.selection = dropdown.value;
		this.#clearDependentDropdowns(index);

		if (this.getPropValue('auto-submit') && this.#allDropdownsHaveValues()) {
			this.submitForm();
			return;
		}

		if (field.selection) {
			this.#loadFieldValues(index);
		}
	}

	#clearDependentDropdowns(index = -1) {
		this.#facet?.fields?.slice(index + 1).forEach(field => {
			field.selection = '';
			field.values = [];

			const dropdown = this.#getDropdownByFieldCode(field.code);
			dropdown.value = '';
			dropdown.innerHTML = this.#renderDropdownOptions(field);
			dropdown.disabled = true;
		});
	}

	// Applied Values
	#hasAppliedValues() {
		return this.#appliedValues.length > 0;
	}

	#loadAppliedValues() {
		if (!this.#facet || !this.#fieldCount()) {
			return;
		}

		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'combofacets',
				Module_Function: 'CombinationFacetAppliedValueList_Load_Cookie',
				CombinationFacet_Code: this.#facet.code
			}
		})
		.then(response => {
			this.#afterLoadAppliedValues(response.data);
		})
		.catch(response => {}) ;
	}

	#afterLoadAppliedValues(appliedValues) {
		this.#setAppliedValues(appliedValues);

		if (this.#hasAppliedValues()) {
			this.forceUpdate();
			return;
		}

		this.#loadFieldValues();
	}

	#setAppliedValues(appliedValues) {
		this.#appliedValues = Array.isArray(appliedValues) ? appliedValues : [];
		this.#facet?.fields?.map((field, index) => {
			field.appliedValue = this.#appliedValues.at(index);

			if (!field.appliedValue && this.#hasAppliedValues()) {
				field.appliedValue = `Any ${field.name}`;
			}

			return field;
		});
	}

	// Field Values
	#loadFieldValues(fieldIndex) {
		fieldIndex = MMX.coerceNumber(fieldIndex, -1);
		const hasNextField = fieldIndex < this.#fieldCount() - 1;

		if (!hasNextField) {
			return;
		}

		if (!this.#hasFacetCode()) {
			return;
		}

		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'combofacets',
				Module_Function: 'CombinationFacetValueList_Load_Field',
				CombinationFacet_Code: this.getPropValue('facet-code'),
				CombinationFacetValues: this.#getDependentDropdownValues(fieldIndex)
			}
		})
		.then(response => {
			this.#afterLoadFieldValues(response.data, fieldIndex);
		})
		.catch(response => {}) ;
	}

	#afterLoadFieldValues(values, fieldIndex) {
		values = Array.isArray(values) ? values : [];
		fieldIndex = MMX.coerceNumber(fieldIndex, -1);

		const nextFieldIndex = fieldIndex + 1;
		const nextField = this.#getFieldByIndex(nextFieldIndex);
		nextField.values = values;

		this.forceUpdate();

		if (nextFieldIndex > 0) {
			this.#dropdowns()[nextFieldIndex].focus();
		}
	}

	// Label Text
	#renderLabelText() {
		const labelType = this.#hasAppliedValues() ? 'applied' : 'inactive';
		const labelText = this.getPropValue(`label-${labelType}-text`);

		if (typeof labelText !== 'string' || !labelText?.length) {
			return '';
		}

		return /*html*/`
			<mmx-text
				part="label label-${labelType}"
				class="mmx-combination-facet__label"
				data-style="${MMX.encodeEntities(this.getPropValue(`label-${labelType}-style`))}"
				style="${MMX.encodeEntities(this.getPropValue(`label-${labelType}-styles`))}"
			>
				${MMX.encodeEntities(labelText)}
			</mmx-text>
		`;
	}

	// Submit Button
	#renderSubmitButton() {
		const disabled = this.#facetStatus() === 'loading' ? 'disabled' : '';
		const buttonText = this.#hasAppliedValues() ? this.getPropValue('reset-text') : this.getPropValue('submit-text');

		return /*html*/`
			<mmx-button
				part="submit ${this.#hasAppliedValues() ? 'submit-reset' : 'submit-apply'}"
				class="mmx-combination-facet__submit"
				exportparts="button: submit__inner"
				data-type="submit"
				data-style="${MMX.encodeEntities(this.getPropValue('submit-style'))}"
				data-width="full"
				${disabled}
			>
				${MMX.encodeEntities(buttonText)}
			</mmx-button>
		`;
	}

	// Set Cookie
	#setCookie() {
		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'combofacets',
				Module_Function: 'CombinationFacetAppliedValueList_Set_Cookie',
				CombinationFacet_Code: this.getPropValue('facet-code'),
				CombinationFacetValues: this.#allDropdownValues()
			}
		})
		.then(() => {
			this.#afterSetCookie();
		})
		.catch(response => {}) ;
	}

	#afterSetCookie() {
		this.#form().submit();
	}

	// Clear Cookie
	#clearCookie() {
		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'combofacets',
				Module_Function: 'CombinationFacetAppliedValueList_Clear_Cookie',
				CombinationFacet_Code: this.getPropValue('facet-code')
			}
		})
		.then(() => {
			this.#afterClearCookie();
		})
		.catch(response => {}) ;
	}

	#afterClearCookie() {
		window.location.reload();
	}
}

if (!customElements.get('mmx-combination-facet')) {
	customElements.define('mmx-combination-facet', MMX_CombinationFacet);
}