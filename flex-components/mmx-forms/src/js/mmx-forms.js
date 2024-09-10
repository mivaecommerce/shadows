class MMX_FormValidator {
	// Properties
	#forms;
	#formSelector = '[data-mmx-form-validator]';
	#fieldSelector = '.mmx-form-field';
	#invalidClass = 'mmx-form-field--error';
	#validClass = 'mmx-form-field--success';
	#fieldDescriptionClass = 'mmx-form-field-description';
	#fieldErrorMessageClass = 'mmx-form-field-error-message';
	#validityStates = ['valueMissing', 'badInput', 'typeMismatch', 'tooShort', 'tooLong', 'rangeUnderflow', 'rangeOverflow', 'stepMismatch', 'patternMismatch', 'customError', 'valid'];

	// Instance Methods
	static autoInit() {
		document.addEventListener('DOMContentLoaded', () => {
			new MMX_FormValidator();
		});
	}

	constructor(options = {}) {
		this.#formSelector = typeof options?.formSelector === 'string' ? options.formSelector : this.#formSelector;
		this.#fieldSelector = typeof options?.fieldSelector === 'string' ? options.fieldSelector : this.#fieldSelector;
		this.#invalidClass = typeof options?.invalidClass === 'string' ? options.invalidClass : this.#invalidClass;
		this.#validClass = typeof options?.validClass === 'string' ? options.validClass : this.#validClass;
		this.#fieldDescriptionClass = typeof options?.fieldDescriptionClass === 'string' ? options.fieldDescriptionClass : this.#fieldDescriptionClass;
		this.#validityStates = Array.isArray(options?.validityStates) ? options.validityStates : this.#validityStates;

		this.#init();
	}

	#init() {
		this.#forms = document.querySelectorAll(this.#formSelector);

		this.#forms?.forEach(form => {
			this.#bindEvents(form);
			this.#displayInitialErrors(form);
		});
	}

	// Events
	#bindEvents(form) {
		form.addEventListener('input', (e) => {
			this.#onInput(e);
		}, {capture: true});

		form.addEventListener('change', (e) => {
			this.#onChange(e);
		}, {capture: true});

		form.addEventListener('blur', (e) => {
			this.#onBlur(e);
		}, {capture: true});

		form.addEventListener('submit', (e) => {
			this.#onSubmit(e);
		}, {capture: true});
	}

	#onInput(e) {
		this.#setElementValidIfValid(e.target);
	}

	#onChange(e) {
		this.#setElementValidIfValid(e.target);
	}

	#onBlur(e) {
		this.#validateElement(e.target);
	}

	#onSubmit(e) {
		const elementsAreValid = this.#validateElements(this.#getFormElements(e?.target), {reportValidity: true});
		if (!elementsAreValid) {
			e.preventDefault();
		}
	}

	// Validation
	#setElementValidIfValid(element) {
		if (!this.#isElementValid(element)) {
			return;
		}

		this.#setElementValid(element);
	}

	#getFormElements(form) {
		return form.querySelectorAll('input, select, textarea');
	}

	#displayInitialErrors(form) {
		Array.from(this.#getFormElements(form)).forEach(element => {
			const field = this.#findElementField(element);

			if (!field) {
				return;
			}

			if (field?.classList.contains(this.#invalidClass)) {
				this.#validateElement(element);
			}
		});
	}

	#validateElements(elements, options) {
		return Array.from(elements).every(element => {
			return this.#validateElement(element, options);
		});
	}

	#validateElement(element, options) {
		if (this.#isElementValid(element)) {
			this.#setElementValid(element);
			return true;
		} else {
			this.#setElementInvalid(element, options);
			return false;
		}
	}

	#isElementValid(element) {
		return element?.validity?.valid === true;
	}

	#setElementValid(element) {
		const field = this.#findElementField(element);

		if (!field) {
			return;
		}

		field.classList.remove(this.#invalidClass);
		field.classList.add(this.#validClass);

		this.#removeFieldErrorMessage(field);
	}

	#getFieldErrorMessage(field) {
		return field.querySelector(`.${this.#fieldErrorMessageClass}`);
	}

	#removeFieldErrorMessage(field) {
		this.#getFieldErrorMessage(field)?.remove?.();
	}

	#setElementInvalid(element, {reportValidity = false} = {}) {
		const field = this.#findElementField(element);

		if (!field) {
			return;
		}

		field.classList.remove(this.#validClass);
		field.classList.add(this.#invalidClass);

		this.#addFieldErrorMessage({field, element});

		if (reportValidity) {
			element.reportValidity();
		}
	}

	#addFieldErrorMessage({field, element}) {
		const validationMessage = this.#getElementValidationMessage(element);
		const fieldErrorMessage = this.#getFieldErrorMessage(field);

		if (!fieldErrorMessage) {
			this.#insertFieldErrorMessage(field, validationMessage);
		} else {
			fieldErrorMessage.innerHTML = validationMessage;
		}
	}

	#insertFieldErrorMessage(field, message) {
		const fieldErrorMessage = this.#createFieldErrorMessage(message);
		const fieldDescription = this.#getFieldDescription(field);

		if (fieldDescription) {
			fieldDescription.insertAdjacentElement('beforebegin', fieldErrorMessage);
		} else {
			field.append(fieldErrorMessage);
		}
	}

	#createFieldErrorMessage(message) {
		return MMX.createElement({
			type: 'div',
			attributes: {
				class: this.#fieldErrorMessageClass
			},
			content: message
		});
	}

	#getFieldDescription(field) {
		return field.querySelector(`.${this.#fieldDescriptionClass}`);
	}

	#getElementValidationMessage(element) {
		const currentState = this.#validityStates.find(state => {
			return element.validity?.[state];
		});

		return /*html*/`<mmx-icon data-name="error"></mmx-icon> ${element.dataset[currentState] ?? element.validationMessage}`;
	}

	#findElementField(element) {
		return element?.closest?.(this.#fieldSelector);
	}
}

