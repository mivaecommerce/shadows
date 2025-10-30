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
						<button id="slider-low" title="Low" part="slider-button slider-low" type="button" class="mmx-form-input-range__slider-button mmx-form-input-range__slider-low"></button>
						<button id="slider-high" title="High" part="slider-button slider-high" type="button" class="mmx-form-input-range__slider-button mmx-form-input-range__slider-high"></button>
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
			this.#internals.setValidity(this.#inputLow().validity, this.#inputLow().validationMessage);
			return;
		}

		if (this.#inputHigh()?.validity?.valid === false) {
			this.#internals.setValidity(this.#inputHigh().validity, this.#inputHigh().validationMessage);
			return;
		}

		this.#internals.setValidity({}, '');
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

	get validationMessage() {
		return this.#internals.validationMessage;
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
		this.#inputLabelLow().innerHTML = this.#formatValue(this.low);
		this.#inputLabelHigh().innerHTML = this.#formatValue(this.high);
	}

	#formatValue(value = '') {
		return window[this.getPropValue('formatter')]?.(value, this.getPropValue('format-rounding')) ?? value;
	}
}

if (!customElements.get('mmx-form-input-range')) {
	customElements.define('mmx-form-input-range', MMX_FormInputRange);
}

class MMX_FormInputQuantity extends MMX_Element {
	#internals;
	static formAssociated = true;

	static get props () {
		return {
			name: {
				allowAny: true,
				default: ''
			},
			value: {
				allowAny: true,
				isNumeric: true,
				default: 1
			},
			min: {
				allowAny: true,
				isNumeric: true,
				default: 1
			},
			max: {
				allowAny: true,
				isNumeric: true
			},
			step: {
				allowAny: true,
				isNumeric: true,
				default: 1
			},
			size: {
				options: ['xs', 's', 'm', 'l'],
				default: 'm'
			}
		};
	}

	constructor() {
		super();
		this.makeShadow();
		this.#internals = this.attachInternals();
		this.#setFormValue();
	}

	styleResourceCodes = ['mmx-base', 'mmx-forms'];
	renderUniquely = true;

	render() {
		const min = this.getPropValue('min');
		const max = this.getPropValue('max');
		const step = this.getPropValue('step');
		const value = this.getPropValue('value');
		const disabled = this.disabled ? 'disabled' : '';
		const required = this.required ? 'required' : '';

		return /*html*/`
			<div
				class="mmx-form-input-quantity mmx-form-input-quantity__size--${this.getPropValue('size')}"
				part="wrapper"
			>
				<button
					type="button"
					id="decrease"
					part="button decrease"
					class="mmx-form-input-quantity__control mmx-form-input-quantity__button"
					title="Decrease Quantity"
					${disabled}
				>
					<mmx-icon data-name="subtract"></mmx-icon>
				</button>
				<input
					type="number"
					id="quantity"
					part="input quantity"
					class="mmx-form-input-quantity__control mmx-form-input-quantity__input"
					aria-label="Quantity Amount"
					step="${MMX.encodeEntities(step)}"
					min="${MMX.encodeEntities(min)}"
					max="${MMX.encodeEntities(max)}"
					value="${MMX.encodeEntities(value)}"
					${disabled}
					${required}
				/>
				<button
					type="button"
					id="increase"
					part="button increase"
					class="mmx-form-input-quantity__control mmx-form-input-quantity__button"
					title="Increase Quantity"
					${disabled}
				>
					<mmx-icon data-name="add"></mmx-icon>
				</button>
			</div>
		`;
	}

	afterRender() {
		this.#handleChanges();
		this.#bindEvents();
	}

