/**
 * Use this file to all in scripts and functions you would like to have globally or on specific
 * pages. You will use this to extend your theme instead of adding code to the core framework files.
 */
const themeFunctionality = {
	global: function () {
		/**
		 * Although NodeList is not an Array, it is possible to iterate on it using forEach().
		 * It can also be converted to an Array using Array.from().
		 * However some older browsers have not yet implemented NodeList.forEach() nor Array.from().
		 * But those limitations can be circumvented by using Array.prototype.forEach().
		 * This polyfill adds compatibility to browsers which do not support NodeList.forEach(). [IE11]
		 */
		if (window.NodeList && !NodeList.prototype.forEach) {
			NodeList.prototype.forEach = function (callback, thisArg) {
				thisArg = thisArg || window;
				for (let i = 0; i < this.length; i++) {
					callback.call(thisArg, this[i], i, this);
				}
			};
		}
		
		
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
			
			mvtItems.forEach(function (mvtItem) {
				if (attr.id !== null) {
					mvtItem.setAttribute('id', attr.id);
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
		
		mvtInputWraps.forEach(function (element) {
			styleMVT(element, 'input');
		});
		
		mvtSelectWraps.forEach(function (element) {
			styleMVT(element, 'select');
		});

	},
	init: function () {
		/**
		 * Initialize the A11y-Toggle extension
		 */
		a11yToggle();
		if (_hook('global-account') && _hook('global-account').length !== 0) {
			a11yToggleClose(_hook('global-account')); // Close the global account box when clicking on a different target.
		}
		
		
		/**
		 * Initialize the Mini-Basket extension
		 */
		miniBasket.init();
		
		
		/**
		 * Initialize the Transfigure Navigation extension
		 */
		$.hook('has-drop-down').transfigureNavigation();
		
	},
	stateDatalist: function () {
		'use strict';

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
			let datalist = document.querySelector('#' + list);
			let datalistOptions = datalist.querySelectorAll('option');
			let value = '';

			for (let i = 0; i < datalistOptions.length; i++) {
				let option = datalistOptions[i];

				if (entry.toLowerCase() === option.value.toLowerCase() || entry.toLowerCase() === option.text.toLowerCase()) {
					value = option.value;
				}
			}

			return value;
		}

		// [2]
		function updateRequiredStateAttributes(countrySelector, stateInput) {
			countrySelector.addEventListener('change', function () {
				let selectedCountry = countrySelector.options[countrySelector.selectedIndex].value;

				if (countriesRequiringSP.indexOf(selectedCountry) !== -1) {
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
			for (let i = 0; i < datalist.length; i++) {
				let list = datalist[i];

				list.addEventListener('blur', function () {
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

			const shippingState = document.querySelector('input[name="' + shipPrefix + 'State"]');
			const billingState = document.querySelector('input[name="' + billPrefix + 'State"]');

			function updateState(stateEntry) {
				stateEntry.nextElementSibling.value = stateEntry.value;
				stateEntry.nextElementSibling.blur();
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
				updateShippingState.addEventListener('change', function () {
					updateState(shippingState);
				});
			}

			if (updateBillingState !== null) {
				updateBillingState.addEventListener('change', function () {
					updateState(billingState);
				});
			}

			if (primaryAddress === 'shipping') {
				const shippingCountrySelector = document.querySelector('#' + shipPrefix + 'Country');
				const shippingStateInput = document.querySelector('#' + shipPrefix + 'StateSelect');

				updateRequiredStateAttributes(shippingCountrySelector, shippingStateInput);
			}
			else {
				const billingCountrySelector = document.querySelector('#' + billPrefix + 'Country');
				const billingStateInput = document.querySelector('#' + billPrefix + 'StateSelect');

				updateRequiredStateAttributes(billingCountrySelector, billingStateInput);
			}

			(function () {
				document.querySelector('#' + shipPrefix + 'Country').dispatchEvent(new Event('change', {'bubbles': true}));
				document.querySelector('#' + billPrefix + 'Country').dispatchEvent(new Event('change', {'bubbles': true}));
			}());
		}
	},
	jsSFNT: function () {
	},
	jsCTGY: function () {
	},
	jsPROD: function () {
		/**
		 * Initialize the AJAX Add-To-Cart extension
		 */
		addToCart.init();

		/**
		 * Initialize the A11y-Tabs extension
		 */
		tabbedContent.init();
	},
	jsPLST: function () {
	},
	jsSRCH: function () {
	},
	jsBASK: function () {
		/**
		 * Estimate Shipping
		 */
		(function (document) {
			'use strict';

			let formElement = document.querySelector('[data-hook="shipping-estimate-form"]');
			
			if (document.body.contains(formElement)) {
				let formButton = formElement.querySelector('[data-hook="calculate-shipping-estimate"]');
				
				function createCalculation() {
					let processor = document.createElement('iframe');
					
					processor.id = 'calculate-shipping';
					processor.name = 'calculate-shipping';
					processor.style.display = 'none';
					formElement.before(processor);
					processor.addEventListener('load', function () {
						displayResults(processor);
					});
					formElement.submit();
				}
				
				function displayResults(source) {
					let content = source.contentWindow.document.body.innerHTML;
					
					formElement.querySelector('[data-hook="shipping-estimate-fields"]').classList.add('u-hidden');
					formElement.querySelector('[data-hook="shipping-estimate-results"]').innerHTML = content;
					formElement.setAttribute('data-status', 'idle');
					
					formElement.querySelector('[data-hook="shipping-estimate-recalculate"]').addEventListener('click', function () {
						formElement.querySelector('[data-hook="shipping-estimate-results"]').innerHTML = '';
						formElement.querySelector('[data-hook="shipping-estimate-fields"]').classList.remove('u-hidden');
					});
					
					setTimeout(
						function () {
							source.parentNode.removeChild(source);
						}, 1
					);
				}
				
				formButton.addEventListener('click', function (event) {
					event.preventDefault();
					createCalculation();
				}, false);
			}
		}(document));
	},
	jsORDL: function () {
	},
	jsOCST: function () {
		themeFunctionality.stateDatalist();

		/**
		 * Use AJAX for coupon form to prevent page refresh.
		 * https://github.com/mivaecommerce/readytheme-shadows/issues/54
		 */
		(function (document) {
			'use strict';

			document.addEventListener('click', function (evt) {
				let submitButton = document.querySelector('[data-hook="basket__coupon-form-submit"]');
				let submitButtonText = ((submitButton.nodeName.toLowerCase() === 'input') ? submitButton.value : submitButton.textContent);
				let ajaxForm = document.querySelector('[data-hook="basket__coupon-form"]');

				if (evt.target.matches('[data-hook="basket__coupon-form-submit"]')) {
					evt.preventDefault();
					evt.stopImmediatePropagation();

					let data = new FormData(ajaxForm);
					let request = new XMLHttpRequest(); // Set up our HTTP request

					ajaxForm.setAttribute('data-status', 'idle');

					if (ajaxForm.getAttribute('data-status') !== 'submitting') {
						ajaxForm.setAttribute('data-status', 'submitting');
						submitButton.classList.add('is-disabled');

						if (submitButton.nodeName.toLowerCase() === 'input') {
							submitButton.value = 'Processing...';
						}
						else {
							submitButton.textContent = 'Processing...';
						}

						document.querySelector('#messages').parentNode.removeChild(document.querySelector('#messages'));

						// Setup our listener to process completed requests
						request.onreadystatechange = function () {
							// Only run if the request is complete
							if (request.readyState !== 4) {
								return;
							}

							// Process our return data
							if (request.status === 200) {
								// What do when the request is successful
								let response = request.response;
								let basketSummary = response.querySelector('#checkout_basket_summary');
								let responseMessage = response.querySelector('#messages');

								response.querySelector('[data-hook="basket__coupon-form"]').parentElement.prepend(responseMessage);
								document.querySelector('#checkout_basket_summary').innerHTML = basketSummary.innerHTML;


								// Reset button text and form status
								submitButton.classList.remove('is-disabled');

								if (submitButton.nodeName.toLowerCase() === 'input') {
									submitButton.value = submitButtonText;
								}
								else {
									submitButton.textContent = submitButtonText;
								}

								ajaxForm.setAttribute('data-status', 'idle');
							}
							else {
								// What do when the request fails
								console.warn('The request failed!');
								ajaxForm.setAttribute('data-status', 'idle');
							}
						};

						/**
						 * Create and send a request
						 * The first argument is the post type (GET, POST, PUT, DELETE, etc.)
						 * The second argument is the endpoint URL
						 */
						request.open(ajaxForm.method, ajaxForm.action, true);
						request.responseType = 'document';
						request.send(data);
					}
				}
			}, false);

		}(document));
	},
	jsOSEL: function () {
	},
	jsOPAY: function () {
		/**
		 * Added functionality to help style the default Miva output payment
		 * fields.
		 */
		$.hook('mvt-input').each(function () {
			let dataHook = $(this).attr('data-datahook');

			if (dataHook) {
				$(this).find('input').attr('data-hook', dataHook);
			}
		});

		$.hook('mvt-select').find('select').each(function () {
			let wrapDiv = document.createElement('div');
			let select = this;

			wrapDiv.classList.add('c-form-select');
			select.parentNode.insertBefore(wrapDiv, select);
			wrapDiv.appendChild(select);
		});

		/**
		 * Credit Card Detection
		 */
		(function (document) {
			let creditCardInput = document.querySelector('[data-hook="detect-card"]');
			
			if (creditCardInput !== null) {
				['input', 'paste'].forEach(function (event) {
					creditCardInput.addEventListener(event, function () {
						let cardInput = this;
						
						if (isNaN(this.value)) {
							this.classList.add('has-error');
						}
						
						paymentMethod.detect(this, function (paymentDetected) {
							if (paymentDetected) {
								cardInput.classList.remove('has-error');
								document.querySelector('[data-hook="payment-method-display"]').textContent = paymentDetected.display;
								document.querySelector('[data-hook="payment-method"]').value = supportedPaymentMethods.findPaymentMethod(paymentDetected.name);
							}
							
						})
						
					})
				});
			}
		}(document));
	},
	jsINVC: function () {
		/**
		 *  Launch Printer Dialog
		 */
		$.hook('print-invoice').on('click', function (element) {
			element.preventDefault();
			window.print();
		});
	},
	jsLOGN: function () {
	},
	jsACAD: function () {
		themeFunctionality.stateDatalist();
	},
	jsACED: function () {
		themeFunctionality.stateDatalist();
	},
	jsCABK: function () {
	},
	jsCADA: function () {
		themeFunctionality.stateDatalist();
	},
	jsCADE: function () {
		themeFunctionality.stateDatalist();
	},
	jsAFCL: function () {
	},
	jsAFAD: function () {
		themeFunctionality.stateDatalist();
	},
	jsAFED: function () {
	},
	jsORHL: function () {
	},
	jsORDS: function () {
		/**
		 *  Launch Printer Dialog
		 */
		$.hook('print-invoice').on('click', function (element) {
			element.preventDefault();
			window.print();
		});
	},
	jsCTUS: function () {
	}
};


(function () {
	String.prototype.toCamelCase = function (cap1st) {
		'use strict';
		
		return ((cap1st ? '-' : '') + this).replace(/-+([^-])/g, function (a, b) {
			return b.toUpperCase();
		});
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
	
}());