MMX_FormValidator.autoInit();

class MMX_FormInputAutoHeight {
	#inputs;
	#selector = '[data-mmx-form-input-auto-height]';

	static autoInit() {
		document.addEventListener('DOMContentLoaded', () => {
			new MMX_FormInputAutoHeight();
		});
	}

	constructor(options = {}) {
		this.#selector = typeof options?.selector === 'string' ? options.selector : this.#selector;

		this.#init();
	}

	#init() {
		this.#inputs = document.querySelectorAll(this.#selector);

		this.#inputs?.forEach(input => {
			this.#updateInput(input);
			this.#bindEvents(input);
		});
	}

	// Events
	#bindEvents(input) {
		input.addEventListener('input', (e) => {
			this.#onInput(e);
		});

		window.addEventListener('resize', () => {
			this.#debouncedOnResize();
		});
	}

	#onInput(e) {
		this.#updateInput(e.target);
	}

	#debouncedOnResize = MMX.debounce(() => {
		this.#updateInputs();
	}, 100);

	// Input Sizing
	#updateInputs() {
		this.#inputs.forEach(input => {
			this.#updateInput(input);
		});
	}

	#updateInput(input) {
		input.style.height = null;
		const inputStyle = getComputedStyle(input);
		input.style.height = (input.scrollHeight + parseFloat(inputStyle.borderTopWidth) + parseFloat(inputStyle.borderBottomWidth))  + 'px';
	}
}

MMX_FormInputAutoHeight.autoInit();

class MMX_FormInputRange extends MMX_Element {
	#internals;
	static formAssociated = true;

	static get props () {
		return {
			name: {
				allowAny: true,
				default: ''
			},
			min: {
				allowAny: true,
				isNumeric: true,
				default: 0
			},
			max: {
				allowAny: true,
				isNumeric: true,
				default: 0
			},
			step: {
				allowAny: true,
				isNumeric: true,
				default: 1
			},
			high: {
				allowAny: true,
				isNumeric: true,
				default: 0
			},
			low: {
				allowAny: true,
				isNumeric: true,
				default: 0
			},
			label: {
				allowAny: true,
				default: 'to'
			},
			formatter: {
				allowAny: true
			},
			'format-rounding': {
				isBoolean: true,
				default: true
			}
		};
	}

	constructor() {
		super();
		this.makeShadow();
		this.#internals = this.attachInternals();
		this.#setFormValue();
		this.#bindComponentEvents();
	}

	styleResourceCodes = ['mmx-base', 'mmx-forms'];
	renderUniquely = true;

