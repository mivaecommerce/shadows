/**
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |c|o|l|l|a|p|s|i|n|g| |b|r|e|a|d|c|r|u|m|b|s|
 +-+-+-+-+-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+-+
 *
 * This extension is a variation on the Priority + navigation pattern where extra links are
 * hidden behind a trigger when they do not fit into the allotted space. With breadcrumbs,
 * we are hiding the links at the start of the list, instead of at the end.
 */

(function ($, window) {
	'use strict';

	var $breadcrumbNavigation = $.hook('collapsing-breadcrumbs');
	var $triggerArea = $.hook('collapsing-breadcrumbs__trigger-area');
	var $displayButton = $.hook('collapsing-breadcrumbs__button');
	var $visibleLinks = $.hook('collapsing-breadcrumbs__list');
	var $hiddenLinks = $.hook('collapsing-breadcrumbs__group');
	var numOfItems = 0;
	var totalSpace = 64;
	var breakWidths = [];
	var availableSpace;
	var numOfVisibleItems;
	var requiredSpace;

	/**
	 * Check the total space required for the breadcrumb links and how many there are.
	 */
	$visibleLinks.children().each(function () {
		totalSpace += $(this).outerWidth(true) + (parseInt($visibleLinks.css('padding-left')));
		numOfItems += 1;
		breakWidths.push(totalSpace);
	});

	/**
	 * Compare the needed space with the available space and move breadcrumbs accordingly.
	 * @returns {jQuery}
	 */
	$.fn.checkNavigationOverflow = function () {
		// Get instant state
		availableSpace = $visibleLinks.outerWidth(true) - parseInt($visibleLinks.css('padding-right'));
		numOfVisibleItems = $visibleLinks.children().length;
		requiredSpace = breakWidths[numOfVisibleItems - 1];

		// There is not enough space
		if (requiredSpace > availableSpace) {
			$visibleLinks.children('[data-hook="collapsing-breadcrumbs__item"]').first().appendTo($hiddenLinks);
			numOfVisibleItems -= 1;
			$breadcrumbNavigation.addClass('is-loaded');
			this.checkNavigationOverflow();
		}
		// There is more than enough space
		else if (availableSpace > breakWidths[numOfVisibleItems]) {
			$hiddenLinks.children().last().prependTo($visibleLinks).insertAfter($triggerArea);
			numOfVisibleItems += 1;
			$breadcrumbNavigation.addClass('is-loaded');
			this.checkNavigationOverflow();
		}

		// Update the button accordingly
		if (numOfVisibleItems === numOfItems) {
			$triggerArea.addClass('u-hidden');
		}
		else {
			$triggerArea.removeClass('u-hidden');
		}

		return this;
	};


	/**
	 * Check for rezise and control button click.
	 */
	$.fn.collapsingBreadcrumbs = function () {
		var initElement = this;
		var animationTimeout;

		window.addEventListener('resize', function () {
			if (animationTimeout) {
				window.cancelAnimationFrame(animationTimeout);
			}

			animationTimeout = window.requestAnimationFrame(function () {
				initElement.checkNavigationOverflow();
			});
		}, false);

		$displayButton.on('click', function () {
			$hiddenLinks.toggleClass('u-hidden');
		});

		initElement.checkNavigationOverflow();
	};

	/**
	 * Initialize the extension.
	 */
	if ($breadcrumbNavigation.length > 0) {
		$breadcrumbNavigation.collapsingBreadcrumbs();
	}

})(jQuery, window);

/**
 * +-+-+-+-+-+-+
 * |d|i|a|l|o|g|
 * +-+-+-+-+-+-+
 *
 * A modal that is fully keyboard accessible. Keyboard focus will lock to the modal only while open and can be closed
 * by pressing Escape or tabbing to the 'close' button. For non-keyboard navigation, the modal can be closed through
 * clicking on the background.
 *
 * Based on `Accessible modal with tab trap and vanilla JS` by Danielle [https://codepen.io/hidanielle/pen/MyggJJ]
 * Updated version by Matt Zimmermann [https://github.com/influxweb]
 * Version: 1.0.0
 * License: MIT
 */

