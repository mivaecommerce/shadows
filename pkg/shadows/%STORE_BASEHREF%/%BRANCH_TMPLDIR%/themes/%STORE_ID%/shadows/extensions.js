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
 * Version: 10.12.00
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
			event?.preventDefault?.();
			event?.stopPropagation?.();
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

		if (!mivaJS.miniBasket.use) {
			return;
		}

		document.addEventListener('global_minibasket:updated', (e) => {
			const content = e.detail?.content;

			if (!content) {
				return;
			}

			const newMb = document.createElement('div');
			newMb.innerHTML = content;

			const newMbElement = newMb.querySelector('[data-hook~="mini-basket"]');
			const newMbContent = newMb.querySelector('[data-hook~="mini-basket__content"]');
			const itemCount = newMbElement?.dataset?.itemCount ?? mbElement.dataset.itemCount;
			const subtotal = newMbElement?.dataset?.subtotal ?? mbElement.dataset.subtotal;

			mbElement.dataset.itemCount = itemCount;
			mbElement.dataset.subtotal = subtotal;
			mbContent.innerHTML = newMbContent.innerHTML ?? mbContent.innerHTML;

			const miniBasketCounts = document.querySelectorAll('[data-hook~="mini-basket-count"]');

			miniBasketCounts.forEach(count => {
				count.textContent = itemCount;

				const icon = count.previousElementSibling;

				if (icon.classList.contains('u-icon-cart-empty')) {
					icon.classList.add('u-icon-cart-full');
				}
			});

			if (e.detail?.openMenu) {
				toggleMenu(null, 'open');
			}
		});

		if (mivaJS.miniBasket.closeOnBackground) {
			mbElement.addEventListener('click', function (event) {
				if (event.target === this) {
					toggleMenu(event, 'close');
				}
			}, false);
		}

		if (mivaJS.miniBasket.closeOnEsc) {
			window.addEventListener('keydown', event => {
				const escKey = (event.key === 'Escape');
				const openDialog = document.querySelector('[data-dialog][aria-hidden=false]');

				if (event.defaultPrevented) {
					return;
				}

				if (!escKey) {
					return;
				}

				if (openDialog) {
					return;
				}

				if (mbElement.classList.contains('x-mini-basket--open') ) {
					event.preventDefault();
					toggleMenu(event, 'close');
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
						event.stopPropagation();
						event.preventDefault();

						const button = event.target;
						const inputs = [].filter.call(this.children, sibling => sibling !== button && sibling.closest('input'));
						const input = inputs[0];
						const change = new Event('change');
						const action = button.getAttribute('data-action');

						let max = parseInt(input.dataset?.max);
						let min = parseInt(input.dataset?.min);
						let step = parseInt(input.dataset?.step);
						let value = parseInt(input.value);

						max = isNaN(max) ? Infinity : max;
						min = isNaN(min) ? 1 : min;
						step = isNaN(step) ? 1 : step;

						if (action === 'decrement') {
							value -= step;
						}
						else if (action === 'increment') {
							value += step;
						}

						if (isNaN(value)) {
							input.value = min;
						}
						else if (value < min) {
							input.value = min;
						}
						else if (value > max) {
							input.value = max;
						}
						else {
							input.value = value;
						}

						input.dispatchEvent(change);
						allowRemoveUpdate(section);
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
 */

class TransfigureNavigation {
	#settings = {
		container: '[data-hook~="transfigure-navigation"]',
		hasDropDown: '[data-hook~="has-drop-down"]',
		desktopMedia: '(min-width: 60em)',
		openMainMenu: '[data-hook~="open-main-menu"]',
		closeMainMenu: '[data-hook~="close-main-menu"]',
		hasChildMenuLinks: '[data-hook~="has-child-menu"] > a',
		showPreviousMenuButtons: '[data-hook~="show-previous-menu"]'
	};

	constructor(settings = {}) {
		this.#settings = Object.assign(this.#settings, settings);
		this.#bindEvents();
	}

	#bindEvents() {
		this.#listenForContainerClicks();
		this.#listenForMobileMenuOpenCloseClicks();
		this.#listenForSubNavigationEvents();
		this.#listenToKeepDesktopMenuOnPage();
	}

	// Mobile Backdrop Click
	get #container () {
		return document.querySelector(this.#settings.container);
	}

	get #desktopBreakpoint() {
		return window.matchMedia(this.#settings.desktopMedia);
	}

	#listenForContainerClicks() {
		this.#container?.addEventListener('click', e => {
			this.#detectMobileContainerClick(e);
			this.#detectLinkClick(e);
		}, {capture: true});
	}

	#detectMobileContainerClick(e) {
		if (!this.#desktopBreakpoint.matches && e.target === this.#container) {
			this.#onMobileContainerClick(e);
		}
	}

	#onMobileContainerClick(e) {
		e.preventDefault();
		this.#closeMenu();
	}

	#detectLinkClick(e) {
		const link = this.#getEventLink(e);

		if (link) {
			this.#onLinkClick({e, link});
		}
	}

	#getEventLink(e) {
		// handle when target is: `a`
		if (e?.target?.nodeName === 'A') {
			return e.target;
		}
		// handle when target is: `a > span`
		else if (e?.target?.parentElement?.nodeName === 'A') {
			return e.target.parentElement;
		}
		else {
			return null;
		}
	}

	#onLinkClick({e, link} = {}) {
		requestAnimationFrame(() => {
			this.#lastClickedLink = link;
		});
	}

	// Mobile Menu Toggles
	get #openMainMenu() {
		return document.querySelectorAll(this.#settings.openMainMenu);
	}

	get #closeMainMenu() {
		return document.querySelectorAll(this.#settings.closeMainMenu);
	}

	#listenForMobileMenuOpenCloseClicks() {
		this.#openMainMenu.forEach(button => {
			button.addEventListener('click', e => {
				e.preventDefault();
				this.#openMenu();
			});
		});

		this.#closeMainMenu.forEach(button => {
			button.addEventListener('click', e => {
				e.preventDefault();
				this.#closeMenu();
			});
		});
	}

	#openMenu() {
		document.documentElement.classList.add('has-open-main-menu');
		this.#container.classList.add('is-open');
	}

	#closeMenu() {
		document.documentElement.classList.remove('has-open-main-menu');
		this.#container.classList.remove('is-open');
	}

	// Mobile Menu Navigation
	get #hasChildMenuLinks() {
		return this.#container.querySelectorAll(this.#settings.hasChildMenuLinks);
	}

	get #showPreviousMenuButtons() {
		return this.#container.querySelectorAll(this.#settings.showPreviousMenuButtons);
	}

	#listenForSubNavigationEvents() {
		this.#hasChildMenuLinks.forEach(link => {
			link.addEventListener('click', e => {
				this.#onParentMenuClick({e, link});
			});
		});

		this.#showPreviousMenuButtons.forEach(button => {
			button.addEventListener('click', e => {
				if (this.#desktopBreakpoint.matches) return;
				e.preventDefault();
				this.#showPreviousMobileMenu(button);
			});
		});
	}

	#onParentMenuClick({e, link} = {}) {
		if (this.#desktopBreakpoint.matches) {
			if (this.#shouldPreventFirstLinkClick(link)) {
				e.preventDefault();
			}
		}
		else {
			e.preventDefault();
			this.#showNextMobileMenu(link);
		}
	}

	#lastClickedLink;

	#shouldPreventFirstLinkClick(link) {
		const cantHover = window.matchMedia('(hover: none)').matches;
		return cantHover && this.#lastClickedLink !== link;
	}

	#showNextMobileMenu(link) {
		link.nextElementSibling?.classList?.remove?.('is-hidden');
		link.parentElement?.closest?.('ul')?.classList?.add?.('show-next');
	}

	#showPreviousMobileMenu(button) {
		const ul = button?.parentElement;
		const parentUl = ul?.parentElement?.closest('ul');

		ul?.classList?.add?.('is-hidden');
		parentUl?.classList?.remove?.('show-next');
	}

	// Keep Desktop Menu On-Page
	get #hasDropDown() {
		return this.#container.querySelectorAll(this.#settings.hasDropDown);
	}

	#listenToKeepDesktopMenuOnPage() {
		this.#hasDropDown.forEach(menu => {
			menu.addEventListener('mouseenter', () => {
				if (!this.#desktopBreakpoint.matches) {
					return;
				}

				this.#onDesktopMenuMouseEnter(menu);
			});
		});
	}

	#onDesktopMenuMouseEnter(menu) {
		const childMenu = menu.querySelector('ul');
		const grandChildMenu = childMenu?.querySelector('ul');

		const dimensions = {
			documentWidth: document.documentElement.clientWidth,
			childMenu: childMenu.getBoundingClientRect(),
			grandChildMenu: this.#getHiddenBoundingClientRect(grandChildMenu)
		};

		dimensions.totalRight = dimensions.childMenu.right + (dimensions.grandChildMenu?.width ?? 0);

		if (dimensions.totalRight > dimensions.documentWidth) {
			menu.classList.add('is-off-screen');
		}
		else {
			menu.classList.remove('is-off-screen');
		}
	}

	#getHiddenBoundingClientRect(element) {
		if (typeof element?.cloneNode !== 'function') {
			return undefined;
		}

		const clone = element.cloneNode(true);

		clone.style.display = 'block';
		clone.style.visibility = 'hidden';
		clone.style.pointerEvents = 'none';

		element.after(clone);

		const rect = clone.getBoundingClientRect();

		clone.remove();

		return rect;
	}
}
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
	 * @type {{focused: Element, focusable: string, el: Element, init: function, show: function, hide: function, trap: function, getFocusable: function, getFirstFocusable: function, setInert: function, removeInert: function}}
	 */
	let dialog = {
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


	const getDialogs = function getDialogs() {
		return Array.from(document.querySelectorAll('[data-dialog]'));
	};


	/**
	 * Handle dialog related click events
	 */
	document.addEventListener('click', e => {
		// Close the open dialog when clicking on the background.
		if (e.target === dialog.el?.firstElementChild) {
			if (dialog.el.getAttribute('aria-hidden') === 'false') {
				e.preventDefault();
				dialog.hide();
			}
		}

		// Open the dialog when clicking on a [data-dialog-trigger] element
		if (e.target.hasAttribute?.('data-dialog-trigger')) {
			e.preventDefault();
			let name = e.target.dataset.dialogTrigger;

			dialog.el = getDialogs().find(({dataset}) => dataset.dialog === name);
			if (validateDialogPresence(name) !== false) {
				dialog.show();
			}
		}

		// Close the dialog when clicking on a [data-dialog-close] element
		if (e.target.hasAttribute?.('data-dialog-close')) {
			e.preventDefault();
			dialog.hide();
		}
	});


	/**
	 * Initialize the dialogs
	 */
	dialog.init = () => {
		getDialogs().forEach(dialog => {
			dialog.setAttribute('aria-hidden', 'true');
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

		dialog.el.dispatchEvent(new CustomEvent('show'));
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
		dialog.el.dispatchEvent(new CustomEvent('hide'));
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
			if (!getDialogs().includes(child) && child !== dialog.el && child.tagName !== 'LINK' && child.tagName !== 'SCRIPT') {
				child.classList.add('is-inert');
				child.setAttribute('inert', '');
			}
		});
	};

	dialog.removeInert = () => {
		Array.from(document.body.children).forEach(child => {
			if (!getDialogs().includes(child) && child !== dialog.el && child.tagName !== 'LINK' && child.tagName !== 'SCRIPT') {
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
		dialog.el = getDialogs().find(({dataset}) => dataset.dialog === targetDialog);
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
	let lastWindowWidth = 0;
	let togglesMap = {};
	let targetsMap = {};

	function findElement(selector, context) {
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
		setLastWindowWidth();

		togglesMap = findElement('[data-a11y-toggle]', context).reduce((acc, toggle) => {
			let selector = `#${toggle.getAttribute('data-a11y-toggle')}`;

			acc[selector] = acc[selector] || [];
			acc[selector].push(toggle);
			return acc;
		}, togglesMap);

		let targets = Object.keys(togglesMap);

		targets.length && findElement(targets).forEach(target => {
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

		targets.length && findElement(targets).forEach(target => {
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

	const setLastWindowWidth = () => {
		lastWindowWidth = window.innerWidth;
	};

	const isVerticalResize = () => {
		if (window.innerWidth === lastWindowWidth) {
			return true;
		}

		setLastWindowWidth();

		return false;
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
		if (isVerticalResize()) {
			return;
		}

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