	render() {
		const min = this.getPropValue('min');
		const max = this.getPropValue('max');
		const step = this.getPropValue('step');
		const low = this.getPropValue('low') || min;
		const high = this.getPropValue('high') || max;

		return /*html*/`
			<div
				class="mmx-form-input-range"
				part="wrapper"
			>
				<div part="slider" class="mmx-form-input-range__slider">
					<div part="track" class="mmx-form-input-range__track">
						<div part="slider-background" class="mmx-form-input-range__slider-background"></div>
						<div part="slider-selection" class="mmx-form-input-range__slider-selection"></div>
						<button id="slider-low" part="slider-button slider-low" type="button" class="mmx-form-input-range__slider-button mmx-form-input-range__slider-low"></button>
						<button id="slider-high" part="slider-button slider-high" type="button" class="mmx-form-input-range__slider-button mmx-form-input-range__slider-high"></button>
					</div>
				</div>
				<div part="controls" class="mmx-form-input-range__controls">
					<input
						type="number"
						id="input-low"
						part="input input-low"
						class="mmx-form-input-range__input mmx-form-input-range__input-low mmx-form-input"
						step="${MMX.encodeEntities(step)}"
						min="${MMX.encodeEntities(min)}"
						max="${MMX.encodeEntities(max)}"
						value="${MMX.encodeEntities(low)}"
					/>
					<label
						for="input-low"
						part="input-label input-label-low"
						class="mmx-form-input-range__input-label mmx-form-input-range__input-label-low"
					>
						${MMX.encodeEntities(this.#formatValue(low))}
					</label>
					<div
						part="input input-label"
						class="mmx-form-input-range__label"
					>
						${MMX.encodeEntities(this.getPropValue('label'))}
					</div>
					<input
						type="number"
						id="input-high"
						part="input input-high"
						class="mmx-form-input-range__input mmx-form-input-range__input-high mmx-form-input"
						step="${MMX.encodeEntities(step)}"
						min="${MMX.encodeEntities(min)}"
						max="${MMX.encodeEntities(max)}"
						value="${MMX.encodeEntities(high)}"
					/>
					<label
						for="input-high"
						part="input-label input-label-high"
						class="mmx-form-input-range__input-label mmx-form-input-range__input-label-high"
					>
						${MMX.encodeEntities(this.#formatValue(high))}
					</label>
				</div>
			</div>
		`;
	}

	afterRender() {
		this.#setFormValue();
		this.#updateSlider();
		this.#bindEvents();
	}

	// Events
	#bindComponentEvents() {
		window.addEventListener('mousemove', (e) => this.#onPointerMoveWindow(e));
		window.addEventListener('touchmove', (e) => this.#onPointerMoveWindow(e));
		window.addEventListener('pointerup', () => this.#onPointerUpWindow());
	}

	#bindEvents() {
		this.addEventListener('input', (e) => {
			this.#onInput(e);
		});

		this.#sliderLow().addEventListener('pointerdown', (e) => this.#onPointerDownSliderButton(e));
		this.#sliderHigh().addEventListener('pointerdown', (e) => this.#onPointerDownSliderButton(e));
	}

	// Events: Slider
	#activeSlider;

	#onPointerUpWindow() {
		this.#activeSlider = undefined;
	}

	#onPointerMoveWindow(e) {
		const isClicking = e instanceof MouseEvent ? e.buttons === 1 : true;

