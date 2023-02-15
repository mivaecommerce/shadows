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

			Array.prototype.forEach.call($(this), function (el) {
				el.innerHTML = el.innerHTML.replace(/&nbsp;/gi, '');
			});
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
	},
	jsACED: function () {
	},
	jsCABK: function () {
	},
	jsCADA: function () {
	},
	jsCADE: function () {
	},
	jsAFCL: function () {
	},
	jsAFAD: function () {
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
