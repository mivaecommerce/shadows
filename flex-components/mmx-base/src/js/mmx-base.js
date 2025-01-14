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
		try {
			return JSON.parse(JSON.stringify(value));
		} catch(err) {
			return null;
		}
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

MMX.normalizeCode = (value) => {
	const valueType = MMX.variableType(value);

	if (['string', 'number', 'boolean'].includes(valueType)) {
		return String(value).trim();
	}

	return '';
};

MMX.valueIsEmpty = (value) => {
	if (value === null)											return true;
	else if (typeof value === 'object')							return Object.keys(value).length === 0 && value.constructor === Object;
	else if (typeof value === 'undefined')						return true;
	else if (typeof value === 'string' && value.length == 0)	return true;

	// type is boolean, number, function, non-zero length string, etc
	return false;
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

	return (node.closest?.(selector) || MMX.closestElement(selector, node?.getRootNode?.()?.host));
};

MMX.querySelector = (selector, root = document) => {
	if (selector === ':shadow') {
		return root?.shadowRoot;
	}

	if (typeof root.querySelector === 'function') {
		return root.querySelector(selector);
	}

	return null;
};

MMX.querySelectorList = (selectors = [], root = document) => {
	let lastElement = root;

	if (!Array.isArray(selectors) || selectors.length === 0) {
		return null;
	}

	for (const selector of selectors) {
		const element = MMX.querySelector(selector, lastElement);

		if (!element) {
			lastElement = null;
			break;
		}

		lastElement = element;
	}

	return lastElement;
};

MMX.encodeEntities = (input) => {
	return String(input ?? '')
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

MMX.encodeSrcset = (input) => {
	return String(input).replace(/ /g, '%20');
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

class MMX_FetchQueue {
	#id = 0;
	#max = 3;
	#todo = new Map();
	#doing = new Map();

	constructor({max} = {}) {
		this.#max = MMX.coerceNumber(max, this.#max);
		this.#doNext();
	}

	request(...params) {
		return new Promise((resolve, reject) => {
			this.#todo.set(this.#id++, {
				params,
				resolve,
				reject
			});

			this.#doNext();
		});
	}

	#doNext() {
		if (this.#todo.size === 0 || this.#doing.size >= this.#max) {
			return;
		}

		const [nextId, next] = this.#todo.entries().next().value;
		this.#doing.set(nextId, next);
		this.#todo.delete(nextId);

		fetch(...next.params)
			.then(next.resolve)
			.catch(next.reject)
			.finally(() => {
				this.#doing.delete(nextId);
				this.#doNext();
			});
	}
}

MMX.fetchQueue = new MMX_FetchQueue();

MMX.Runtime_JSON_API_Call = ({jsonUrl, storeCode, params = {}} = {}) => {
	jsonUrl = jsonUrl ?? window?.json_url;
	storeCode = storeCode ?? window?.Store_Code;

	if (!jsonUrl?.length || MMX.valueIsEmpty(storeCode)) {
		return Promise.reject({
			success: false,
			error_code: 'MMX-Runtime_JSON_API_Call-00001',
			error_message: 'Runtime_JSON_API_Call halted. Cannot call Miva JSON API. jsonUrl and/or storeCode is not provided'
		});
	}

	return MMX.fetchQueue.request(jsonUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(MMX.assign({Session_Type: 'runtime', Store_Code: storeCode}, params))
	}).then(async (response) => {
		const text = await response.text();
		try {
			return JSON.parse(text);
		} catch(err) {
			return Promise.reject({
				success: false,
				error_code: 'MMX-Runtime_JSON_API_Call-00002',
				error_message: `Did not receive valid JSON from API. Received: "${text}"`
			});
		}
	}).then(data => {
		if (data?.success) {
			return Promise.resolve(data);
		}

		return Promise.reject(data);
	});
};