(function () {
	'use strict';

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
		init: function () {},
		show: function () {},
		hide: function () {},
		trap: function () {},
		getFocusable: function () {},
		getFirstFocusable: function () {},
		setInert: function () {},
		removeInert: function () {}
	};


	/**
	 * Validates whether a dialog of the given `data-dialog` exists in the DOM
	 * @param {string} id The data-dialog of the dialog
	 * @returns {boolean}
	 */
	const validateDialogPresence = function validateDialogPresence(id) {
		if (!document.querySelector('[data-dialog=' + id + ']')) {
			console.warn("Dialog: \u2757Seems like you have missed %c'".concat(id, "'"), 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', 'data-dialog somewhere in your code. Refer example below to resolve it.');
			console.warn("%cExample:", 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', "<div class=\"c-dialog\" aria-hidden=\"true\" data-dialog=\"".concat(id, "\"></div>"));
			return false;
		}
	};


	/**
	 * Initialize the dialog, find the focusable children elements, and set up the click handlers.
	 */
	dialog.init = function () {
		dialog.set.forEach(function (dialog) {
			dialog.setAttribute('aria-hidden', 'true');
		});

		dialog.openTriggers.forEach(function (trigger) {
			trigger.addEventListener('click', function (e) {
				e.preventDefault();
				let name = this.dataset.dialogTrigger;

				dialog.el = dialog.set.find(function (value) {
					return value.dataset.dialog === name;
				});
				if (validateDialogPresence(name) !== false) {
					dialog.show();
				}
			});
		});

		dialog.closeTriggers.forEach(function (trigger) {
			trigger.addEventListener('click', function (e) {
				e.preventDefault();
				dialog.hide();
			});
		});

		/**
		 * Close the open dialog when clicking on the background.
		 */
		document.addEventListener('click', function (clickEvent) {
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
	dialog.show = function () {
		document.body.appendChild(dialog.el);
		dialog.setInert();

		document.body.classList.add('has-dialog');
		dialog.focused = document.activeElement;
		dialog.el.setAttribute('aria-hidden', 'false');

		// Focus the first focusable item in the dialog.
		dialog.getFirstFocusable().focus();
		dialog.el.onkeydown = function (e) {
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
	dialog.hide = function () {
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
	dialog.trap = function (e) {
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
	dialog.getFocusable = function () {
		return Array.from(dialog.el.querySelectorAll(dialog.focusable));
	};

	/**
	 * Get the first focusable element inside of the dialog.
	 * @returns {Object} A DOM element
	 */
	dialog.getFirstFocusable = function () {
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
	dialog.setInert = function () {
		Array.from(document.body.children).forEach(function (child) {
			if (dialog.set.indexOf(child) === -1 && child !== dialog.el && child.tagName !== 'LINK' && child.tagName !== 'SCRIPT') {
				child.classList.add('is-inert');
				child.setAttribute('inert', '');
				//child.setAttribute('aria-hidden', 'true');
			}
		});
	};

	dialog.removeInert = function () {
		Array.from(document.body.children).forEach(function (child) {
			if (dialog.set.indexOf(child) === -1 && child !== dialog.el && child.tagName !== 'LINK' && child.tagName !== 'SCRIPT') {
				child.classList.remove('is-inert');
				child.removeAttribute('inert');
				//child.removeAttribute('aria-hidden');
			}
		});
	};


	/**
	 * This is a helper function we will put into `window` to allow for opening of a specific dialog.
	 * @param targetDialog
	 */
	let openDialog = function (targetDialog) {
		dialog.el = dialog.set.find(function (value) {
			return value.dataset.dialog === targetDialog;
		});
		if (validateDialogPresence(targetDialog) !== false) {
			dialog.show();
		}
	};
	window && (window.openDialog = openDialog);


	/**
	 * This is a helper function we will put into `window` to allow for closing of a specific dialog.
	 */
	let closeDialog = function () {
		dialog.hide();
	};
	window && (window.closeDialog = closeDialog);


	/**
	 * This is a helper function we will put into `window` to allow for rescanning of the page when
	 * dynamic content has been added. It will then reinitialize.
	 */
	let reloadDialog = function () {
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
 +-+-+-+-+-+-+-+-+-+-+-+-+-+
 |f|a|s|t|e|n| |h|e|a|d|e|r|
 +-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 * This extension is a more refined version of a classic "sticky" header function.
 */

function fastenHeader(position, siteHeader) {
	'use strict';

	let siteHeaderHeight = siteHeader.offsetHeight;

	if (position > siteHeaderHeight) {
		document.body.classList.add('x-fasten-header--is-active');
	}
	else {
		document.body.classList.remove('x-fasten-header--is-active');
	}
}

if ((sessionStorage.getItem('USER_CAN_HOVER') === null || sessionStorage.getItem('USER_CAN_HOVER') === 'true') && document.querySelector('[data-hook="fasten-header"]')) {
	const siteHeader = document.querySelector('[data-hook="site-header"]');
	let animationTimeout;

	fastenHeader(window.pageYOffset || document.documentElement.scrollTop, siteHeader);

	window.addEventListener('scroll', function () {
		'use strict';

		if (animationTimeout) {
			window.cancelAnimationFrame(animationTimeout);
		}

		animationTimeout = window.requestAnimationFrame(function () {
			fastenHeader(window.pageYOffset || document.documentElement.scrollTop, siteHeader);
		});
	}, false);
}

/**
 * 	Closable Messages
 */
(function () {
	'use strict';
	let closeElements = document.querySelectorAll('[data-hook="message__close"]');

	Array.prototype.forEach.call(closeElements, function (element) {
		let ux_message_closer = element;
		let ux_message = ux_message_closer.parentNode;

		ux_message_closer.addEventListener('click', function (event) {
			event.preventDefault();
			ux_message.classList.add('u-hidden');
		}, false);
	});
}());

/**
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |m|i|n|i|B|a|s|k|e|t|
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 * This is an extension to use the mini-basket functionality of Miva in an
 * off-canvas method.
 */

const miniBasket = (function (document) {
	'use strict';

	let mbElement = document.querySelector('[data-hook="mini-basket"]');
	let mbContent = mbElement.querySelector('[data-hook="mini-basket__content"]');
	let publicMethods = {}; // Placeholder for public methods
	let defaults = {
		closeOnBackgroundClick: true,
		closeOnEscClick: true
	};
	let openTrigger;

	/**
	 * Merge two or more objects. Returns a new object.
	 * Set the first argument to `true` for a deep or recursive merge [optional]
	 * @private
	 * @returns {Object}	Merged values of defaults and options
	 */
	let extend = function () {

		// Variables
		let extended = {};
		let deep = false;
		let i = 0;
		let length = arguments.length;

		// Check if a deep merge
		if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
			deep = arguments[0];
			i++;
		}

		// Merge the object into the extended object
		let merge = function (obj) {
			for (let prop in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, prop)) {
					// If deep merge and property is an object, merge properties
					if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
						extended[prop] = extend(true, extended[prop], obj[prop]);
					}
					else {
						extended[prop] = obj[prop];
					}
				}
			}
		};

		// Loop through each object and conduct a merge
		for (; i < length; i++) {
			let obj = arguments[i];
			merge(obj);
		}

		return extended;

	};

	/**
	 * Toggle the visibility of the mini-basket
	 * @private
	 */
	let toggleMenu = function (event, display) {
		event.preventDefault();
		event.stopPropagation();
		if (display === 'open') {
			mbElement.parentElement.hidden = false;
		}

		setTimeout(function () {
			document.documentElement.classList.toggle('u-overflow-hidden');
			mbElement.classList.toggle('x-mini-basket--open');
			a11yHelper();
		}, 50);

		if (display === 'close') {
			setTimeout(function () {
				mbElement.parentElement.hidden = true;
			}, 300);
		}
	};

	/**
	 * Manage focus for accessibility
	 * @private
	 */
	let a11yHelper = function () {
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
			mbContent.addEventListener('keydown', function (keyEvent) {
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
	publicMethods.toggle = function (event, display) {
		toggleMenu(event, display);
	};

	/**
	 * Initialize the plugin
	 * @public
	 */
	publicMethods.init = function (options) {
		// Merge user options with defaults
		let settings = extend(defaults, options || {});

		// Element.matches() Polyfill
		if (!Element.prototype.matches) {
			Element.prototype.matches = Element.prototype.msMatchesSelector;
		}

		mbElement.parentElement.hidden = true;

		// Open the mini-basket when clicking the trigger
		document.addEventListener('click', function (event) {
			if (!event.target.closest('[data-hook~="open-mini-basket"]')) {
				return;
			}
			toggleMenu(event, 'open');
		}, false);

		// Close the mini-basket when clicking any 'close' triggers
		document.addEventListener('click', function (event) {
			if (!event.target.closest('[data-hook~="close-mini-basket"]')) {
				return;
			}
			toggleMenu(event, 'close');
		}, false);

		// If enabled, close the mini-basket when clicking the background
		if (settings.closeOnBackgroundClick) {
			mbElement.addEventListener('click', function (event) {
				if (event.target === this) {
					toggleMenu(event, 'close');
				}
			}, false);
		}

		// If enabled, close the mini-basket when the `Esc` key is pressed
		if (settings.closeOnEscClick) {
			window.addEventListener('keydown', function (event) {
				let escKey = (event.key === 'Escape');

				if (event.defaultPrevented) {
					return; // Do nothing if the event was already processed
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

}(document));

(function ($, window, document) {
	'use strict';

	let touchCapable = 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

	/**
	 * Double Tap To Go [http://osvaldas.info/drop-down-navigation-responsive-and-touch-friendly]
	 * By: Osvaldas Valutis [http://www.osvaldas.info]
	 * License: MIT
	 */
	$.fn.doubleTapToGo = function () {
		if (touchCapable) {
			this.each(function () {
				let curItem = false;

				$(this).on('click', function (event) {
					let item = $(this);

					if (item[0] !== curItem[0]) {
						event.preventDefault();
						curItem = item;
					}
				});

				$(document).on('click touchstart MSPointerDown', function (event) {
					let resetItem = true,
						parents = $(event.target).parents();

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
			let parentElement = $(this),
				childElement = parentElement.find('ul').first(),
				grandchildElement = childElement.find('ul').first(),
				childOffsetWidth = childElement.offset().left + childElement.width(),
				documentWidth = container ? container.outerWidth() : document.documentElement.clientWidth;

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

		window.addEventListener('resize', function () {
			if (!waitForIt) {
				waitForIt = setTimeout(function () {
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

		document.querySelector('[data-hook="open-main-menu"]').addEventListener('click', function (event) {
			event.preventDefault();
			document.documentElement.classList.add('has-open-main-menu');
			navigationExtension.classList.add('is-open');
		});

		document.querySelector('[data-hook="close-main-menu"]').addEventListener('click', function (event) {
			event.preventDefault();
			document.documentElement.classList.remove('has-open-main-menu');
			navigationExtension.classList.remove('is-open');
		});

		if (clientPort < 960) {
			showSubnavigation();
		}
		else {
			if (!!window.MSInputMethodContext && !!document.documentMode) {
				topLevelLinks.forEach(function (link) {
					if (link.nextElementSibling) {
						link.addEventListener('focus', function () {
							this.parentElement.classList.add('focus-within');
						});
	
						const subMenu = link.nextElementSibling;
						const subMenuLinks = subMenu.querySelectorAll('a');
						const lastLinkIndex = subMenuLinks.length - 1;
						const lastLink = subMenuLinks[lastLinkIndex];
	
						lastLink.addEventListener('blur', function () {
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
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |q|u|a|n|t|i|f|y|
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 * This extension allows for the use of buttons to increase/decrease item
 * quantities on the product and basket pages. When used on the basket page,
 * the decrease button becomes a remove button if the quantity is 1.
 */

(function () {
	'use strict';

	const adjusters = document.querySelectorAll('[data-hook="quantify"]');

	for (let id = 0; id < adjusters.length; id++) {
		/**
		 * This listener prevents the `enter` key from adjusting the `input` value.
		 */
		adjusters[id].addEventListener('keydown', function (keyEvent) {
			if (keyEvent.target.closest('input')) {
				if (keyEvent.key === 'Enter') {
					keyEvent.preventDefault();
				}
			}
		});

		adjusters[id].addEventListener('click', function (event) {
			if (event.target.closest('button')) {
				let button = event.target;
				let inputs = [].filter.call(this.children, function (sibling) {
					return sibling !== button && sibling.closest('input');
				});
				let input = inputs[0];
				let value = parseInt(input.value);
				let action = button.getAttribute('data-action');
				let changed = document.createEvent('HTMLEvents');

				changed.initEvent('change', true, false);
				event.stopPropagation();
				event.preventDefault();

				if (action === 'decrement') {
					/**
					 * THIS CAN BE USED TO SET A MINIMUM QUANTITY
					 * value > 5 ? value - 1 : 5;
					 */
					input.value = value > 1 ? value - 1 : 1;
					input.dispatchEvent(changed);
					allowRemoveUpdate();
				}
				else if (action === 'increment') {
					/**
					 * THIS CAN BE USED TO SET A MAXIMUM QUANTITY
					 * value < 100 ? value + 1 : 100;
					 */
					input.value = value + 1;
					input.dispatchEvent(changed);
					allowRemoveUpdate();
				}
			}
		});
	}

	function allowRemoveUpdate() {
		let quantities = document.querySelectorAll('[data-hook="group-quantity"]');

		function toggleRemove(input, quantity) {
			if (parseInt(quantity) > 1) {
				input.previousElementSibling.classList.remove('is-disabled');
			}
			else {
				input.previousElementSibling.classList.add('is-disabled');
			}
		}

		if (quantities) {
			for (let id = 0; id < quantities.length; id++) {
				let quantityLine = quantities[id];
				let updateTimeout = null;

				toggleRemove(quantityLine, quantityLine.value);

				quantityLine.addEventListener('change', function (event) {
					let input = this;

					clearTimeout(updateTimeout);
					updateTimeout = setTimeout(function () {
						toggleRemove(input, input.value);
						groupSubmit(event, input);
					}, 250);
				});

				quantityLine.addEventListener('input', function (event) {
					let input = this;

					clearTimeout(updateTimeout);
					updateTimeout = setTimeout(function () {
						toggleRemove(input, input.value);
						groupSubmit(event, input);
					}, 250);
				});
			}
		}
	}

	allowRemoveUpdate();

	function groupSubmit(event, quantity) {
		if (event.key !== 8 && event.key !== 37 && event.key !== 38 && event.key !== 39 && event.key !== 40 && event.key !== 46 && quantity.value !== '') {
			document.querySelector('[data-hook="' + event.target.getAttribute('data-group') + '"]').submit();
		}
	}
})();

/**
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |p|a|y|m|e|n|t| |m|e|t|h|o|d|
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 * Payment-method is a lightweight plugin which used to help determine the type
 * of credit card being used and set, or update, the payment method field for
 * order submission on the Checkout: Payment Information page in Miva Merchant.
 *
 * Author: Matt Zimmermann [https://github.com/influxweb]
 * Version: 1.0.1
 * License: MIT
 */

const paymentMethod = (function (document) {
	'use strict';

	const publicMethods = {}; // Placeholder for public methods

	/**
	 * Initialize the plugin
	 * @public
	 */
	publicMethods.detect = function (element, callback) {
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
			digits = (number + '').split('').reverse();
	
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

}(document));

/**
 * When called from a `theme.js` file on a product page, this extension will
 * work with the default page code to add a product to the cart utilizing an
 * AJAX call to the form processor.
 *
 * The function contains internal error checking as well as a check to see which
 * page was reached and displaying messages accordingly. If the store is also
 * utilizing the `mini-basket` extension, said extension will be triggered for
 * display upon successfully adding a product to the cart.
 */
const addToCart = (function (document) {
	'use strict';

	const publicMethods = {}; // Placeholder for public methods

	/**
	 * Initialize the plugin
	 * @public
	 */
	publicMethods.init = function () {
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

		purchaseButton.addEventListener('click', function (evt) {
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
					else if (field.type.indexOf('select') !== -1) {
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
				request.onreadystatechange = function () {
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
									miniBasketCount[mbcID].textContent = basketCount; // Update mini-basket quantity (display only)
								}
							}

							if (miniBasketAmount) {
								for (let mbaID = 0; mbaID < miniBasketAmount.length; mbaID++) {
									miniBasketAmount[mbaID].textContent = basketSubtotal; // Update mini-basket subtotal (display only)
								}
							}

							if (typeof miniBasket !== 'undefined' && mivaJS.showMiniBasket === 1) {
								document.querySelector('[data-hook="mini-basket"]').innerHTML = response.querySelector('[data-hook="mini-basket"]').innerHTML;

								setTimeout(function () {
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
								missingAttributes.push(' ' + findRequired[id].title);
							}

							responseMessage.innerHTML = '<div class="x-messages x-messages--warning">All <em class="u-color-red">Required</em> options have not been selected.<br />Please review the following options: <span class="u-color-red">' + missingAttributes + '</span>.</div>';
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

}(document));

/**
 * Show Password
 * This extension allows a user to reveal the password they have typed.
 */

(function () {
	'use strict';

	const passwordInputs = document.querySelectorAll('input[type="password"]');
	const hideLabel = 'Hide Password.';
	const hideText = 'Hide';
	const showLabel = 'Show password as plain text. Warning: this will display your password on the screen.';
	const showText = 'Show';

	function getPreviousSibling(element, selector) {
		let sibling = element.previousElementSibling;

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
		passwordInputs.forEach(function (passwordInput) {
			const toggleButton = document.createElement('button');
			let findLabel = getPreviousSibling(passwordInput, 'label');

			toggleButton.classList.add('c-button');
			toggleButton.classList.add('u-bg-transparent');
			toggleButton.classList.add('x-toggle-password');
			if (findLabel && findLabel.offsetWidth <= 1) {
				toggleButton.classList.add('x-toggle-password--no-label');
			}
			toggleButton.setAttribute('aria-label', showLabel);
			toggleButton.setAttribute('data-hook', 'toggle-password');
			toggleButton.textContent = showText;
			toggleButton.type = 'button';
			passwordInput.parentElement.style.position = 'relative';
			passwordInput.parentElement.insertBefore(toggleButton, passwordInput.nextSibling);
		});

		const togglePasswordButtons = document.querySelectorAll('[data-hook="toggle-password"]');

		if (togglePasswordButtons.length > 0) {
			togglePasswordButtons.forEach(function (togglePasswordButton) {
				togglePasswordButton.addEventListener('click', function () {
					let closestInput = getPreviousSibling(this, 'input');

					if (closestInput.type === 'password') {
						closestInput.type = 'text';
						this.textContent = hideText;
						this.setAttribute('aria-label', hideLabel);
					}
					else {
						closestInput.type = 'password';
						this.textContent = showText;
						this.setAttribute('aria-label', showLabel);
					}

				});
			});
		}
	}
}());

/**
 * A11y Toggles
 * An accessible replacement to the checkbox-hack for toggling sections.
 *
 * By: https://hugogiraudel.com/
 * MIT License: https://github.com/edenspiekermann/a11y-toggle/blob/master/LICENSE
 */

(function () {
	'use strict';

	const distinct = function (value, index, self) {
		return self.indexOf(value) === index;
	};

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

		let toggles = togglesMap['#' + target.id];
		let isExpanded = target.getAttribute('aria-hidden') === 'false';

		target.setAttribute('aria-hidden', isExpanded);
		toggles.forEach(function (toggle) {
			toggle.setAttribute('aria-expanded', !isExpanded);
		});
	}

	let initA11yToggle = function (context) {
		togglesMap = $('[data-a11y-toggle]', context).reduce(function (acc, toggle) {
			let selector = '#' + toggle.getAttribute('data-a11y-toggle');

			acc[selector] = acc[selector] || [];
			acc[selector].push(toggle);
			return acc;
		}, togglesMap);

		let targets = Object.keys(togglesMap);

		targets.length && $(targets).forEach(function (target) {
			let toggles = togglesMap['#' + target.id];
			let isExpanded = target.hasAttribute('data-a11y-toggle-open');
			let labelledby = [];

			if (toggles[0].offsetWidth > 0 && toggles[0].offsetHeight > 0) {
				toggles.forEach(function (toggle) {
					toggle.id || toggle.setAttribute('id', 'a11y-toggle-' + internalId++);
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
				toggles.forEach(function (toggle) {
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

	let destroyA11yToggle = function () {
		let targets = Object.keys(togglesMap);

		targets.length && $(targets).forEach(function (target) {
			let toggles = togglesMap['#' + target.id];

			toggles.forEach(function (toggle) {
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
	
	let closeA11yToggle = function (trigger) {
		if (trigger) {
			const thisToggle = document.querySelector('#' + trigger.getAttribute('data-a11y-toggle'));
			
			document.addEventListener('mousedown', function (event) {
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
	window.addEventListener('resize', function () {
		if (atResizeTimeout) {
			window.cancelAnimationFrame(atResizeTimeout);
		}

		atResizeTimeout = window.requestAnimationFrame(function () {
			initA11yToggle();
		});
	}, false);

	document.addEventListener('click', function (event) {
		let toggle = getClosestToggle(event.target);

		handleToggle(toggle);
	});

	document.addEventListener('keyup', function (keyupEvent) {
		if (keyupEvent.key === 'Enter' || keyupEvent.key === ' ') {
			let toggle = getClosestToggle(keyupEvent.target);

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
 * EXTENSIONS / TABS / A11Y-TABS
 *
 * This is an accessible tab solution extension based on guidelines documented
 * by Heydon Pickering on the Inclusive Components Pattern Library.
 * https://inclusive-components.design/tabbed-interfaces/
 */

const tabbedContent = (function (document) {
	'use strict';

	const publicMethods = {}; // Placeholder for public methods

	/**
	 * Initialize the plugin
	 * @public
	 */
	publicMethods.init = function () {
		// Get relevant elements and collections
		const tabbed = document.querySelector('[data-tab-component]');
		const tabList = tabbed.querySelector('ul');
		const tabs = tabList.querySelectorAll('a');
		const panels = tabbed.querySelectorAll('[id^="tab-"]');
		
		/**
		 * This is a basic placeholder for the proposed CSS `:focus-visible`
		 * pseudo-selector [1] and is based on the WICG polyfill [2]. Once
		 * standardized, this will be updated.
		 *
		 * [1] https://drafts.csswg.org/selectors-4/#the-focus-visible-pseudo
		 * [2] https://github.com/WICG/focus-visible
		 *
		 * Add the `focus-visible` class to the given element.
		 * @param {Element} focusedElement
		 */
		function addFocusVisibleClass(focusedElement) {
			if (focusedElement.classList.contains('focus-visible')) {
				return;
			}
			focusedElement.classList.add('focus-visible');
			focusedElement.setAttribute('data-focus-visible-added', '');
		}
		
		/**
		 * Remove the `focus-visible` class from the given element.
		 * @param {Element} focusedElement
		 */
		function removeFocusVisibleClass(focusedElement) {
			if (!focusedElement.hasAttribute('data-focus-visible-added')) {
				return;
			}
			focusedElement.classList.remove('focus-visible');
			focusedElement.removeAttribute('data-focus-visible-added');
		}
		
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
		Array.prototype.forEach.call(tabs, function (tab, i) {
			tab.setAttribute('role', 'tab');
			tab.setAttribute('id', 'tab' + (i + 1));
			tab.setAttribute('tabindex', '-1');
			tab.parentNode.setAttribute('role', 'presentation');
			
			// Handle clicking of tabs for mouse users
			tab.addEventListener('click', function (clickEvent) {
				clickEvent.preventDefault();
				let currentTab = tabList.querySelector('[aria-selected]');
				
				removeFocusVisibleClass(currentTab);
				removeFocusVisibleClass(panels[i]);
				if (clickEvent.currentTarget !== currentTab) {
					if (window.getComputedStyle(tabbed, '::before').content.replace(/"/g, '') === 'max') {
						tabbed.scrollIntoView(true);
					}
					
					switchTab(currentTab, clickEvent.currentTarget);
				}
			});
			
			// Handle keydown events for keyboard users
			tab.addEventListener('keydown', function (keydownEvent) {
				if ([37, 39, 40].indexOf(keydownEvent.which) > -1) {
					keydownEvent.preventDefault();
				}
			}, false);
			
			// Handle keyup events for keyboard users
			tab.addEventListener('keyup', function (keyupEvent) {
				// Get the index of the current tab in the tabs node list
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
						removeFocusVisibleClass(keyupEvent.currentTarget);
						addFocusVisibleClass(panels[i]);
					}
					/**
					 * If the Shift+Tab combination is pressed, remove focus on the
					 * open panel and return focus to the tab.
					 */
					else if (dir === 'reverse') {
						removeFocusVisibleClass(panels[i]);
						addFocusVisibleClass(keyupEvent.currentTarget);
					}
					// If an arrow key is pressed, switch to the adjacent tab.
					else if (tabs[dir]) {
						removeFocusVisibleClass(keyupEvent.currentTarget);
						addFocusVisibleClass(tabs[dir]);
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
		Array.prototype.forEach.call(panels, function (panel, i) {
			panel.setAttribute('role', 'tabpanel');
			panel.setAttribute('tabindex', '-1');
			panel.setAttribute('aria-labelledby', tabs[i].id);
			panel.hidden = true;
		});
		
		/**
		 * Initially activate the first tab and reveal the first tab panel
		 */
		tabs[0].removeAttribute('tabindex');
		tabs[0].setAttribute('aria-selected', 'true');
		panels[0].hidden = false;
	};

	/**
	 * Public APIs
	 */
	return publicMethods;

}(document));
