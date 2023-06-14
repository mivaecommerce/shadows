/**
 * MMX / BASE
 */

const MMX = {};

MMX.variableType = (value) => {
	const [input, type] = Object.prototype.toString.call(value).match(/\[object (\w+)\]/);
	return type.toLowerCase();
};

MMX.isTruthy = (value) => {
	return [true, 'true', 'yes', 'y', '1', 1].includes(value);
};

MMX.isFalsy = (value) => {
	return [null, undefined, false, 'false', 'no', 'n', '0', 0].includes(value);
};

MMX.copy = (value) => {
	if(typeof value === 'object') {
		return JSON.parse(JSON.stringify(value));
	}

	return value;
};

MMX.assign = (...args) => {
	return Object.assign(...args.map(MMX.copy));
};

MMX.coerceNumber = (value, fallback = 0) => {
	const valueType = MMX.variableType(value);

	if(['null', 'undefined'].includes(valueType)) {
		return fallback;
	}

	if(valueType === 'string' && !value.trim().length) {
		return fallback;
	}

	return isNaN(value) ? fallback : Number(value);
};

MMX.watchData = (obj, callback) => {
	return new Proxy(obj, MMX.proxyHandler(callback));
};

MMX.proxyHandler = (callback) => {
	return {
		get(obj, prop) {
			// Deep-watch the object (i.e. recursively bind a watcher to objects & arrays with the same callback)
			const valueType = MMX.variableType(obj[prop]);
			if (['object', 'array'].includes(valueType)) {
				return MMX.watchData(obj[prop], callback);
			}

			return obj[prop];
		},
		set(obj, prop, value) {
			obj[prop] = value;
			if (typeof callback === 'function') {
				callback();
			}
			return true;
		}
	};
};

MMX.createElement = ({type, content, attributes, data, parent} = {}) => {
	if (typeof type === 'undefined'){
		return;
	}
	let element = document.createElement(type);

	if (typeof content === 'string') {
		element.innerHTML = content;
	}

	if (typeof attributes === 'object') {
		MMX.setElementAttributes(element, attributes);
	}

	if (typeof data === 'object') {
		element.data = MMX.watchData(data, () => {
			element.forceUpdate?.();
		});
	}
	else if (typeof data === 'string') {
		element.data = JSON.stringify(data);
	}

	if (typeof parent !== 'undefined') {
		if (typeof parent === 'string' && parent === 'currentScript') {
			const currentScript = document.scripts[document.scripts.length - 1];
			return currentScript.insertAdjacentElement('afterEnd', element);
		} else if (typeof parent?.appendChild === 'function') {
			return parent.appendChild(element);
		}
	}

	return element;
};

MMX.setElementAttributes = (element, attributes) => {

	if (!attributes){
		return element;
	}

	for (const attribute in attributes) {
		if (!Object.hasOwnProperty.call(attributes, attribute)) {
			continue;
		}

		const value = attributes[attribute];

		if (typeof value === 'undefined') {
			element.removeAttribute(attribute);
			continue;
		}

		if (attribute === 'name'){
			element.name = value;
		}  else if (attribute === 'class'){
			element.className = value;
		} else {
			element.setAttribute(attribute, value);
		}
	}

	return element;
};

MMX.setElementStyles = ({element, styles = {}, suffix = ''} = {}) => {
	if (!element) {
		return;
	}

	for (const prop in styles) {
		const value = typeof styles?.[prop] === 'undefined' ? '' : styles?.[prop] + suffix;
		element.style[prop] = value;
	}
};

MMX.closestElement = (selector, node) => {
	if (!node || node === document || node === window) {
		return null;
	}

	return (node.closest(selector) || MMX.closestElement(selector, node.getRootNode()?.host));
};

MMX.encodeEntities = (input) => {
	return String(input)
			.replace(/&reg;/g, '®')
			.replace(/&trade;/g, '™')
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/\(/g, '&#40;')
			.replace(/\)/g, '&#41;')
			.replace(/®/g, '&reg;')
			.replace(/™/g, '&trade;');
};

MMX.isEqual = (a, b) => {
	return JSON.stringify(a) === JSON.stringify(b);
};

MMX.setBooleanAttribute = (node, attribute_name, value, optional_enabled_values) => {
	if (Array.isArray(optional_enabled_values) &&
		 optional_enabled_values.indexOf(value) !== -1)	node.setAttribute(attribute_name, value);
	else if (MMX.isTruthy(value))						node.setAttribute(attribute_name, '');
	else												node.removeAttribute(attribute_name);
};

