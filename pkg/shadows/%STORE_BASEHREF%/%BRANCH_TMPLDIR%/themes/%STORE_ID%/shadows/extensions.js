/**
 * EXTENSIONS / TABS / A11Y-TABS
 *
 * This is an accessible tab solution extension based on guidelines documented
 * by Heydon Pickering on the Inclusive Components Pattern Library.
 * https://inclusive-components.design/tabbed-interfaces/
 *
 * Version: 10.05.00
 */

const tabbedContent = (document => {
	const publicMethods = {}; // Placeholder for public methods

	/**
	 * Initialize the plugin
	 * @public
	 */
	publicMethods.init = () => {
		// Get relevant elements and collections
		const tabbed = document.querySelector('[data-tab-component]');
		const tabList = tabbed.querySelector('ul');
		const tabs = tabList.querySelectorAll('a');
		const panels = tabbed.querySelectorAll('[id^="tab-"]');
		let hash = window.location.hash;
		let targetTab = [...tabs].filter(({href}) => href.includes(hash));
		let targetPanel = [...panels].filter(({id}) => id === hash.replace('#', ''));

		/**
		 * The tab switching functionality
		 * @param oldTab
		 * @param newTab
		 */
		const switchTab = function switchTab(oldTab, newTab) {
			newTab.focus();
			// Make the active tab focusable by the user (Tab key)
			newTab.removeAttribute('tabindex');
			// Set the selected state
			newTab.setAttribute('aria-selected', 'true');
			oldTab.removeAttribute('aria-selected');
			oldTab.setAttribute('tabindex', '-1');
			/**
			 * Get the indices of the new and old tabs to find the correct tab
			 * panels to show and hide
			 */
			let index = Array.prototype.indexOf.call(tabs, newTab);
			let oldIndex = Array.prototype.indexOf.call(tabs, oldTab);

			panels[oldIndex].hidden = true;
			panels[index].hidden = false;
		};

		// Add the tablist role to the first <ul> in the .tabbed container
		tabList.setAttribute('role', 'tablist');

		// Add semantics and remove user focusability for each tab
		Array.prototype.forEach.call(tabs, (tab, i) => {
			tab.setAttribute('role', 'tab');
			tab.setAttribute('id', `tab${i + 1}`);
			tab.setAttribute('tabindex', '-1');
			tab.parentNode.setAttribute('role', 'presentation');

			// Handle clicking of tabs for mouse users
			tab.addEventListener('click', clickEvent => {
				clickEvent.preventDefault();
				let currentTab = tabList.querySelector('[aria-selected]');

				if (clickEvent.currentTarget !== currentTab) {
					if (window.getComputedStyle(tabbed, '::before').content.replace(/"/g, '') === 'max') {
						tabbed.scrollIntoView(true);
					}

					switchTab(currentTab, clickEvent.currentTarget);
				}
			});

			// Handle keydown events for keyboard users
			tab.addEventListener('keydown', keydownEvent => {
				if ([37, 39, 40].includes(keydownEvent.which)) {
					keydownEvent.preventDefault();
				}
			}, false);

			// Handle keyup events for keyboard users
			tab.addEventListener('keyup', keyupEvent => {
				// Get the index of the current tab in the tabs' node list
				let index = Array.prototype.indexOf.call(tabs, keyupEvent.currentTarget);
				/**
				 * Work out which key the user is pressing and calculate the new
				 * tab's index where appropriate
				 * @type {number}
				 */
				let dir = keyupEvent.which === 37 ? index - 1 : keyupEvent.which === 39 ? index + 1 : keyupEvent.which === 40 ? 'down' : keyupEvent.shiftKey && keyupEvent.which === 9 ? 'reverse' : null;

				if (dir !== null) {
					keyupEvent.preventDefault();
					// If the down key is pressed, move focus to the open panel.
					if (dir === 'down') {
						panels[i].focus();
					}
					/**
					 * If the Shift+Tab combination is pressed, remove focus on the
					 * open panel and return focus to the tab.
					 */
					else if (dir === 'reverse') {
					}
					// If an arrow key is pressed, switch to the adjacent tab.
					else if (tabs[dir]) {
						switchTab(keyupEvent.currentTarget, tabs[dir]);
					}
					else {
						void 0;
					}
				}
			});
		});

		/**
		 * Add tab panel semantics and hide them all
		 */
		Array.prototype.forEach.call(panels, (panel, i) => {
			panel.setAttribute('role', 'tabpanel');
			panel.setAttribute('tabindex', '-1');
			panel.setAttribute('aria-labelledby', tabs[i].id);
			panel.hidden = true;
		});

		/**
		 * If the URL contains a tab hash, activate and scroll to the relevant panel.
		 * Otherwise, initially activate the first tab and reveal the first tab panel.
		 */
		if (targetTab.length === 1 && hash.includes('#')) {
			targetTab[0].removeAttribute('tabindex');
			targetTab[0].setAttribute('aria-selected', 'true');
			targetPanel[0].hidden = false;
			setTimeout(() => {
				targetTab[0].scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				});
			}, 250);
		}
		else {
			tabs[0].removeAttribute('tabindex');
			tabs[0].setAttribute('aria-selected', 'true');
			panels[0].hidden = false;
		}
	};

	/**
	 * Public APIs
	 */
	return publicMethods;

})(document);
/**
 * EXTENSIONS / MINI-BASKET / MINI-BASKET
 *
 * This is the default, off-canvas, mini-basket functionality of Miva.
 *
 * Version: 10.05.00
 */