MMX.fetchForm = (form, fetchOptions = {}) => {
	if (!(form instanceof HTMLFormElement) || MMX.variableType(fetchOptions) !== 'object') {
		return Promise.reject(new TypeError());
	}

	return MMX.fetchQueue.request(form.action, {
		method: 'POST',
		body: new FormData(form),
		...fetchOptions
	});
};

MMX.longMerchantUrl = (searchParams = {}, {merchantUrl, storeCode = window.Store_Code} = {}) => {
	let url;

	if (typeof merchantUrl !== 'string') {
		if (typeof window.json_url === 'string') {
			merchantUrl = window.json_url.replace('json.mvc', 'merchant.mvc');
		} else {
			return;
		}
	}

	try {
		url = new URL(merchantUrl);
	}
	catch (error) {
		throw new TypeError(`${error.message} when parsing 'merchantUrl'`);
	}

	if (MMX.variableType(searchParams) !== 'object') {
		throw new TypeError("'searchParams' must be an 'Object'");
	}

	if (['string', 'number'].includes(typeof storeCode) && !('Store_Code' in searchParams)) {
		searchParams = {
			Store_Code: storeCode,
			...searchParams
		};
	}

	Object.entries(searchParams).forEach(([key, value]) => {
		url.searchParams.append(key, value);
	});

	return url.toString();
};

MMX.pluralize = (singular, count, plural) => {
	return count === 1 ? `${singular}` : plural ?? `${singular}s`;
};

class MMX_Element extends HTMLElement {