MMX.getBooleanAttribute = (node, attribute_name, optional_enabled_values) => {
	var value;

	if (!node.hasAttribute(attribute_name)) {
		return false;
	}
	else {
		value = node.getAttribute(attribute_name);

		if (Array.isArray(optional_enabled_values) &&
			 optional_enabled_values.indexOf(value) !== -1)	return true;
		else if (value === null || value === '')			return true;
		else												return MMX.isTruthy(value);
	}
};

MMX.elementInViewport = (element) => {
	var elementPosition = element.getBoundingClientRect();

	return (
		elementPosition.top >= 0 &&
		elementPosition.left >= 0 &&
		elementPosition.bottom <= window.innerHeight &&
		elementPosition.right <= window.innerWidth
	);
};

/**
 * Update an element's DOM to match a provided HTML string
 * @param {Node} element
 * @param {String} template
 */
MMX.renderTemplate = (element, template) => {
	element.innerHTML = template;
};

MMX.debounce = (func, timeout = 100) => {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => { func.apply(this, args); }, timeout);
	};
};

MMX.Runtime_JSON_API_Call = ({jsonUrl, storeCode, params = {}, callback} = {}) => {
	jsonUrl = jsonUrl ?? window?.json_url;
	storeCode = storeCode ?? window?.Store_Code;

	if (!jsonUrl?.length || !storeCode?.length) {
		console.warn('Runtime_JSON_API_Call haulted. Cannot call Miva JSON API. jsonUrl and/or storeCode is not provided');
		return;
	}

	const body = MMX.assign({
		Session_Type: 'runtime',
		Store_Code: storeCode
	}, params);

	return fetch(jsonUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	})
		.then(async (response) => {
			const text = await response.text();
			try{
				return JSON.parse(text);
			} catch(err) {
				throw new SyntaxError(`Did not receive valid JSON from API. Received: "${text}"`);
			}
		})
		.then((data) => {
			if (data?.success === 1) {
				return typeof callback === 'function' ? callback(data) : undefined;
			}

			if (data?.error_code && data?.error_message) {
				throw new Error(`Invalid JSON API Request Parameters, "${data.error_message}" (${data.error_code})`);
			}

			throw new Error('Unsuccessful JSON API Request');
		});
};

class MMX_Element extends HTMLElement {

	themeResourcePattern = /mmx|family=Inter/i;
	hideOnEmpty = false;

	static baseProps = {
		init: {
			isObject: true,
			isJson: true,
			options: [
				'script',
				'innerHTML'
			],
			default: null
		}
	};

	createElement = MMX.createElement;
	data = this.data || {};

	/**
	 * Web Component Lifecycle Hooks
	 */

	constructor() {
		super();
	}

	makeShadow() {
		this.attachShadow({
			mode: 'open'
		});
	}

	connectedCallback() {
		// Render Immediately
		this.renderTemplate();
		this.connected?.();

		// Re-Render onload to catch when component's inner DOM is not completely available at connectedCallback()
		this.ownerDocument.addEventListener('DOMContentLoaded', () => {
			this.renderOnFrame();
		});

		// Re-Render when the innerHTML / child-nodes are updated
		this.observer = new MutationObserver(() => {
			this.renderOnFrame();
		});

		this.observer.observe(this, {
			subtree: true,
			characterData: true,
			childList: true
		});
	}

	disconnectedCallback() {
		this.disconnected?.();
		this.observer?.disconnect();
	}

	// Re-Render when attributes are modified
	attributeChangedCallback() {
		this.attributeChanged?.(...arguments);
		this.debouncedRender();
	}

	static get observedAttributes() {
		if (typeof this.props === 'undefined') {
			return [];
		}

		return Object.keys(this.props).map(prop => 'data-' + prop);
	}

	/**
	 * Render Functions
	 */

	renderOnFrame() {
		if (this.requestId) {
			window.cancelAnimationFrame(this.requestId);
		}

		this.requestId = window.requestAnimationFrame(() => {
			this.renderTemplate();
		});
	}

	debouncedRender = MMX.debounce(() => {
		this.renderOnFrame();
	}, 50);

	renderTemplate() {
		this.initData();
		this.checkDataChange();
		this.beforeRender?.();

		const element = this.shadowRoot || this;
		const template =  this.getTemplate();
		MMX.renderTemplate(element, template);

		this.afterRender?.();
	}

	getTemplate() {
		if (this.hideOnEmpty && this.isEmpty()) {
			return '';
		}
		return this.renderStyles() + this.output('render');
	}

	isEmpty() {
		return this.textContent.trim().length === 0;
	}

	forceUpdate() {
		this.renderTemplate();
	}

	checkDataChange() {
		const currentDataString = JSON.stringify(this.data);
		const sameData = currentDataString === this.lastDataString;
		if (currentDataString !== '{}' && !sameData) {
			this.lastDataString = currentDataString;
			this.onDataChange?.();
		}
	}