const miniBasket = (document => {
	var mbElement, mbContent;

	if (!(mbElement = document.querySelector('[data-hook="mini-basket"]')) ||
		!(mbContent = mbElement.querySelector('[data-hook="mini-basket__content"]')))
	{
		return;
	}

	let publicMethods = {};
	let openTrigger;

	/**
	 * Merge two or more objects. Returns a new object.
	 * Set the first argument to `true` for a deep or recursive merge [optional]
	 * @private
	 * @returns {Object}	Merged values of defaults and options
	 */
	let extend = function (...args) {

		let extended = {};
		let deep = false;
		let i = 0;
		let length = args.length;

		if (Object.prototype.toString.call(args[0]) === '[object Boolean]') {
			deep = args[0];
			i++;
		}

		let merge = obj => {
			for (let prop in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, prop)) {
					if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
						extended[prop] = extend(true, extended[prop], obj[prop]);
					}
					else {
						extended[prop] = obj[prop];
					}
				}
			}
		};

		for (; i < length; i++) {
			let obj = args[i];
			merge(obj);
		}

		return extended;

	};

	/**
	 * Toggle the visibility of the mini-basket
	 * @private
	 */
	let toggleMenu = (event, display) => {
		if (mivaJS.miniBasket.use) {
			event.preventDefault();
			event.stopPropagation();
			if (display === 'open') {
				mbElement.parentElement.hidden = false;
			}

			setTimeout(() => {
				document.documentElement.classList.toggle('u-overflow-hidden');
				mbElement.classList.toggle('x-mini-basket--open');
				a11yHelper();
			}, 50);

			if (display === 'close') {
				setTimeout(() => {
					mbElement.parentElement.hidden = true;
				}, 300);
			}
		}
		else if (event.target.dataset?.link?.length) {
			document.location = event.target.dataset.link;
		}
	};

	/**
	 * Manage focus for accessibility
	 * @private
	 */
	let a11yHelper = () => {
		const FOCUSABLE_ELEMENTS = [
			'a[href]',
			'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
			'select:not([disabled]):not([aria-hidden])',
			'textarea:not([disabled]):not([aria-hidden])',
			'button:not([disabled]):not([aria-hidden])',
			'[tabindex]:not([tabindex^="-"])'
		];
		let focusableElements = mbContent.querySelectorAll(FOCUSABLE_ELEMENTS);
		let firstFocus = focusableElements[0];
		let lastFocus = focusableElements[focusableElements.length - 1];

		function handleKeyboard(keyEvent) {
			let tabKey = (keyEvent.key === 'Tab' || keyEvent.keyCode === 9);

			function handleBackwardTab() {
				if (document.activeElement === firstFocus) {
					keyEvent.preventDefault();
					lastFocus.focus();
				}
			}

			function handleForwardTab() {
				if (document.activeElement === lastFocus) {
					keyEvent.preventDefault();
					firstFocus.focus();
				}
			}

			if (!tabKey) {
				return;
			}

			if (keyEvent.shiftKey) {
				handleBackwardTab();
			}
			else {
				handleForwardTab();
			}
		}

		if (mbElement.classList.contains('x-mini-basket--open')) {
			openTrigger = document.activeElement;
			mbContent.focus();
			mbContent.addEventListener('keydown', keyEvent => {
				handleKeyboard(keyEvent);
			});
		}
		else {
			openTrigger.focus();
			mbContent.removeEventListener('keydown', handleKeyboard);
		}
	};

	/**
	 * Toggle the visibility of the mini-basket
	 * @public
	 */
	publicMethods.toggle = (event, display) => {
		toggleMenu(event, display);
	};

	/**
	 * Initialize the plugin
	 * @public
	 */
	publicMethods.init = options => {
		mbElement.parentElement.hidden = true;

		document.querySelector('[data-hook="site-header"]').addEventListener('click', event => {
			if (!event.target.closest('[data-hook~="open-mini-basket"]')) {
				return;
			}
			toggleMenu(event, 'open');
		}, false);

		document.querySelector('[data-hook="mini-basket"]').addEventListener('click', event => {
			if (!event.target.closest('[data-hook~="close-mini-basket"]')) {
				return;
			}
			toggleMenu(event, 'close');
		}, false);

		if (mivaJS.miniBasket.use && mivaJS.miniBasket.closeOnBackground) {
			mbElement.addEventListener('click', function (event) {
				if (event.target === this) {
					toggleMenu(event, 'close');
				}
			}, false);
		}

		if (mivaJS.miniBasket.use && mivaJS.miniBasket.closeOnEsc) {
			window.addEventListener('keydown', event => {
				let escKey = (event.key === 'Escape');

				if (event.defaultPrevented) {
					return;
				}

				if (!escKey) {
					return;
				}

				if (escKey) {
					if (mbElement.classList.contains('x-mini-basket--open')) {
						event.preventDefault();
						toggleMenu(event, 'close');
					}
				}
			}, true);
		}
	};

	/**
	 * Public APIs
	 */
	return publicMethods;
})(document);
/**
 * 	Closable Messages
 *
 * Version: 10.05.00
 */
(() => {
	let closeElements = document.querySelectorAll('[data-hook="message__close"]');

	Array.prototype.forEach.call(closeElements, element => {
		let ux_message_closer = element;
		let ux_message = ux_message_closer.parentNode;

		ux_message_closer.addEventListener('click', event => {
			event.preventDefault();
			ux_message.classList.add('u-hidden');
		}, false);
	});
})();
/**
 * EXTENSIONS / FASTEN HEADER / FASTEN HEADER
 *
 * This extension is a more refined version of a classic "sticky" header function.
 *
 * Version: 10.05.00
 */

function fastenHeader(position, {offsetHeight}) {
	if (position > offsetHeight) {
		document.body.classList.add('x-fasten-header--is-active');
	}
	else {
		document.body.classList.remove('x-fasten-header--is-active');
	}
}

if (window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches && _hook('fasten-header')) {
	const siteHeader = document.querySelector('[data-hook="site-header"]');
	let animationTimeout;

	fastenHeader(window.scrollY, siteHeader);

	window.addEventListener('scroll', () => {
		if (animationTimeout) {
			window.cancelAnimationFrame(animationTimeout);
		}

		animationTimeout = window.requestAnimationFrame(() => {
			fastenHeader(window.scrollY, siteHeader);
		});
	}, false);
}
/**
 * EXTENSIONS / QUANTIFY / QUANTIFY
 *
 * This extension allows for the use of buttons to increase/decrease item
 * quantities on the product and basket pages. When used on the basket page,
 * the decrease button becomes a remove button if the quantity is 1.
 *
 * Version: 10.06.00
 */