	#handleChanges() {
		this.#setFormValue();
		this.#updateButtons();
	}

	// Elements
	#inputQuantity() {
		return this.shadowRoot.querySelector('[part~="quantity"]');
	}

	#increaseButton() {
		return this.shadowRoot.querySelector('[part~="increase"]');
	}

	#decreaseButton() {
		return this.shadowRoot.querySelector('[part~="decrease"]');
	}

	// Events
	#bindEvents() {
		this.addEventListener('input', (e) => {
			this.#onInput(e);
		});

		this.#increaseButton().addEventListener('click', () => {
			this.#increaseQuantity();
		});

		this.#decreaseButton().addEventListener('click', () => {
			this.#decreaseQuantity();
		});
	}

	#onInput() {
		this.#handleChanges();
	}

	// Public Values
	#setFormValue() {
		this.#setValidity();
		const formData = new FormData();
		formData.append(this.name, this.value);
		this.#internals.setFormValue(formData);
	}

	#setValidity() {
		if (this.#inputQuantity()?.validity?.valid === false) {
			this.#internals.setValidity(this.#inputQuantity().validity, this.#inputQuantity().validationMessage);
			return;
		}

		this.#internals.setValidity({}, '');
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

	get validationMessage() {
		return this.#internals.validationMessage;
	}

	get validity() {
		return this.#internals.validity;
	}

	get name() {
		return this.getPropValue('name');
	}

	get disabled() {
		return this.hasAttribute('disabled');
	}

	set disabled(disabled) {
		disabled = Boolean(disabled);

		if (disabled) {
			this.setAttribute('disabled', '');
		}
		else {
			this.removeAttribute('disabled');
		}

		this.#updateButtons();
		this.#inputQuantity().disabled = disabled;

		return disabled;
	}

	get required() {
		return this.hasAttribute('required');
	}

	get max() {
		return this.getPropValue('max');
	}

	get min() {
		return this.getPropValue('min');
	}

	get value() {
		return this.#inputQuantity()?.value ?? '';
	}

	get valueAsNumber() {
		return this.#inputQuantity()?.valueAsNumber;
	}

	set value(value) {
		const inputQuantity = this.#inputQuantity();

		inputQuantity.value = value;

		if (isNaN(inputQuantity.valueAsNumber) || inputQuantity.validity.quantityOverflow || inputQuantity.validity.stepMismatch){
			inputQuantity.stepDown();
		}
		else if (inputQuantity.validity.quantityUnderflow){
			inputQuantity.stepUp();
		}

		this.#dispatchInputEvent();
	}

	// Methods
	#dispatchInputEvent() {
		const inputEvent = new Event('input', {
			bubbles: true,
			composed: true
		});

		this.#inputQuantity().dispatchEvent(inputEvent);
	}

	#increaseQuantity() {
		this.#inputQuantity().stepUp();
		this.#dispatchInputEvent();
	}

	#decreaseQuantity() {
		this.#inputQuantity().stepDown();
		this.#dispatchInputEvent();
	}

	#updateButtons() {
		this.#decreaseButton().disabled = this.disabled || Number(this.value) === Number(this.min);
		this.#increaseButton().disabled = this.disabled || Number(this.value) === Number(this.max);
	}
}

if (!customElements.get('mmx-form-input-quantity')) {
	customElements.define('mmx-form-input-quantity', MMX_FormInputQuantity);
}

class MMX_Combobox extends MMX_Element {
	#value = '';
	#dispatchedValue = '';
	#option = {};
	#options = [];
	#internals;
	static formAssociated = true;

	static get props () {
		return {
			name: {
				allowAny: true,
				default: ''
			},
			label: {
				allowAny: true,
				default: 'Please select an option'
			},
			value: {
				allowAny: true,
				default: ''
			},
			size: {
				options: ['xs', 's', 'm', 'l'],
				default: 'm'
			},
			minimal: {
				isBoolean: true,
				default: false
			},
			options: {
				isObject: true,
				isJson: true,
				options: [
					'script',
					'innerHTML'
				],
				default: null
			}
		};
	}

	constructor() {
		super();
		this.makeShadow();
		this.#internals = this.attachInternals();
		this.#bindEvents();
		this.#setOptions();
		this.#setValue(this.getPropValue('value'));
		this.#dispatchedValue = this.#value;
	}

	styleResourceCodes = ['mmx-base', 'mmx-forms'];
	renderUniquely = true;