	initData() {
		const init = this.loadPropertyData('init');

		if (MMX.variableType(init) !== 'object' || MMX.isEqual(this.data, init)) {
			return;
		}

		this.data = init;
	}

	/**
	 * Utility / Helper Functions
	 */

	output(name) {
		return typeof this[name] === 'function' ? this[name]() : '';
	}

	getPropValueWithoutDefault(name) {
		const prop = this.constructor.props[name] || MMX_Element.baseProps[name];
		const value = name in this.data ? this.data[name] : (this.getAttribute('data-' + name) || '').trim();

		if (typeof prop === 'undefined' || !value?.length) {
			return null;
		}

		if (prop?.options?.length && prop.options.includes(value)) {
			return value;
		}

		if (prop?.isBoolean) {
			return MMX.isTruthy(value);
		}

		if (prop?.isObject && typeof value === 'object') {
			return value;
		}

		if (prop?.isJson && typeof value === 'string') {
			return JSON.parse(value);
		}

		if (prop.allowAny) {
			if (prop.isNumeric && !isNaN(value)) {
				return Number(value);
			}

			if (prop.isPercentage && !isNaN(value)) {
				return value + '%';
			}

			return value;
		}

		return null;
	}

	hasPropValue(name) {
		const propValue = this.getPropValueWithoutDefault(name);
		const propValueType = MMX.variableType(propValue);
		return propValueType !== 'null' && propValueType !== 'undefined';
	}

	getPropValue(name) {
		return this.getPropValueWithoutDefault(name) ?? this.constructor.props[name]?.default;
	}

	inheritAttrs() {
		const attributeNames = this.getAttributeNames();

		if (!attributeNames.length) {
			return '';
		}

		return attributeNames.reduce((attributes, attributeName) => {
			const attributeValue = this.getAttribute(attributeName);

			if (attributeName === 'part' || attributeName.indexOf('data-') === 0) {
				return attributes;
			}

			if (attributeValue) {
				attributes.push(`${attributeName}="${MMX.encodeEntities(attributeValue)}"`);
			} else {
				attributes.push(attributeName);
			}

			return attributes;
		}, []).join(' ');
	}

	propExists() {
		return propKey in this.constructor.props || propKey in MMX_Element.baseProps;
	}

	loadPropertyData(propKey) {
		const data = this.getPropValue(propKey);

		if (!data) {
			return;
		}

		if (data === 'innerHTML' ){
			return this.parseData(this.innerHTML);
		}

		if (data === 'script'){
			let script = this.querySelector('script');
			return script ? this.parseData(script.innerHTML) : {};
		}

		return this.parseData(data);
	}

	parseData(data) {
		if (typeof data === 'object') {
			return data;
		}

		return JSON.parse(data);
	}

	/**
	 * Visibility Helpers
	 */
	getLoadingAttributeString() {
		const {loading, fetchpriority} = this.getLoadingAttributes();
		return `loading="${loading}" fetchpriority="${fetchpriority}"`;
	}

	getLoadingAttributes() {
		const isInViewport = MMX.elementInViewport(this);

		return {
			loading: this.getLoading(isInViewport),
			fetchpriority: this.getFetchPriority(isInViewport)
		};
	}

	getFetchPriority(isInViewport) {
		return (isInViewport || MMX.elementInViewport(this)) ? 'high' : 'low';
	}

	getLoading(isInViewport) {
		return (isInViewport || MMX.elementInViewport(this)) ? 'eager' : 'lazy';
	}

	/**
	 * Responsive Helper
	 */
	getResponsiveImageHeight(img) {
		const widthRatio = img.width / img.naturalWidth;
		return img.naturalHeight * widthRatio;
	}

	/**
	 * CSS Helper Functions
	 */

	setSpacing(settings = {}) {
		MMX.setElementStyles({
			element: this,
			styles: {
				marginTop: settings?.top?.value,
				marginBottom: settings?.bottom?.value,
				marginRight: settings?.right?.value,
				marginLeft: settings?.left?.value
			},
			suffix: 'px'
		});
	}

	/**
	 * Stylesheet Functions
	 */

	renderStyles() {
		return /*html*/`
			<style>
				${this.renderImportsToThemeStyles()}
				${this.output('styles')}
			</style>
		`;
	}

	renderImportsToThemeStyles() {
		const mmxStyleSheets = [...document.styleSheets].filter(sheet => {
			return this.shouldIncludeSheet(sheet);
		});
		return mmxStyleSheets.map(this.renderStylesheetImport).join('\n');
	}

	shouldIncludeSheet(sheet) {
		return sheet.href && (this.themeResourcePattern).test(sheet.href);
	}

	renderStylesheetImport(sheet) {
		return /*css*/`@import "${sheet.href}";`;
	}
}

window.MMX = MMX;
window.MMX_Element;