const quantify = (() => {

	const quantifyAPI = {};

	const allowRemoveUpdate = section => {
		let quantities = section.querySelectorAll('[data-hook="group-quantity"]');

		function toggleRemove({previousElementSibling}, quantity) {
			if (parseInt(quantity) > 1) {
				previousElementSibling.removeAttribute('aria-disabled');
			}
			else {
				previousElementSibling.setAttribute('aria-disabled', 'true');
			}
		}

		if (quantities) {
			for (let quantityLine of quantities) {
				let updateTimeout = null;

				toggleRemove(quantityLine, quantityLine.value);

				quantityLine.addEventListener('change', function (event) {
					let input = this;

					clearTimeout(updateTimeout);
					updateTimeout = setTimeout(() => {
						toggleRemove(input, input.value);
						groupSubmit(event, input, section);
					}, 250);
				});

				quantityLine.addEventListener('input', function (event) {
					let input = this;

					clearTimeout(updateTimeout);
					updateTimeout = setTimeout(() => {
						toggleRemove(input, input.value);
						groupSubmit(event, input, section);
					}, 250);
				});
			}
		}
	};

	allowRemoveUpdate(document);

	const groupSubmit = ({key, target}, {value}, section) => {
		if (key !== 8 && key !== 37 && key !== 38 && key !== 39 && key !== 40 && key !== 46 && value !== '') {
			section.querySelector(`[data-hook="${target.getAttribute('data-group')}"]`).submit();
		}
	};

	quantifyAPI.init = section => {
		const adjusters = section.querySelectorAll('[data-hook="quantify"]');

		if (adjusters) {
			for (let id = 0; id < adjusters.length; id++) {
				/**
				 * This listener prevents the `enter` key from adjusting the `input` value.
				 */
				adjusters[id].addEventListener('keydown', keyEvent => {
					if (keyEvent.target.closest('input')) {
						if (keyEvent.key === 'Enter') {
							keyEvent.preventDefault();
						}
					}
				});

				adjusters[id].addEventListener('click', function (event) {
					if (event.target.closest('button')) {
						let button = event.target;
						let inputs = [].filter.call(this.children, sibling => sibling !== button && sibling.closest('input'));
						let input = inputs[0];
						let max = input.hasAttribute('data-max') ? parseInt(input.getAttribute('data-max')) : undefined;
						let min = input.hasAttribute('data-min') ? parseInt(input.getAttribute('data-min')) : 1;
						let step = input.hasAttribute('data-step') ? parseInt(input.getAttribute('data-step')) : 1;
						let value = parseInt(input.value);
						let action = button.getAttribute('data-action');
						let changed = new Event('change');

						if (isNaN(step)) {
							step = 1;
						}
						event.stopPropagation();
						event.preventDefault();

						if (action === 'decrement') {
							if (!isNaN(min)) {
								if (min < value) {
									input.value = value - step;
								}
								else {
									input.value = min;
								}
							}
							else {
								input.value = value > step ? value - step : step;
							}
							input.dispatchEvent(changed);
							allowRemoveUpdate(section);
						}
						else if (action === 'increment') {
							if (max !== undefined && !isNaN(max)) {
								if (max > value) {
									input.value = value + step;
								}
								else {
									input.value = max;
								}
							}
							else {
								input.value = value + step;
							}
							input.dispatchEvent(changed);
							allowRemoveUpdate(section);
						}
					}
				});
			}
		}
	};

	quantifyAPI.restore = section => {
		allowRemoveUpdate(section);
		quantifyAPI.init(section);
	};

	return quantifyAPI;
})();
/**
 * EXTENSIONS / PAYMENT / PAYMENT METHODS
 *
 * Payment-method is a lightweight plugin which used to help determine the type
 * of credit card being used and set, or update, the payment method field for
 * order submission on the Checkout: Payment Information page in Miva Merchant.
 *
 * Version: 10.05.00
 */

const paymentMethod = (() => {
	const publicMethods = {};

	/**
	 * Initialize the plugin
	 * @public
	 */
	publicMethods.detect = (element, callback) => {
		/**
		 * Retrieve the value of the input and remove all non-numeric characters
		 * @type {string}
		 */
		let number = String(element.value);
		let cleanNumber = '';

		for (let charIndex = 0; charIndex < number.length; charIndex++) {
			if (/^[0-9]+$/.test(number.charAt(charIndex))) {
				cleanNumber += number.charAt(charIndex);
			}
		}

		/**
		 * Run the modulus 10 algorithm on the input number if it is at least
		 * equal to the shortest card length.
		 * https://en.wikipedia.org/wiki/Luhn_algorithm
		 */
		let passedMod10;

		if (cleanNumber.length >= 12) {
			passedMod10 = mod10Validation(cleanNumber);
		}

		function mod10Validation(number) {
			let digit;
			let digits;
			let i;
			let len;
			let odd;
			let sum;

			odd = true;
			sum = 0;
			digits = (`${number}`).split('').reverse();

			for (i = 0, len = digits.length; i < len; i++) {
				digit = digits[i];
				digit = parseInt(digit, 10);
				if ((odd = !odd)) {
					digit *= 2;
				}
				if (digit > 9) {
					digit -= 9;
				}
				sum += digit;
			}

			return sum % 10 === 0;
		}

		/**
		 * Credit card types array including regular expressions for matching.
		 * @type {[*]}
		 */
		let card_types = [
			{
				display_name: 'American Express',
				name: 'american-express',
				pattern: /^(?:(3[47][0-9]{13}))/,
				valid_length: [15]
			},
			{
				display_name: 'Diners Club',
				name: 'diners-club',
				pattern: /^(?:(3(?:0[0-5]|[68][0-9])[0-9]{11}))/,
				valid_length: [14]
			},
			{
				display_name: 'JCB',
				name: 'jcb',
				pattern: /^(?:((?:2131|1800|35[0-9]{3})[0-9]{11}))/,
				valid_length: [16]
			},
			{
				display_name: 'Visa',
				name: 'visa',
				pattern: /^(?:(4[0-9]{12}(?:[0-9]{3})?))/,
				valid_length: [16]
			},
			{
				display_name: 'MasterCard',
				name: 'mastercard',
				pattern: /^(?:((?:5[1-5]|2[2-7])[0-9]{14}))$/,
				valid_length: [16]
			},
			{
				display_name: 'Discover',
				name: 'discover',
				pattern: /^(?:(6(?:011|5[0-9]{2})[0-9]{12}))/,
				valid_length: [16]
			}
		];

		/**
		 * Test the input number against mod10 validation.
		 * If it passes, test the input number against each of the above card types.
		 * Return the card name to the callback for additional processing.
		 */
		for (let i = 0; i < card_types.length; i++) {
			if (passedMod10 === true) {
				if (cleanNumber.match(card_types[i].pattern)) {
					let card = {
						display: card_types[i].display_name,
						name: card_types[i].name
					};

					if (typeof callback === 'function') {
						callback(card);
					}
				}
			}
		}

		/**
		 * Get a value from an array by name.
		 * @param name
		 */
		Array.prototype.findPaymentMethod = function (name) {
			for (let i = 0, len = this.length; i < len; i++) {
				if (typeof this[i] !== 'object') {
					continue;
				}
				if (this[i].name === name) {
					return this[i].value;
				}
			}
		};
	};

	/**
	 * Public APIs
	 */
	return publicMethods;

})();
/**
 * EXTENSIONS / NAVIGATION / TRANSFIGURE NAVIGATION
 *
 * This extension is the default, primary navigation layout for Shadows. On larger screens, it
 * is a horizontal navigation with drop-downs and fly-outs for categories. On smaller screens, it
 * is off-canvas with internal scrolling.
 *
 * Version: 10.05.00
 */