		if (isClicking && this.#activeSlider instanceof HTMLElement) {
			this.#onPointerMoveSliderButton(e);
		}
	}

	#onPointerDownSliderButton(e) {
		this.#activeSlider = e.target;
	}

	#onPointerMoveSliderButton(e) {
		const state = this.#getStateOfRange({
			min: this.#slider().offsetLeft,
			max: this.#slider().offsetLeft + this.#slider().offsetWidth,
			low: e.touches?.[0]?.pageX ?? e.x,
			high: e.touches?.[0]?.pageX ?? e.x
		});

		// Move Button
		const button = this.#activeSlider;
		button.style.left = this.#createPercent(state.relativeLow, state.range);

		// Determine Value
		const value = parseInt(((state.relativeLow / state.range) * (this.max - this.min) + this.min));

		if (button.id === 'slider-low') {
			this.low = value;
		}
		else if (button.id === 'slider-high') {
			this.high = value;
		}
	}

	#onInput() {
		this.#setFormValue();
		this.#updateSlider();
	}

	// Public Values
	#setFormValue() {
		this.#setValidity();
		const formData = new FormData();
		formData.append(this.name, this.value);
		this.#internals.setFormValue(formData);
	}

	#setValidity() {
		if (this.#inputLow()?.validity?.valid === false) {
			this.#validationMessage = this.#inputLow().validationMessage;
			this.#internals.setValidity(this.#inputLow().validity, this.#validationMessage);
			return;
		}

		if (this.#inputHigh()?.validity?.valid === false) {
			this.#validationMessage = this.#inputHigh().validationMessage;
			this.#internals.setValidity(this.#inputHigh().validity, this.#validationMessage);
			return;
		}

		this.#validationMessage = '';
		this.#internals.setValidity({});
	}

	checkValidity() {
		return this.#internals.checkValidity();
	}

	reportValidity() {
		return this.#internals.reportValidity();
	}

	setValidity(...args) {
		return this.#internals.setValidity(...args);
	}

	#validationMessage = '';

	get validationMessage() {
		return this.#validationMessage;
	}

	get validity() {
		return this.#internals.validity;
	}

	get name() {
		return this.getPropValue('name');
	}

	get value() {
		const low = this.low > this.high ? this.high : this.low;
		const high = this.high < this.low ? this.low : this.high;

		return `${low}-${high}`;
	}

	get low() {
		const value = this.#inputLow()?.valueAsNumber;
		return isNaN(value) ? this.getPropValue('min') : value;
	}

	set low(value) {
		this.#setInputValue(this.#inputLow(), value);
	}

	get high() {
		const value = this.#inputHigh()?.valueAsNumber;
		return isNaN(value) ? this.getPropValue('max') : value;
	}

	set high(value) {
		this.#setInputValue(this.#inputHigh(), value);
	}

	get max() {
		return this.getPropValue('max');
	}

	get min() {
		return this.getPropValue('min');
	}

	#setInputValue(input, value) {
		input.value = value;

		if (input.validity.rangeOverflow || input.validity.stepMismatch){
			input.stepDown();
		}
		else if (input.validity.rangeUnderflow){
			input.stepUp();
		}

		const inputEvent = new Event('input', {
			bubbles: true,
			composed: true
		});

		input.dispatchEvent(inputEvent);

		return input.value;
	}

	// Inputs
	#inputLow() {
		return this.shadowRoot.querySelector('[part~="input-low"]');
	}

	#inputHigh() {
		return this.shadowRoot.querySelector('[part~="input-high"]');
	}

	// Input Label
	#inputLabelLow() {
		return this.shadowRoot.querySelector('[part~="input-label-low"]');
	}

	#inputLabelHigh() {
		return this.shadowRoot.querySelector('[part~="input-label-high"]');
	}

	// Slider
	#slider() {
		return this.shadowRoot.querySelector('[part~="slider"]');
	}

	#sliderLow() {
		return this.shadowRoot.querySelector('[part~="slider-low"]');
	}

	#sliderHigh() {
		return this.shadowRoot.querySelector('[part~="slider-high"]');
	}

	#sliderSelection() {
		return this.shadowRoot.querySelector('[part~="slider-selection"]');
	}

	#createPercent(numerator, denominator) {
		return `${(numerator / denominator) * 100}%`;
	}

	#getStateOfRange ({low = 0, high = 0, min = 0, max = 0} = {}) {
		let actualLow = low > high ? high : low;
		let actualHigh = high < low ? low : high;

		if (actualLow < min) {
			actualLow = min;
		}

		if (actualHigh > max) {
			actualHigh = max;
		}

		const range = max - min;
		const relativeLow = actualLow - min;
		const relativeHigh =  actualHigh - min;

		return {
			low: actualLow,
			high: actualHigh,
			min,
			max,
			range,
			relativeLow,
			relativeHigh,
		};
	}

	#updateSlider() {
		const state = this.#getStateOfRange(this);

		// Slider Buttons
		this.#sliderLow().style.left = this.#createPercent(state.relativeLow, state.range);
		this.#sliderHigh().style.left = this.#createPercent(state.relativeHigh, state.range);

		// Selection
		this.#sliderSelection().style.left = this.#createPercent(state.relativeLow, state.range);
		this.#sliderSelection().style.right = this.#createPercent(state.range - state.relativeHigh, state.range);

		// Label Text
		this.#inputLabelLow().innerText = this.#formatValue(this.low);
		this.#inputLabelHigh().innerText = this.#formatValue(this.high);
	}

	#formatValue(value = '') {
		return window[this.getPropValue('formatter')]?.(value, this.getPropValue('format-rounding')) ?? value;
	}
}

if (!customElements.get('mmx-form-input-range')) {
	customElements.define('mmx-form-input-range', MMX_FormInputRange);
}