	themeResourcePattern;
	styleResourceCodes = ['mmx-base'];
	hideOnEmpty = false;
	renderUniquely = false;

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
		this.observer = new MutationObserver((records) => {
			const validRecords = records.filter(record => {
				return ![...record.addedNodes, ...record.removedNodes].find(node => {
					return node?.closest?.('.mmx-skip-mutation') || node?.parentElement?.closest?.('.mmx-skip-mutation');
				});
			});

			if (!validRecords.length) {
				return;
			}

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
		return this.propsToAttributeNames;
	}

	static get propsToAttributeNames() {
		if (typeof this.props !== 'object') {
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

		const element = this.shadowRoot || this;
		const template =  this.getTemplate();
		const renderRequired = template !== this?.lastTemplate;

		if (this.renderUniquely && !renderRequired) {
			return;
		}

		this.beforeRender?.();
		MMX.renderTemplate(element, template);
		this.lastTemplate = template;
		this.afterRender?.();
		this.debouncedDispatchContentUpdated();
	}

	debouncedDispatchContentUpdated = MMX.debounce(() => {
		this.dispatchContentUpdated();
	}, 100);

	dispatchContentUpdated() {
		this.dispatchEvent(new CustomEvent('contentUpdated'));
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
		if (!this.lastTemplate) {
			return;
		}

		this.lastTemplate = null;
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
			try {
				return JSON.parse(value);
			} catch(err) {
				return null;
			}
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

		try {
			return JSON.parse(data);
		} catch(err) {
			return null;
		}
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
	 * Rendering Helpers
	 */
	renderTextProperty(property = {}, {className = '', prefix = '', field = 'normal', defaultStyle = 'paragraph-s', defaultTag = 'div'}) {
		if (MMX.valueIsEmpty(property?.value)) {
			return '';
		}

		const text = MMX.createElement({
			type: 'mmx-text',
			attributes: {
				class: className,
				'data-source': property.source,
				'data-style': property?.textsettings?.fields?.[field]?.[`${prefix}style`]?.value || defaultStyle,
				'data-tag': property?.textsettings?.fields?.[field]?.[`${prefix}tag`]?.value || defaultTag,
				style: property?.textsettings?.styles?.[field] || ''
			},
			content: property.source === 'markdown' ? property.value : MMX.encodeEntities(property.value)
		});

		return text.outerHTML;
	}

	renderButtonProperty(property = {}, {className = '', field = 'normal', prefix = 'button_', defaultStyle = 'primary', defaultSize = 's'}) {
		if (MMX.valueIsEmpty(property?.value)) {
			return '';
		}

		const button = MMX.createElement({
			type: 'mmx-button',
			attributes: {
				class: className,
				'data-style': property?.textsettings?.fields?.[field]?.[`${prefix}style`]?.value || defaultStyle,
				'data-size': property?.textsettings?.fields?.[field]?.[`${prefix}size`]?.value || defaultSize
			},
			content: MMX.encodeEntities(property.value)
		});

		return button.outerHTML;
	}

	getStylesFromGroup(group = {}) {
		return Object.keys(group).reduce((styles, key) => {
			let value = group[key]?.value;

			if (MMX.valueIsEmpty(value) || key === 'style') {
				return styles;
			}

			if (key === 'font_size') {
				value += 'px';
			}

			if (key === 'font_color') {
				key = 'color';
			}

			if (styles.length) {
				styles += '; ';
			}

			return styles += `${key.replace('_', '-')}: ${value}`;
		}, '');
	}

	/**
	 * Fragment Helpers
	 */
	renderContentIntoLightDomSlot({slotName, content} = {}) {
		if (typeof slotName !== 'string' || typeof content !== 'string') {
			return '';
		}

		const existingLightElement = this.querySelector(`[slot="${MMX.encodeEntities(slotName)}"]`);
		existingLightElement?.remove();

		const contentFragment = document.createRange().createContextualFragment(content);
		const lightElement = MMX.createElement({
			type: 'div',
			attributes: {
				slot: slotName,
				class: 'mmx-skip-mutation',
			}
		});
		lightElement.appendChild(contentFragment);
		this.appendChild(lightElement);

		return /*html*/`
			<slot name="${MMX.encodeEntities(slotName)}"></slot>
		`;
	}

	renderProductFragment({product, fragmentCode, slotName} = {}) {
		const fragmentContent = product?.fragments?.[fragmentCode]?.trim?.();
		slotName = slotName ?? `fragment__${fragmentCode}--${product?.code}`;

		if (MMX.valueIsEmpty(fragmentContent)) {
			return '';
		}

		return this.renderContentIntoLightDomSlot({
			slotName,
			content: fragmentContent
		});
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
			${this.renderStylesheetLinks()}
			<style>
				${this.output('styles')}
			</style>
		`;
	}

	renderStylesheetLinks() {
		const availableSheets = [...document.querySelectorAll('link[rel="stylesheet"][href]')];
		[...document.querySelectorAll('template.mmx-resources')].forEach(template => {
			const templateLinks = template.content.querySelectorAll('link[rel="stylesheet"][href]');
			if (templateLinks.length) {
				availableSheets.push(...templateLinks);
			}
		});

		const mmxStyleSheets = availableSheets.filter(sheet => {
			return this.shouldIncludeSheet(sheet);
		});
		return mmxStyleSheets.map(this.renderStylesheetLink).join('\n');
	}

	shouldIncludeSheet(sheet) {
		return ((MMX.variableType(this.themeResourcePattern) === 'regexp' && sheet.href && (this.themeResourcePattern).test(sheet.href)) || (sheet.hasAttribute('data-resource-code') && this.styleResourceCodes.indexOf(sheet.getAttribute('data-resource-code')) !== -1));
	}

	renderStylesheetLink(sheet) {
		return sheet.outerHTML;
	}

	/**
	 * Reveal Element Functions
	 */
	bindRevealElement() {
		this.addEventListener('revealElement', (e) => {
			this.onRevealElement(e);
		});
	}

	onRevealElement(e) {
		this.revealElementFromSelectorList(e.detail?.preview_property_selector);
	}

	revealElementFromSelectorList(selectors) {
		const element = MMX.querySelectorList(selectors, this);

		if (!element) {
			return;
		}

		this.revealElement?.(element);
	}
}

window.MMX = MMX;
window.MMX_FetchQueue = MMX_FetchQueue;
window.MMX_Element = MMX_Element;