(($, window, document) => {
	/**
	 * Double Tap To Go [http://osvaldas.info/drop-down-navigation-responsive-and-touch-friendly]
	 * By: Osvaldas Valutis [http://www.osvaldas.info]
	 * License: MIT
	 */
	$.fn.doubleTapToGo = function () {
		if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
			this.each(function () {
				let curItem = false;

				$(this).on('click', function (event) {
					let item = $(this);

					if (item[0] !== curItem[0]) {
						event.preventDefault();
						curItem = item;
					}
				});

				$(document).on('click touchstart', ({target}) => {
					let resetItem = true;
					let parents = $(target).parents();

					for (let i = 0; i < parents.length; i++) {
						if (parents[i] === curItem[0]) {
							resetItem = false;
						}
					}
					if (resetItem) {
						curItem = false;
					}
				});
			});
		}

		return this;
	};


	/**
	 * This function works if the element, or its parent, have been hidden via JavaScript, and can either
	 * retrieve inner or outer dimensions as well as returning the offset values. The function is called
	 * directly on the object and will insert a clone just after the original element making it possible
	 * for the clone to maintain inherited dimensions.
	 *
	 * @param outer
	 * @returns {*}
	 *
	 * element width: $(ELEMENT).getRealDimensions().width;
	 * element outerWidth: $(ELEMENT).getRealDimensions(true).width;
	 * element height: $(ELEMENT).getRealDimensions().height;
	 * element outerHeight: $(ELEMENT).getRealDimensions(true).height;
	 * element offsetTop: $(ELEMENT).getRealDimensions().offsetTop;
	 * element offsetLeft: $(ELEMENT).getRealDimensions().offsetLeft;
	 */
	$.fn.getRealDimensions = function (outer) {
		let $this = $(this);

		if ($this.length === 0) {
			return false;
		}

		let $clone = $this.clone().css(
			{
				'display': 'block',
				'visibility': 'hidden'
			}
		).insertAfter($this);

		let result = {
			width: (outer) ? $clone.outerWidth() : $clone.innerWidth(),
			height: (outer) ? $clone.outerHeight() : $clone.innerHeight(),
			offsetTop: $clone.offset().top,
			offsetLeft: $clone.offset().left
		};

		$clone.remove();
		return result;
	};


	/**
	 * This function will check if navigation elements will be rendered outside
	 * of the visible area. If they will be, a class is added to the parent
	 * element which will change the render direction. You can pass a jQuery
	 * object as the `container` parameter to have the visible area set to
	 * something other than the documentElement.
	 *
	 * @param container
	 */
	$.fn.setOffsetDirection = function (container) {
		let triggerElement = $(this);

		triggerElement.on('mouseenter', function () {
			let parentElement = $(this);
			let childElement = parentElement.find('ul').first();
			let grandchildElement = childElement.find('ul').first();
			let childOffsetWidth = childElement.offset().left + childElement.width();
			let documentWidth = container ? container.outerWidth() : document.documentElement.clientWidth;

			if (grandchildElement) {
				childOffsetWidth = childOffsetWidth + grandchildElement.getRealDimensions().width;
			}

			let isEntirelyVisible = (childOffsetWidth <= documentWidth);

			if (!isEntirelyVisible) {
				//console.log('NOT In the viewport!');
				parentElement.addClass('is-off-screen');
			}
			else {
				//console.log('In the viewport!');
				parentElement.removeClass('is-off-screen');
			}
		});
		return this;
	};


	/**
	 * This function is the compiled call for all the functions contained in this extension. You can pass a jQuery
	 * object as the `container` parameter to have the visible area set to something other than the documentElement.
	 *
	 * Example: $(ELEMENT).transfigureNavigation();
	 *          $(ELEMENT).transfigureNavigation($(CONTAINER_ELEMENT));
	 *
	 * @param container
	 */
	$.fn.transfigureNavigation = function (container) {
		const navigationExtension = document.querySelector('[data-hook="transfigure-navigation"]');
		const topLevelLinks = navigationExtension.querySelectorAll('.x-transfigure-navigation__link');
		let clientPort = document.documentElement.clientWidth;
		let waitForIt;

		window.addEventListener('resize', () => {
			if (!waitForIt) {
				waitForIt = setTimeout(() => {
					waitForIt = null;
					clientPort = document.documentElement.clientWidth;

					if (clientPort < 960) {
						showSubnavigation();
					}
				}, 66);
			}
		}, false);

		function showSubnavigation() {
			$.hook('has-child-menu').children('a').on('click', function (event) {
				let selected = $(this);

				event.preventDefault();
				selected.next('ul').removeClass('is-hidden');
				selected.parent('.has-child-menu').closest('ul').addClass('show-next');
			});

			$.hook('show-previous-menu').on('click', function (event) {
				let selected = $(this);

				event.preventDefault();
				selected.parent('ul').addClass('is-hidden').parent('.has-child-menu').closest('ul').removeClass('show-next');
			});
		}

		document.querySelector('[data-hook="open-main-menu"]').addEventListener('click', event => {
			event.preventDefault();
			document.documentElement.classList.add('has-open-main-menu');
			navigationExtension.classList.add('is-open');
		});

		document.querySelector('[data-hook="close-main-menu"]').addEventListener('click', event => {
			event.preventDefault();
			document.documentElement.classList.remove('has-open-main-menu');
			navigationExtension.classList.remove('is-open');
		});

		if (clientPort < 960) {
			showSubnavigation();

			navigationExtension.addEventListener('click', event => {
				if (event.target === navigationExtension) {
					event.preventDefault();
					document.documentElement.classList.remove('has-open-main-menu');
					navigationExtension.classList.remove('is-open');
				}
			});
		}
		else {
			if (!!window.MSInputMethodContext && !!document.documentMode) {
				topLevelLinks.forEach(link => {
					if (link.nextElementSibling) {
						link.addEventListener('focus', function () {
							this.parentElement.classList.add('focus-within');
						});

						const subMenu = link.nextElementSibling;
						const subMenuLinks = subMenu.querySelectorAll('a');
						const lastLinkIndex = subMenuLinks.length - 1;
						const lastLink = subMenuLinks[lastLinkIndex];

						lastLink.addEventListener('blur', () => {
							link.parentElement.classList.remove('focus-within');
						});
					}
				});
			}
			return this.doubleTapToGo().setOffsetDirection(container);

		}
	};
})(jQuery, window, document);
/**
 * EXTENSIONS / DIALOG / DIALOG
 *
 * A modal that is fully keyboard accessible. Keyboard focus will lock to the modal only while open and can be closed
 * by pressing Escape or tabbing to the 'close' button. For non-keyboard navigation, the modal can be closed through
 * clicking on the background.
 *
 * Based on `Accessible modal with tab trap and vanilla JS` by Danielle [https://codepen.io/hidanielle/pen/MyggJJ]
 *
 * Version: 10.05.00
 */

