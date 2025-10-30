/**
 * `_hook` is a small utility function for scanning the DOM for `data-hook` attributes.
 * It helps to reduce the need for typing `document.querySelector` or
 * `document.querySelectorAll` multiple times in an application.
 *
 * @param selector | The `data-hook` attribute value you are looking for. Leaving blank
 * or entering '*' will return all `data-hook` elements. This can be useful for debugging,
 * but not much else.
 * @param base | Pass where you want to start your qSA from -  Default = `document`
 * @returns {elements} | Returns either a single element or a NodeList.
 * @private
 */
const _hook = (selector, base) => {
	let context = base || document;
	let elements;

	if (!selector || selector === '*') {
		elements = context.querySelectorAll('[data-hook]');
	}
	else {
		elements = context.querySelectorAll(`[data-hook~="${selector}"]`);
	}

	return (elements.length === 1) ? elements[0] : elements;
};

/**
 *    HTML Class Name
 *    This function will check if JavaScript is enabled, detect touch and hover
 *    capabilities, and modify the class list as needed.
 */
(() => {
	document.documentElement.classList.remove('no-js');
	document.documentElement.classList.add('js');
})();