	// Render Methods
	render() {
		const value = this.#value;
		const label = this.getPropValue('label');
		const disabled = this.disabled ? 'disabled' : '';
		const minimal = this.getPropValue('minimal') === true ? 'minimal' : 'regular';

		return /*html*/`
			<div
				id="wrapper"
				part="wrapper"
				class="mmx-combobox"
			>
				<div
					id="select"
					part="select"
					class="mmx-combobox__select mmx-form-select mmx-form-input--${minimal}"
					${disabled}
				>
					<button
						id="select-button"
						part="select-button input"
						class="mmx-combobox__select-button mmx-form-select__dropdown"
						popovertarget="popover"
						type="button"
						${disabled}
					>
						${MMX.encodeEntities(this.#getSelectButtonLabel())}
					</button>
				</div>
				<div
					id="popover"
					part="popover"
					class="mmx-combobox__popover"
					popover
				>
					<input
						id="search"
						part="search input"
						role="combobox"
						class="mmx-combobox__search mmx-form-input"
						type="search"
						aria-controls="listbox"
						aria-haspopup="listbox"
						aria-autocomplete="list"
						aria-expanded="true"
						aria-label="${MMX.encodeEntities(label)}"
						value="${MMX.encodeEntities(value)}"
						autocomplete="off"
						autofocus
					/>
					<button
						id="hide-popover"
						part="hide-popover input"
						class="mmx-combobox__hide-popover mmx-form-select__picker-icon"
						type="button"
						popovertarget="popover"
						popovertargetaction="hide"
						title="Close options"
						tabindex="-1"
					>
					</button>
					<ul
						id="listbox"
						part="listbox"
						role="listbox"
						class="mmx-combobox__listbox"
						tabindex="-1"
					>
						${this.#renderListBoxOptions()}
					</ul>
				</div>
			</div>
		`;
	}