(() => {
	/**
	 * Create a dialog object, set the target element, and create a list of focusable elements.
	 * @type {{set: *[], closeTriggers: *[], focused: Element, focusable: string, el: Element, openTriggers: *[], init: function, show: function, hide: function, trap: function, getFocusable: function, getFirstFocusable: function, setInert: function, removeInert: function}}
	 */
	let dialog = {
		set: Array.from(document.querySelectorAll('[data-dialog]')),
		openTriggers: Array.from(document.querySelectorAll('[data-dialog-trigger]')),
		closeTriggers: Array.from(document.querySelectorAll('[data-dialog-close]')),
		focusable: 'a[href], area[href], input:not([disabled]):not([type="hidden"]):not([aria-hidden]), select:not([disabled]):not([aria-hidden]), textarea:not([disabled]):not([aria-hidden]), button:not([disabled]):not([aria-hidden]), object, embed, [tabindex]:not([tabindex^="-"])',
		el: undefined,
		focused: undefined,
		init() {
		},
		show() {
		},
		hide() {
		},
		trap() {
		},
		getFocusable() {
		},
		getFirstFocusable() {
		},
		setInert() {
		},
		removeInert() {
		}
	};


	/**
	 * Validates whether a dialog of the given `data-dialog` exists in the DOM
	 * @param {string} id The data-dialog of the dialog
	 * @returns {boolean}
	 */
	const validateDialogPresence = function validateDialogPresence(id) {
		if (!document.querySelector(`[data-dialog=${id}]`)) {
			console.warn("Dialog: \u2757Seems like you have missed %c'".concat(id, "'"), 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', 'data-dialog somewhere in your code. Refer example below to resolve it.');
			console.warn("%cExample:", 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', "<div class=\"c-dialog\" aria-hidden=\"true\" data-dialog=\"".concat(id, "\"></div>"));
			return false;
		}
	};


	/**
	 * Initialize the dialog, find the focusable children elements, and set up the click handlers.
	 */
	dialog.init = () => {
		dialog.set.forEach(dialog => {
			dialog.setAttribute('aria-hidden', 'true');
		});

		dialog.openTriggers.forEach(trigger => {
			trigger.addEventListener('click', function (e) {
				e.preventDefault();
				let name = this.dataset.dialogTrigger;

				dialog.el = dialog.set.find(({dataset}) => dataset.dialog === name);
				if (validateDialogPresence(name) !== false) {
					dialog.show();
				}
			});
		});

		dialog.closeTriggers.forEach(trigger => {
			trigger.addEventListener('click', e => {
				e.preventDefault();
				dialog.hide();
			});
		});

		/**
		 * Close the open dialog when clicking on the background.
		 */
		document.addEventListener('click', clickEvent => {
			let clickEventTarget = clickEvent.target;

			if (dialog.el) {
				if (clickEventTarget === dialog.el.firstElementChild) {
					if (dialog.el.getAttribute('aria-hidden') === 'false') {
						clickEvent.preventDefault();
						dialog.hide();
					}
				}
			}
		});

	};


	/**
	 * Capture the current focused element so that you can set focus back to it
	 * when you close the dialog.
	 * Add a class to the `body` to style for dialog.
	 * Hide the rest of the content.
	 * Set `aria-hidden` to `false`
	 * Add class to dialog.
	 * Set focus to first focusable element from list created in init function.
	 */
	dialog.show = () => {
		document.body.appendChild(dialog.el);
		dialog.setInert();

		document.body.classList.add('has-dialog');
		dialog.focused = document.activeElement;
		dialog.el.setAttribute('aria-hidden', 'false');

		// Focus the first focusable item in the dialog.
		dialog.getFirstFocusable().focus();
		dialog.el.onkeydown = e => {
			dialog.trap(e);
		};
	};


	/**
	 * Remove `body` classes that were added.
	 * Reset `aria-hidden` values from container.
	 * Reset `aria-hidden` values on dialog.
	 * Remove show class from dialog.
	 * Set focus to previously focused element.
	 */
	dialog.hide = () => {
		document.body.classList.remove('has-dialog');
		dialog.el.setAttribute('aria-hidden', 'true');
		dialog.removeInert();
		dialog.focused.focus();
	};


	/**
	 * Traps the tab key inside of the context, so the user can't accidentally get stuck behind it.
	 * Note that this does not work for VoiceOver users who are navigating with the VoiceOver commands, only for default
	 * tab actions. We would need to implement something like the inert attribute for that (https://github.com/WICG/inert).
	 *
	 * If key is `esc`, close the dialog.
	 * If key is `tab`
	 * -- Get the current focus.
	 * -- Get the total focusable items to filter through them later.
	 * -- Get the index from the focusable items list of the current focused item.
	 * If key is `shift-tab` (backwards) and you're at the first focusable item, set focus to the last focusable item.
	 * If not `shift-tab` and the current focused item is the last item, set focus to the first focusable item.
	 */
	dialog.trap = e => {
		if (e.which === 27) {
			dialog.hide();
		}
		if (e.which === 9) {
			let currentFocus = document.activeElement;
			let focusableChildren = dialog.getFocusable();
			let totalOfFocusable = focusableChildren.length;
			let focusedIndex = focusableChildren.indexOf(currentFocus);

			if (e.shiftKey) {
				if (focusedIndex === 0) {
					e.preventDefault();
					focusableChildren[totalOfFocusable - 1].focus();
				}
			}
			else {
				if (focusedIndex === totalOfFocusable - 1) {
					e.preventDefault();
					focusableChildren[0].focus();
				}
			}
		}
	};


	/**
	 * Get all focusable elements inside of the dialog.
	 * @returns {Array} Array of focusable elements
	 */
	dialog.getFocusable = () => Array.from(dialog.el.querySelectorAll(dialog.focusable));

	/**
	 * Get the first focusable element inside of the dialog.
	 * @returns {Object} A DOM element
	 */
	dialog.getFirstFocusable = () => {
		let focusable = dialog.getFocusable();

		return focusable[0];
	};


	/**
	 * Toggles an 'inert' attribute on all direct children of the <body> that are not the element you passed in. The
	 * element you pass in needs to be a direct child of the <body>.
	 *
	 * Most useful when displaying a dialog/dialog/overlay and you need to prevent screen-reader users from escaping the
	 * dialog to content that is hidden behind the dialog.
	 *
	 * This is a basic version of the `inert` concept from WICG. It is based on an alternate idea which is presented here:
	 * https://github.com/WICG/inert/blob/master/explainer.md#wouldnt-this-be-better-as
	 * Also see https://github.com/WICG/inert for more information about the inert attribute.
	 */
	dialog.setInert = () => {
		Array.from(document.body.children).forEach(child => {
			if (!dialog.set.includes(child) && child !== dialog.el && child.tagName !== 'LINK' && child.tagName !== 'SCRIPT') {
				child.classList.add('is-inert');
				child.setAttribute('inert', '');
			}
		});
	};

	dialog.removeInert = () => {
		Array.from(document.body.children).forEach(child => {
			if (!dialog.set.includes(child) && child !== dialog.el && child.tagName !== 'LINK' && child.tagName !== 'SCRIPT') {
				child.classList.remove('is-inert');
				child.removeAttribute('inert');
			}
		});
	};


	/**
	 * This is a helper function we will put into `window` to allow for opening of a specific dialog.
	 * @param targetDialog
	 */
	let openDialog = targetDialog => {
		dialog.el = dialog.set.find(({dataset}) => dataset.dialog === targetDialog);
		if (validateDialogPresence(targetDialog) !== false) {
			dialog.show();
		}
	};
	window && (window.openDialog = openDialog);


	/**
	 * This is a helper function we will put into `window` to allow for closing of a specific dialog.
	 */
	let closeDialog = () => {
		dialog.hide();
	};
	window && (window.closeDialog = closeDialog);


	/**
	 * This is a helper function we will put into `window` to allow for rescanning of the page when
	 * dynamic content has been added. It will then reinitialize.
	 */
	let reloadDialog = () => {
		dialog.set = Array.from(document.querySelectorAll('[data-dialog]'));
		dialog.openTriggers = Array.from(document.querySelectorAll('[data-dialog-trigger]'));
		dialog.closeTriggers = Array.from(document.querySelectorAll('[data-dialog-close]'));
		dialog.init();
	};
	window && (window.reloadDialog = reloadDialog);


	/**
	 * Initialize the dialog.
	 */
	dialog.init();
})();
/**
 * EXTENSIONS / SHOW PASSWORD / SHOW PASSWORD
 *
 * This extension allows a user to reveal the password they have typed.
 *
 * Version: 10.05.00
 */

(() => {
	const passwordInputs = document.querySelectorAll('input[type="password"]');
	const hideClass = 'u-icon-eye-closed';
	const hideLabel = 'Hide Password.';
	const hideText = 'Hide';
	const showClass = 'u-icon-eye-open';
	const showLabel = 'Show password as plain text. Warning: this will display your password on the screen.';
	const showText = 'Show';

	function getPreviousSibling({previousElementSibling}, selector) {
		let sibling = previousElementSibling;

		if (!selector) {
			return sibling;
		}

		while (sibling) {
			if (sibling.matches(selector)) {
				return sibling;
			}
			sibling = sibling.previousElementSibling;
		}
	}

	if (passwordInputs.length > 0) {
		passwordInputs.forEach(passwordInput => {
			const toggleButton = document.createElement('button');
			let findLabel = getPreviousSibling(passwordInput, 'label');

			toggleButton.classList.add('c-button');
			toggleButton.classList.add('u-bg-transparent');
			toggleButton.classList.add('x-toggle-password');
			mivaJS.showPassword.useIcon ? toggleButton.classList.add(showClass) : toggleButton.textContent = showText;
			if (findLabel && findLabel.classList.contains('u-hide-visually')) {
				toggleButton.classList.add('x-toggle-password--no-label');
			}
			toggleButton.setAttribute('aria-label', showLabel);
			toggleButton.setAttribute('data-hook', 'toggle-password');
			toggleButton.type = 'button';
			passwordInput.parentElement.style.position = 'relative';
			passwordInput.parentElement.insertBefore(toggleButton, passwordInput.nextSibling);
		});

		const togglePasswordButtons = document.querySelectorAll('[data-hook="toggle-password"]');

		if (togglePasswordButtons.length > 0) {
			togglePasswordButtons.forEach(togglePasswordButton => {
				togglePasswordButton.addEventListener('click', () => {
					let closestInput = getPreviousSibling(togglePasswordButton, 'input');

					if (closestInput.type === 'password') {
						closestInput.type = 'text';
						mivaJS.showPassword.useIcon ? togglePasswordButton.classList.replace(showClass, hideClass) : togglePasswordButton.textContent = hideText;
						togglePasswordButton.setAttribute('aria-label', hideLabel);
					}
					else {
						closestInput.type = 'password';
						mivaJS.showPassword.useIcon ? togglePasswordButton.classList.replace(hideClass, showClass) : togglePasswordButton.textContent = showText;
						togglePasswordButton.setAttribute('aria-label', showLabel);
					}
				});
			});
		}
	}
})();
/**
 * EXTENSIONS / SHOW RELATED / A11Y TOGGLE
 *
 * An accessible replacement to the checkbox-hack for toggling sections.
 * https://github.com/edenspiekermann/a11y-toggle
 *
 * By: https://kittygiraudel.com/
 * MIT License: https://github.com/edenspiekermann/a11y-toggle/blob/master/LICENSE
 */

(() => {
	const distinct = (value, index, self) => self.indexOf(value) === index;

	let atResizeTimeout;
	let internalId = 0;
	let togglesMap = {};
	let targetsMap = {};

	function $(selector, context) {
		return Array.prototype.slice.call(
			(context || document).querySelectorAll(selector)
		);
	}

	function getClosestToggle(element) {
		if (element.closest) {
			return element.closest('[data-a11y-toggle]');
		}

		while (element) {
			if (element.nodeType === 1 && element.hasAttribute('data-a11y-toggle')) {
				return element;
			}

			element = element.parentNode;
		}

		return null;
	}

	function handleToggle(toggle) {
		let target = toggle && targetsMap[toggle.getAttribute('aria-controls')];

		if (!target) {
			return false;
		}

		let toggles = togglesMap[`#${target.id}`];
		let isExpanded = target.getAttribute('aria-hidden') === 'false';

		target.setAttribute('aria-hidden', isExpanded);
		toggles.forEach(toggle => {
			toggle.setAttribute('aria-expanded', !isExpanded);
		});
	}

	let initA11yToggle = context => {
		togglesMap = $('[data-a11y-toggle]', context).reduce((acc, toggle) => {
			let selector = `#${toggle.getAttribute('data-a11y-toggle')}`;

			acc[selector] = acc[selector] || [];
			acc[selector].push(toggle);
			return acc;
		}, togglesMap);

		let targets = Object.keys(togglesMap);

		targets.length && $(targets).forEach(target => {
			let toggles = togglesMap[`#${target.id}`];
			let isExpanded = target.hasAttribute('data-a11y-toggle-open');
			let labelledby = [];

			if (toggles[0].offsetWidth > 0 && toggles[0].offsetHeight > 0) {
				toggles.forEach(toggle => {
					toggle.id || toggle.setAttribute('id', `a11y-toggle-${internalId++}`);
					toggle.setAttribute('aria-controls', target.id);
					toggle.setAttribute('aria-expanded', isExpanded);
					labelledby.push(toggle.id);
				});
				let distinctLabel = labelledby.filter(distinct);

				target.setAttribute('aria-hidden', !isExpanded);
				target.hasAttribute('aria-labelledby') || target.setAttribute('aria-labelledby', distinctLabel.join(' '));
				target.setAttribute('role', 'region');
			}
			else {
				toggles.forEach(toggle => {
					toggle.removeAttribute('id');
					toggle.removeAttribute('aria-controls');
					toggle.removeAttribute('aria-expanded');
				});

				target.removeAttribute('aria-hidden');
				target.removeAttribute('aria-labelledby');
				target.removeAttribute('role');

			}

			targetsMap[target.id] = target;
		});
	};

	let destroyA11yToggle = () => {
		let targets = Object.keys(togglesMap);

		targets.length && $(targets).forEach(target => {
			let toggles = togglesMap[`#${target.id}`];

			toggles.forEach(toggle => {
				toggle.removeAttribute('id');
				toggle.removeAttribute('aria-controls');
				toggle.removeAttribute('aria-expanded');
			});

			target.removeAttribute('aria-hidden');
			target.removeAttribute('aria-labelledby');
			target.removeAttribute('role');

			targetsMap[target.id] = target;
		});
	};

	let closeA11yToggle = trigger => {
		if (trigger) {
			const thisToggle = document.querySelector(`#${trigger.getAttribute('data-a11y-toggle')}`);

			document.addEventListener('mousedown', event => {
				if (thisToggle.getAttribute('aria-hidden') === 'false') {
					if (!thisToggle.contains(event.target) && event.target !== trigger) {
						trigger.click();
						event.preventDefault();
					}
				}
			}, false);
		}
	};

	/**
	 * Auto-initialize A11y Toggle when the document is complete.
	 */
	if (document.readyState === 'complete') {
		initA11yToggle();
	}

	/**
	 * This will reinitialize A11y Toggle on `resize` to either enable or destroy
	 * toggles who have their display managed through media queries.
	 */
	window.addEventListener('resize', () => {
		if (atResizeTimeout) {
			window.cancelAnimationFrame(atResizeTimeout);
		}

		atResizeTimeout = window.requestAnimationFrame(() => {
			initA11yToggle();
		});
	}, false);

	document.addEventListener('click', event => {
		let toggle = getClosestToggle(event.target);

		if (toggle && toggle.hasAttribute('data-a11y-toggle')) {
			event.preventDefault();
		}
		handleToggle(toggle);
	});

	document.addEventListener('keyup', ({key, target}) => {
		if (key === 'Enter' || key === ' ') {
			let toggle = getClosestToggle(target);

			if (toggle && toggle.getAttribute('role') === 'button') {
				handleToggle(toggle);
			}
		}
	});

	window && (window.a11yToggle = initA11yToggle);
	window && (window.a11yToggleDestroy = destroyA11yToggle);
	window && (window.a11yToggleClose = closeA11yToggle);
})();
/**
 * EXTENSIONS / PRODUCT LAYOUT / AJAX ADD-TO-CART
 *
 * When called from a `theme.js` file on a product page, this extension will
 * work with the default page code to add a product to the cart utilizing an
 * AJAX call to the form processor.
 *
 * The function contains internal error checking as well as a check to see which
 * page was reached and displaying messages accordingly. If the store is also
 * utilizing the `mini-basket` extension, said extension will be triggered for
 * display upon successfully adding a product to the cart.
 *
 * Version: 10.05.00
 */
const addToCart = (document => {
	const publicMethods = {}; // Placeholder for public methods

	/**
	 * Initialize the plugin
	 * @public
	 */
	publicMethods.init = () => {
		const purchaseButton = document.querySelector('[data-hook="add-to-cart"]');

		if (!document.body.contains(purchaseButton)) {
			return;
		}

		const purchaseButtonText = (purchaseButton.nodeName.toLowerCase() === 'input') ? purchaseButton.value : purchaseButton.textContent;
		const purchaseForm = document.querySelector('[data-hook="purchase"]');
		const purchaseFormActionInput = purchaseForm.querySelector('input[name="Action"]');
		const responseMessage = document.querySelector('[data-hook="purchase-message"]');
		const miniBasketCount = document.querySelectorAll('[data-hook~="mini-basket-count"]');
		const miniBasketAmount = document.querySelectorAll('[data-hook~="mini-basket-amount"]');
		const requiredFields = purchaseForm.querySelectorAll('[required]');

		purchaseButton.addEventListener('click', evt => {
			if (purchaseFormActionInput.value !== 'ADPR') {
				return;
			}

			evt.preventDefault();
			evt.stopImmediatePropagation();

			purchaseForm.action = purchaseButton.getAttribute('data-action');
			purchaseFormActionInput.value = 'ADPR';

			const data = new FormData(purchaseForm);
			const request = new XMLHttpRequest(); // Set up our HTTP request

			purchaseForm.setAttribute('data-status', 'idle');

			for (let field of requiredFields) {
				field.setCustomValidity('');

				if (!field.validity.valid) {
					if (field.type === 'checkbox') {
						field.focus();
						field.setCustomValidity('Please check this box if you want to proceed.');
						field.reportValidity();
						purchaseForm.setAttribute('data-status', 'submitting');
						break;
					}
					else if (field.type === 'radio') {
						field.focus();
						field.setCustomValidity('Please select one of these options.');
						field.reportValidity();
						purchaseForm.setAttribute('data-status', 'submitting');
						break;
					}
					else if (field.type.includes('select')) {
						field.focus();
						field.setCustomValidity('Please select an item in the list.');
						field.reportValidity();
						purchaseForm.setAttribute('data-status', 'submitting');
						break;
					}
					else if (field.type === 'text' || field.type === 'textarea') {
						field.focus();
						field.setCustomValidity('Please fill out this field.');
						field.reportValidity();
						purchaseForm.setAttribute('data-status', 'submitting');
						break;
					}
				}
			}

			if (purchaseForm.getAttribute('data-status') !== 'submitting') {
				purchaseForm.setAttribute('data-status', 'submitting');
				purchaseButton.classList.add('is-disabled');

				if (purchaseButton.nodeName.toLowerCase() === 'input') {
					purchaseButton.value = 'Processing...';
				}
				else {
					purchaseButton.textContent = 'Processing...';
				}

				responseMessage.innerHTML = '';

				// Setup our listener to process completed requests
				request.onreadystatechange = () => {
					// Only run if the request is complete
					if (request.readyState !== 4) {
						return;
					}

					// Process our return data
					if (request.status === 200) {
						// What do when the request is successful
						let response = request.response;

						if (response.body.id === 'js-BASK') {
							const basketData = response.querySelector('[data-hook="mini-basket"]');
							const basketCount = basketData.getAttribute('data-item-count');
							const basketSubtotal = basketData.getAttribute('data-subtotal');

							if (miniBasketCount) {
								for (let mbcID = 0; mbcID < miniBasketCount.length; mbcID++) {
									let miniBasketButton = miniBasketCount[mbcID].parentElement;
									let miniBasketIcon = miniBasketCount[mbcID].previousElementSibling;

									miniBasketCount[mbcID].textContent = basketCount; // Update mini-basket quantity (display only)
									if (miniBasketButton && miniBasketButton.matches('[data-hook="open-mini-basket"]')) {
										miniBasketIcon.classList.add('u-icon-cart-full');
									}
								}
							}

							if (miniBasketAmount) {
								for (let mbaID = 0; mbaID < miniBasketAmount.length; mbaID++) {
									miniBasketAmount[mbaID].textContent = basketSubtotal; // Update mini-basket subtotal (display only)
								}
							}

							if (typeof miniBasket !== 'undefined' && mivaJS.miniBasket.use) {
								document.querySelector('[data-hook="mini-basket"]').innerHTML = response.querySelector('[data-hook="mini-basket"]').innerHTML;

								setTimeout(() => {
									document.querySelector('[data-hook="open-mini-basket"]').click();
								}, 100);
							}
							else {
								responseMessage.innerHTML = '<div class="x-messages x-messages--success"><span class="u-icon-check"></span> Added to cart.</div>';
							}

							// Re-Initialize Attribute Machine (if it is active)
							if (typeof attrMachCall !== 'undefined') {
								attrMachCall.Initialize();
							}
						}
						else if (response.body.id === 'js-PATR') {
							const findRequired = purchaseForm.querySelectorAll('.is-required');
							const missingAttributes = [];

							for (let id = 0; id < findRequired.length; id++) {
								missingAttributes.push(` ${findRequired[id].title}`);
							}

							responseMessage.innerHTML = `<div class="x-messages x-messages--warning">All <em class="u-color-red">Required</em> options have not been selected.<br />Please review the following options: <span class="u-color-red">${missingAttributes}</span>.</div>`;
						}
						else if (response.body.id === 'js-PLMT') {
							responseMessage.innerHTML = '<div class="x-messages x-messages--warning">We do not have enough of the combination you have selected.<br />Please adjust your quantity.</div>';
						}
						else if (response.body.id === 'js-POUT') {
							responseMessage.innerHTML = '<div class="x-messages x-messages--warning">The combination you have selected is out of stock.<br />Please review your options or check back later.</div>';
						}
						else {
							responseMessage.innerHTML = '<div class="x-messages x-messages--warning">Please review your selection.</div>';
						}

						// Reset button text and form status
						purchaseButton.classList.remove('is-disabled');

						if (purchaseButton.nodeName.toLowerCase() === 'input') {
							purchaseButton.value = purchaseButtonText;
						}
						else {
							purchaseButton.textContent = purchaseButtonText;
						}

						purchaseForm.setAttribute('data-status', 'idle');
					}
					else {
						// What do when the request fails
						console.log('The request failed!');
						purchaseForm.setAttribute('data-status', 'idle');
					}
				};

				/**
				 * Create and send a request
				 * The first argument is the post type (GET, POST, PUT, DELETE, etc.)
				 * The second argument is the endpoint URL
				 */
				request.open(purchaseForm.method, purchaseForm.action, true);
				request.responseType = 'document';
				request.send(data);
			}
		}, false);
	};

	/**
	 * Public APIs
	 */
	return publicMethods;
})(document);
