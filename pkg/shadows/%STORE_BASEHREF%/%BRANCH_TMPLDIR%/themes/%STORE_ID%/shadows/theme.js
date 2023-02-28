/**
 * Use this file to all in scripts and functions you would like to have globally or on specific
 * pages. You will use this to extend your theme instead of adding code to the core framework files.
 */
const themeFunctionality = {
	global() {
		/**
		 * Add `ID`, `CLASS`, and `aria-describedby` attributes to `INPUT` and `SELECT` elements
		 * dynamically created by Miva, where needed.
		 */
		let mvtInputWraps = document.querySelectorAll('[data-hook~="mvt-input"]');
		let mvtSelectWraps = document.querySelectorAll('[data-hook~="mvt-select"]');
		let styleMVT = function styleMVT(element, input) {
			let mvtItems = element.querySelectorAll(input);
			let attr = {
				id: element.getAttribute('data-mvt-id'),
				classes: element.getAttribute('data-mvt-classlist'),
				description: element.getAttribute('data-mvt-describedby'),
				autocomplete: element.getAttribute('data-mvt-autocomplete')
			};

			mvtItems.forEach((mvtItem, i) => {
				if (attr.id !== null) {
					const uniqueId = i === 0 ? attr.id : `${attr.id}_${i + 1}`;
					mvtItem.setAttribute('id', uniqueId);
				}
				if (attr.classes !== null) {
					mvtItem.setAttribute('class', attr.classes);
				}
				if (attr.description !== null) {
					mvtItem.setAttribute('aria-describedby', attr.description);
				}
				if (attr.autocomplete !== null) {
					mvtItem.setAttribute('autocomplete', attr.autocomplete);
				}
			});
		};

		mvtInputWraps.forEach(element => {
			styleMVT(element, 'input');
		});


		mvtSelectWraps.forEach(element => {
			styleMVT(element, 'select');
		});

		/**
		 * Search form toggle for smaller screens
		 */
		(() => {
			const header = document.querySelector('[data-hook="site-header"]');
			const headerSearch = header.querySelector('[data-hook="site-header__search"]');
			const headerSearchToggle = header.querySelector('[data-hook="open-header-search"]');

			if (headerSearch && headerSearchToggle) {
				const headerSearchInput = headerSearch.querySelector('input');

				headerSearchToggle.addEventListener('click', () => {
					let isActive = header.classList.contains('search-is-active');

					if (!isActive) {
						header.classList.add('search-is-active');
						headerSearchInput.focus();
					}
					else {
						header.classList.remove('search-is-active');
						headerSearchToggle.focus();
					}
				});
			}
		})();

	},
	init() {
		/**
		 * Initialize the A11y-Toggle extension
		 */
		a11yToggle();
		if (_hook('global-account') && _hook('global-account').length !== 0) {
			a11yToggleClose(_hook('global-account')); // Close the global account box when clicking on a different target.
		}

		/**
		 * Initialize Quantify extension
		 */
		quantify.init(document);

		/**
		 * Initialize the Mini-Basket extension
		 */
		miniBasket?.init?.();


		/**
		 * Initialize the Transfigure Navigation extension
		 */
		$.hook('has-drop-down').transfigureNavigation();

	},
	stateDatalist() {
		/**
		 * [1] This function is an enhancement to the `datalist` State/Province and Country replacement.
		 * Since a customer can type a value in the input, this will check if the entered value
		 * matches one of the output values or text entries. If so, it passes the value back to
		 * ensure proper functionality with shipping modules, i.e. 2 letter abbreviations for
		 * US and Canada. Otherwise, it the entry is used as typed.
		 *
		 * [2] This function will toggle the HTML "required" attribute on the state field depending on
		 * which country the customer has selected. If you want to change the countries that require a
		 * state or province, you can modify the `countriesRequiringSP` entry below. If you are using
		 * the billing address as the primary, modify the `primaryAddress` variable below.
		 *
		 * @type {string[]}
		 */

		const countriesRequiringSP = ['AR', 'AU', 'BR', 'CA', 'CN', 'IN', 'ID', 'IT', 'JP', 'MX', 'TH', 'US'];
		const datalist = document.querySelectorAll('[data-datalist]');
		const primaryAddress = 'shipping';

		// [1]
		function checkOption(entry, list) {
            let datalist = document.querySelector(`#${list}`);
			let datalistOptions = datalist.querySelectorAll('option');
			let value = '';

            for (let option of datalistOptions) {
				if (entry.toLowerCase() === option.value.toLowerCase() || entry.toLowerCase() === option.text.toLowerCase()) {
					value = option.value;
				}
			}

			return value;
		}

		// [2]
		function updateRequiredStateAttributes(countrySelector, stateInput) {
			countrySelector.addEventListener('change', () => {
				let selectedCountry = countrySelector.options[countrySelector.selectedIndex].value;

				if (countriesRequiringSP.includes(selectedCountry)) {
					stateInput.setAttribute('required', '');
					stateInput.setAttribute('aria-required', 'true');
				}
				else {
					stateInput.removeAttribute('required');
					stateInput.removeAttribute('aria-required');
				}
			});
		}

		if (datalist.length > 0) {
			for (let list of datalist) {
                list.addEventListener('blur', () => {
					let thisDatalist = list.getAttribute('list');
					let checkValue = checkOption(list.value, thisDatalist);

					if (checkValue) {
						list.value = checkValue;
						list.previousElementSibling.value = checkValue;
					}
					else {
						list.previousElementSibling.value = list.value;
					}
				});
			}

			const formElement = document.querySelector('[data-validate-address]');
			const updateShippingState = document.querySelector('#shipping_selector');
			const updateBillingState = document.querySelector('#billing_selector');
			let billPrefix;
			let shipPrefix;

			if (formElement) {
				if (formElement.elements.hasOwnProperty('Action') && (formElement.elements.Action.value === 'ORDR')) {
					billPrefix = 'Bill';
					shipPrefix = 'Ship';
				}
				else if (formElement.elements.hasOwnProperty('Action') && (formElement.elements.Action.value === 'ICST' || formElement.elements.Action.value === 'UCST')) {
					billPrefix = 'Customer_Bill';
					shipPrefix = 'Customer_Ship';
				}
				else if (formElement.elements.hasOwnProperty('Action') && (formElement.elements.Action.value === 'ICSA' || formElement.elements.Action.value === 'UCSA')) {
					billPrefix = 'Address_';
					shipPrefix = 'Address_';
				}

				const shippingState = document.querySelector(`input[name="${shipPrefix}State"]`);
				const billingState = document.querySelector(`input[name="${billPrefix}State"]`);

				function updateState({nextElementSibling, value}) {
					nextElementSibling.value = value;
					nextElementSibling.blur();
				}

				if (shippingState.value !== '') {
					shippingState.nextElementSibling.value = shippingState.value;
				}
				shippingState.nextElementSibling.blur();

				if (billingState.value !== '') {
					billingState.nextElementSibling.value = billingState.value;
				}
				billingState.nextElementSibling.blur();

				if (updateShippingState !== null) {
					updateShippingState.addEventListener('change', () => {
						updateState(shippingState);
					});
				}

				if (updateBillingState !== null) {
					updateBillingState.addEventListener('change', () => {
						updateState(billingState);
					});
				}

				if (primaryAddress === 'shipping') {
					const shippingCountrySelector = document.querySelector(`#${shipPrefix}Country`);
					const shippingStateInput = document.querySelector(`#${shipPrefix}StateSelect`);

					updateRequiredStateAttributes(shippingCountrySelector, shippingStateInput);
				}
				else {
					const billingCountrySelector = document.querySelector(`#${billPrefix}Country`);
					const billingStateInput = document.querySelector(`#${billPrefix}StateSelect`);

					updateRequiredStateAttributes(billingCountrySelector, billingStateInput);
				}

				(() => {
					document.querySelector(`#${shipPrefix}Country`).dispatchEvent(new Event('change', {'bubbles': true}));
					document.querySelector(`#${billPrefix}Country`).dispatchEvent(new Event('change', {'bubbles': true}));
				})();
			}
		}
	},
    jsSFNT() {
	},
    jsCTGY() {
	},
    jsPROD() {
		/**
		 * Initialize the AJAX Add-To-Cart extension
		 */
		addToCart.init();

		/**
		 * Initialize the A11y-Tabs extension
		 */
		tabbedContent.init();
	},
    jsPLST() {
	},
    jsSRCH() {
	},
    jsBASK() {
		/**
		 * Estimate Shipping
		 */
		(document => {
			let formElement = _hook('shipping-estimate-form');

			if (formElement.length > 0) {
				let formButton = _hook('calculate-shipping-estimate', formElement);

				function createCalculation() {
					let processor = document.createElement('iframe');

					processor.id = 'calculate-shipping';
					processor.name = 'calculate-shipping';
					processor.style.display = 'none';
					formElement.before(processor);
					processor.addEventListener('load', () => {
						displayResults(processor);
					});
					formElement.submit();
				}

				function displayResults(source) {
					let content = source.contentWindow.document.body.innerHTML;

					_hook('shipping-estimate-fields', formElement).classList.add('u-hidden');
					_hook('shipping-estimate-results', formElement).innerHTML = content;
					_hook('shipping-estimate-recalculate', formElement).classList.remove('u-hidden');
					formElement.setAttribute('data-status', 'idle');

					_hook('shipping-estimate-recalculate', formElement).addEventListener('click', () => {
						_hook('shipping-estimate-recalculate', formElement).classList.add('u-hidden');
						_hook('shipping-estimate-results', formElement).innerHTML = '';
						_hook('shipping-estimate-fields', formElement).classList.remove('u-hidden');
					});

					setTimeout(
						() => {
							source.parentNode.removeChild(source);
						}, 1
					);
				}

				formButton.addEventListener('click', event => {
					event.preventDefault();
					createCalculation();
				}, false);
			}
		})(document);
	},
    jsORDL() {
		document.addEventListener('click', event => {
			if (!event.target.hasAttribute('data-disclosure')) return;

			const target = event.target;
			const targetContent = document.querySelector(`#${target.getAttribute('aria-controls')}`);
			const sibling = target.parentNode.querySelector('[data-disclosure].u-hidden');
			const siblingContent = document.querySelector(`#${sibling.getAttribute('aria-controls')}`);

			if (!targetContent) return;

			sibling.setAttribute('aria-expanded', 'true');
			sibling.classList.remove('u-hidden');
			siblingContent.classList.add('u-hidden');
			target.setAttribute('aria-expanded', 'false');
			target.classList.add('u-hidden');
			targetContent.classList.remove('u-hidden');
		});
	},
    jsOCST() {
		themeFunctionality.stateDatalist();
	},
    jsOSEL() {
	},
    jsOPAY() {
		/**
		 * Added functionality to help style the default Miva output payment
		 * fields.
		 */
		document.querySelectorAll('[data-hook="mvt-input"]').forEach(mvtInput => {
			let dataHook = mvtInput.getAttribute('data-datahook');

			if (dataHook) {
				mvtInput.querySelector('input').setAttribute('data-hook', dataHook);
			}
		});

		document.querySelectorAll('[data-hook="mvt-select"]').forEach(mvtSelect => {
			mvtSelect.querySelectorAll('select').forEach(select => {
				let wrapDiv = document.createElement('div');

				wrapDiv.classList.add('c-form-select');
				select.parentNode.insertBefore(wrapDiv, select);
				wrapDiv.appendChild(select);

				if (wrapDiv.nextSibling.nodeType === 3) {
					wrapDiv.nextSibling.remove();
				}
			});
		});

		/**
		 * Credit Card Detection
		 */
		(() => {
			let creditCardInput = document.querySelector('[data-hook="detect-card"]');

			if (creditCardInput !== null) {
				['input', 'paste'].forEach(event => {
					creditCardInput.addEventListener(event, function () {
						let cardInput = this;

						if (isNaN(this.value)) {
							this.classList.add('has-error');
						}

						paymentMethod.detect(this, paymentDetected => {
							if (paymentDetected && supportedPaymentMethods.findPaymentMethod(paymentDetected.name)) {
								cardInput.classList.remove('has-error');
								_hook('payment-method-display').textContent = paymentDetected.display;
								_hook('payment-method').value = supportedPaymentMethods.findPaymentMethod(paymentDetected.name);
							}
							else {
								cardInput.classList.add('has-error');
							}
						});

					});
				});
			}
		})();
	},
    jsINVC() {
		const toggle = _hook('toggle-login-options');

		if (toggle.length !== 0) {
			const defaultCheck = toggle.querySelector('[data-toggle-login-check]');
			const wrap = toggle.querySelector('[data-toggle-login-email-wrap]');
			const emailInput = wrap.querySelector('[data-toggle-login-email]');

			defaultCheck.addEventListener('change', event => {
				if (event.target.checked) {
					wrap.hidden = true;
					emailInput.setAttribute('disabled', '');
				}
				else {
					wrap.hidden = false;
					emailInput.removeAttribute('disabled');
					emailInput.focus();
				}
			});
		}

		_hook('print-invoice').addEventListener('click', element => {
			element.preventDefault();
			window.print();
		});
	},
    jsLOGN() {
	},
    jsACAD() {
		themeFunctionality.stateDatalist();
	},
    jsACED() {
		themeFunctionality.stateDatalist();
	},
    jsCABK() {
	},
    jsCADA() {
		themeFunctionality.stateDatalist();
	},
    jsCADE() {
		themeFunctionality.stateDatalist();
	},
    jsAFCL() {
	},
    jsAFAD() {
		themeFunctionality.stateDatalist();
	},
    jsAFED() {
	},
    jsORHL() {
	},
    jsORDS() {
		_hook('print-invoice').addEventListener('click', element => {
			element.preventDefault();
			window.print();
		});
	},
    jsCTUS() {
	}
};


(() => {
	String.prototype.toCamelCase = function (cap1st) {
        return ((cap1st ? '-' : '') + this).replace(/-+([^-])/g, (a, b) => b.toUpperCase());
	};

	let pageID = document.body.id.toCamelCase();

	/**
	 * Initialize Global Site Functions
	 */
	themeFunctionality.global();

	/**
	 * Initialize Extensions Functions
	 */
	themeFunctionality.init();

	/**
	 * Initialize Page Specific Functions
	 */
	if (themeFunctionality[pageID]) {
		themeFunctionality[pageID]();
	}

})();