	#getSelectButtonLabel() {
		return this.#value.length ? this.#value : this.getPropValue('label');
	}

	#renderListBoxOptions() {
		return this.#renderListBoxOptionLabel() + this.#options.map(option => {
			return this.#renderListBoxOption(option);
		}).join('');
	}

	#renderListBoxOptionLabel() {
		if (this.#search()?.value?.length) {
			return '';
		}

		return /*html*/`
			<li
				part="option"
				role="option"
				class="mmx-combobox__option mmx-combobox__option--label"
				aria-selected="false"
				disabled
			>
				${MMX.encodeEntities(this.getPropValue('label'))}
			</li>
		`;
	}

	#renderListBoxOption(option = {}) {
		const match = this.#determineOptionMatch(option);
		const ariaSelected = match?.CEQ === true ? true : false;
		const searchIsActiveElement = this.shadowRoot.activeElement === this.#search();
		const hidden = searchIsActiveElement && match?.CIN === false ? 'hidden' : '';

		return /*html*/`
			<li
				id="option-${MMX.encodeEntities(option.index)}"
				data-option-index="${MMX.encodeEntities(option.index)}"
				part="option"
				role="option"
				class="mmx-combobox__option"
				aria-selected="${ariaSelected}"
				${hidden}
			>
				${MMX.encodeEntities(option.prompt)}
			</li>
		`;
	}

	afterRender() {
		this.#setFormValue();
		this.#bindRenderEvents();
		this.#updatePopoverLocation();
	}

	#updateListBox() {
		if (!this.#listBox()) {
			return;
		}

		this.#listBox().innerHTML = this.#renderListBoxOptions();
		this.#bindListBoxOptionEvents();
		this.#scrollOptionIntoView();
	}

	// Attributes
	static get observedAttributes() {
		return ['disabled', 'required', ...this.propsToAttributeNames];
	}

	// Elements
	#select() {
		return this.shadowRoot.getElementById('select');
	}

	#selectButton() {
		return this.shadowRoot.getElementById('select-button');
	}

	#popover() {
		return this.shadowRoot.getElementById('popover');
	}

	#search() {
		return this.shadowRoot.getElementById('search');
	}

	#listBox() {
		return this.shadowRoot.getElementById('listbox');
	}

	#listBoxOptions() {
		return this.shadowRoot.querySelectorAll('[part~="option"]');
	}

	#selectedListBoxOption() {
		return this.shadowRoot.querySelector('[part~="option"][aria-selected="true"]');
	}

	#availableListBoxOptions() {
		return this.shadowRoot.querySelectorAll('[part~="option"]:not([hidden], [disabled])');
	}

	// Events
	#bindEvents() {
		this.addEventListener('focus', e => {
			this.#onFocus(e);
		});

		this.addEventListener('blur', e => {
			this.#onBlur(e);
		});

		this.addEventListener('keydown', e => {
			this.#onKeyDown(e);
		});
	}

	#bindRenderEvents() {
		this.#search().addEventListener('keyup', e => {
			this.#onSearchKeyUp(e);
		});

		this.#search().addEventListener('input', e => {
			this.#onSearchInput(e);
		});

		this.#bindListBoxOptionEvents();
		this.#bindAnchorPositionPolyfill();
	}

	#bindListBoxOptionEvents() {
		this.#listBoxOptions()?.forEach(option => {
			option.addEventListener('click', e => {
				this.#onOptionClick({option, e});
			});
		});
	}

	#onSearchKeyUp(e) {
		if (e.key === 'Enter') {
			this.#onSearchKeyUpEnter();
		}
	}

	#onSearchKeyUpEnter() {
		const option = this.#selectedListBoxOption();

		if (!(option instanceof HTMLElement)) {
			return;
		}

		this.#setValueFromListBoxOption(option);
	}

	#onSearchInput(e) {
		if (e.key === 'Enter') {
			return;
		}

		this.#updateListBox();
		this.#setValue(this.#search().value);
	}

	#onFocus(e) {
		this.showPopover();
	}

	#onBlur(e) {
		this.hidePopover();

		if (this.#search().value !== this.#dispatchedValue) {
			this.#dispatchEvents();
		}
	}

	#onOptionClick({option, e}) {
		this.#setValueFromListBoxOption(option);
	}

	#onKeyDown(e) {
		const activeElement = e.target.shadowRoot.activeElement;
		const isOption = activeElement.part.contains('option');
		const isSearch = activeElement.id === 'search';
		const isSelectButton = activeElement.id === 'select-button';

		switch(e.key) {
			case 'ArrowDown':
				if (isOption || isSearch) {
					this.#onSearchKeyDownArrowDown(e);
				}
				else if (isSelectButton) {
					this.#onSelectButtonKeyDown(e);
				}
				break;
			case 'ArrowUp':
				if (isOption || isSearch) {
					this.#onSearchKeyDownArrowUp(e);
				}
				else if (isSelectButton) {
					this.#onSelectButtonKeyDown(e);
				}
				break;
			case 'Escape':
				if (isSearch) {
					this.#onSearchKeyDownEscape(e);
				}
				break;
		}
	}

	#onSelectButtonKeyDown(e) {
		this.showPopover();
		this.#search().focus();
	}

	#onSearchKeyDownArrowDown(e) {
		e.preventDefault();
		this.#selectNextListBoxOption();
	}

	#onSearchKeyDownArrowUp(e) {
		e.preventDefault();
		this.#selectPreviousListBoxOption();
	}

	#onSearchKeyDownEscape(e) {
		this.#setValue('');
		this.#selectButton().focus();
	}

	// UI Interaction Methods
	#selectNextListBoxOption() {
		this.#moveSelectedListBoxOption(1);
	}

	#selectPreviousListBoxOption() {
		this.#moveSelectedListBoxOption(-1);
	}

	#moveSelectedListBoxOption(amount = 1) {
		const selectedOptionIndex = Array.from(this.#availableListBoxOptions()).indexOf(this.#selectedListBoxOption());
		const availableListBoxOptionsLength = this.#availableListBoxOptions()?.length ?? 0;

		let newIndex = selectedOptionIndex + MMX.coerceNumber(amount, 1);

		if (newIndex > availableListBoxOptionsLength - 1) {
			newIndex = 0;
		} else if (newIndex < 0) {
			newIndex = availableListBoxOptionsLength - 1;
		}

		this.#selectListBoxOption(this.#availableListBoxOptions()?.[newIndex]);
	}

	#selectListBoxOption(option) {
		if (!(option instanceof HTMLElement)) {
			this.#setActiveDescendant(null);
			return;
		}

		const selectedOption = this.#selectedListBoxOption();

		if (selectedOption) {
			selectedOption.ariaSelected = false;
		}

		option.ariaSelected = true;
		this.#setActiveDescendant(option);
		this.#scrollOptionIntoView(option);
	}

	#scrollOptionIntoView(option = this.#availableListBoxOptions()?.[0]) {
		option?.scrollIntoView?.({block: 'nearest'});
	}

	#setActiveDescendant(option) {
		if (!(option instanceof HTMLElement)) {
			this.#search().removeAttribute('aria-activedescendant');
			return;
		}

		this.#search().setAttribute('aria-activedescendant', option.id);
	}

	#setValueFromListBoxOption(listBoxOption) {
		this.#selectListBoxOption(listBoxOption);
		const option = this.#getOptionFromListBoxOption(listBoxOption);
		this.#setValue(option?.prompt);
		this.hidePopover();
		this.#selectButton().focus();
		this.#dispatchEvents();
	}

	#getOptionFromListBoxOption(listBoxOption) {
		const optionIndex = this.#getListBoxOptionIndex(listBoxOption);
		return this.#options[optionIndex];
	}

	#getListBoxOptionIndex(option) {
		return MMX.coerceNumber(option?.dataset?.optionIndex, -1);
	}

	// Value Methods
	get value() {
		return this.#value;
	}

	set value(value) {
		this.#setValue(value);
	}

	#setValue(value) {
		this.#value = MMX.coerceString(value);
		this.#option = this.#findOptionByPrompt(this.#value);

		if (this.#search()) {
			this.#search().value = this.#value;
		}

		if (this.#selectButton()) {
			this.#selectButton().textContent = this.#getSelectButtonLabel();
		}

		this.#updateListBox();
		this.#setFormValue();
	}

	#dispatchEvents() {
		this.#dispatchedValue = this.#value;

		const eventOptions = {
			bubbles: true,
			composed: true
		};

		this.dispatchEvent(new Event('input', eventOptions));
		this.dispatchEvent(new Event('change', eventOptions));
	}

	// Option Methods
	get selectedOption() {
		return this.#option;
	}

	setOptions(options = []) {
		this.#setOptions(options);
		this.#setValue(this.#value);
		this.#updateListBox();
	}

	#setOptions(options = this.getPropValue('options')) {
		options = Array.isArray(options) ? options : [];
		let index = 0;

		this.#options = options.reduce((options, option) => {
			if (typeof option === 'string') {
				options.push({
					prompt: option,
					value: option,
					index: index++
				});
			}
			else if (typeof option === 'object' && option !== null) {
				const prompt = MMX.coerceString(option.prompt);
				const value = MMX.coerceString(option.value ?? prompt);

				options.push({
					prompt,
					value,
					index: index++
				});
			}

			return options;
		}, []);
	}

	#determineOptionMatch(option = {}) {
		if (!this.value) {
			return null;
		}

		const result = {
			value: {
				CIN: this.#determineValueCIN(option.value, this.value),
				CEQ: this.#determineValueCEQ(option.value, this.value)
			},
			prompt: {
				CIN: this.#determineValueCIN(option.prompt, this.value),
				CEQ: this.#determineValueCEQ(option.prompt, this.value)
			}
		};

		result.CIN = result.value.CIN || result.prompt.CIN;
		result.CEQ = result.value.CEQ || result.prompt.CEQ;

		return result;
	}

	#determineValueCIN(haystack = '', needle = '') {
		return haystack.toLowerCase().includes(needle.toLowerCase());
	}

	#determineValueCEQ(a = '', b = '') {
		return a.toLowerCase() === b.toLowerCase();
	}

	#findOptionByValue(value = '') {
		return this.#options.find(option => {
			return this.#determineValueCEQ(option.value, value);
		});
	}

	#findOptionByPrompt(prompt = '') {
		return this.#options.find(option => {
			return this.#determineValueCEQ(option.prompt, prompt);
		});
	}

	#setValueFromOption(option = {}) {
		const value = typeof option?.value === 'string' ? option.value : '';
		this.#setValue(value);
		this.#dispatchEvents();
	}

	// Form Methods
	#setFormValue() {
		this.#setValidity();
		const formData = new FormData();
		formData.append(this.name, this.value);
		this.#internals.setFormValue(formData);
	}

	#setValidity() {
		const hasValue = this.value.trim().length > 0;
		const hasOption = Boolean(this.#option);
		const isMissing = this.required && !hasValue;
		const isInvalidSelection = hasValue && !hasOption; // user typed something not in list
		const selectButton = this.#selectButton() ?? undefined;

		if (isMissing) {
			this.#internals.setValidity({ valueMissing: true }, 'Please select an option.', selectButton);
		}
		else if (isInvalidSelection) {
			this.#internals.setValidity({ customError: true }, 'Please select a valid option.', selectButton);
		}
		else {
			this.#internals.setValidity({});
		}
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

	get validationMessage() {
		return this.#internals.validationMessage;
	}

	get validity() {
		return this.#internals.validity;
	}

	get name() {
		return this.getPropValue('name');
	}

	get disabled() {
		return this.hasAttribute('disabled');
	}

	set disabled(disabled) {
		disabled = Boolean(disabled);

		if (disabled) {
			this.setAttribute('disabled', '');
		}
		else {
			this.removeAttribute('disabled');
		}

		this.#select().disabled = disabled;
		this.#selectButton().disabled = disabled;
		this.#search().disabled = disabled;
	}

	get required() {
		return this.hasAttribute('required');
	}

	// Misc. Public Methods
	focus() {
		this.showPopover();
		this.#search().focus();
	}

	get selectedIndex() {
		return this.#options.findIndex(option => {
			return this.#determineValueCEQ(option.prompt, this.#value);
		});
	}

	set selectedIndex(index) {
		const option = this.#options[index];
		this.#setValueFromOption(option);
	}

	selectValue(value) {
		const option = this.#findOptionByValue(value);
		this.#setValueFromOption(option);
	}

	selectPrompt(prompt) {
		const option = this.#findOptionByPrompt(prompt);
		this.#setValueFromOption(option);
	}

	showPopover() {
		this.#selectButton().inert = true;
		this.#updatePopoverLocation();
		this.#popover()?.showPopover?.({
			source: this.#selectButton()
		});
		this.#scrollOptionIntoView(this.#selectedListBoxOption());
	}

	hidePopover() {
		this.#popover()?.hidePopover?.();
		this.#selectButton().inert = false;
	}

	// Anchor Positioning Polyfill
	#bindAnchorPositionPolyfill() {
		if (this.#supportsAnchorPositioning()) {
			return;
		}

		window.addEventListener('resize', () => {
			this.#updatePopoverLocation();
		});

		window.addEventListener('scroll', () => {
			this.#updatePopoverLocation();
		});
	}

	#supportsAnchorPositioning() {
		return CSS.supports('justify-self', 'anchor-center');
	}

	#updatePopoverLocation() {
		if (this.#supportsAnchorPositioning()) {
			return;
		}

		this.#positionElementToAnchor(this.#popover(), this);
	}

	#positionElementToAnchor(element, anchor, root = document.body) {
		if (!(element instanceof HTMLElement) || !(anchor instanceof HTMLElement)) {
			return;
		}

		const anchorRect = anchor.getBoundingClientRect();
		const rootRect = root.getBoundingClientRect();
		const overflowY = window.getComputedStyle(root)?.overflowY;
		const scrollFromTop = ((overflowY === 'scroll' || overflowY === 'auto') ? root.scrollTop : 0);

		element.style.position = 'absolute';
		element.style.top = ((anchorRect.top - rootRect.top) - scrollFromTop) + 'px';
		element.style.left = (anchorRect.left - rootRect.left) + 'px';
		element.style.width = (anchorRect.width) + 'px';
	}
}

if (!customElements.get('mmx-combobox')) {
	customElements.define('mmx-combobox', MMX_Combobox);
}