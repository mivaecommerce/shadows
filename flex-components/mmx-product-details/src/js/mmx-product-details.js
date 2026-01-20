/**
 * MMX / PRODUCT DETAILS
 */

class MMX_ProductDetails extends MMX_Element {

	static get props() {
		return {
			'product-code': {
				allowAny: true
			},
			'global-minibasket-url': {
				allowAny: true,
				default:  MMX.longMerchantUrl({Screen: 'BASK'})
			},
			'atwl-url': {
				allowAny: true,
				default:  MMX.longMerchantUrl({Screen: 'WISH'})
			},
			'store-name': {
				allowAny: true
			}
		};
	}

	styleResourceCodes = ['mmx-accordion', 'mmx-base', 'mmx-text', 'mmx-forms', 'mmx-product-details', 'mmx-tabs'];
	renderUniquely = true;

	// Product
	#product = {};
	#variantId = 0;
	#images = [];
	#volumePricing = [];
	#errorMessage;

	// Details
	#details = [];
	#flatDetails = [];

	constructor() {
		super();
		this.makeShadow();
		this.bindRevealElement();
	}

	// MMX_Element Render Life Cycle
	render() {
		if (!this.#shouldRender()) {
			return '';
		}

		return /*html*/`
			<div
				part="wrapper"
				class="mmx-product-details"
			>
				${this.#renderMain()}
			</div>
		`;
	}

	#shouldRender() {
		return !MMX.valueIsEmpty(this.#product?.code);
	}

	// Data Methods
	onDataChange() {
		MMX.setElementAttributes(this, {
			'data-product-code': this.data?.product?.specific?.product_code
		});

		this.#setDetails();
		this.#loadProduct();
	}

	// Render Events
	beforeRender() {
		this.#renderedAttributes = false;
		this.#renderedQuantity = false;
	}

	afterRender() {
		this.#bindEvents();
		this.#debouncedAfterRender();
	}

	#debouncedAfterRender = MMX.debounce(() => {
		this.#notifyProductRendered();
	}, 100);

	#bindEvents() {
		this.#listenForAddToCart();
		this.#listenForAddToWishlist();
		this.#listenForAttributeMachine();
		this.#listenForQuantityInput();
		this.#initializeReadMore();
	}

	// Notifications
	#notifyProductRendered() {
		if (!this.#shouldRender()) {
			return;
		}

		this.#throwPriceChanged();
	}

	#throwPriceChanged() {
		window?.MivaEvents?.ThrowEvent?.('price_changed', {
			product_code: this.#product.code,
			price: this.#product.price,
			additional_price: this.#product.base_price
		});
	}

	#notifyProductLoaded() {
		if (!this.#shouldRender()) {
			return;
		}

		this.#debouncedDispatchGtmViewItemOnce();
	}

	// Product List Load Query Methods
	#loadProduct() {
		this.#setProduct();

		const productCode = this.getPropValue('product-code');

		if (MMX.valueIsEmpty(productCode)) {
			return;
		}

		this.#loadVolumePricingTable();

		MMX.Runtime_JSON_API_Call({
			params: this.#getListLoadQueryParams()
		})
		.then(response => {
			this.#productLoaded(response);
		})
		.catch(response => {
			this.#productFailedToLoad(response);
		});
	}

	#productLoaded(response) {
		this.#setProduct(response.data?.data?.at?.(0));
		this.#updateJsonLd();
		this.#updateFormInputs();
		this.forceUpdate();
		this.#notifyProductLoaded();
	}

	#productFailedToLoad(response = {}) {
		this.#errorMessage = MMX.coerceString(response?.error_message, {fallback: 'There was a problem loading the product'});
		this.forceUpdate();
	}

	#getListLoadQueryParams() {
		return {
			function: 'Runtime_ProductList_Load_Query',
			filter: this.#getListLoadQueryFilters(),
			count: 1
		};
	}

	#getListLoadQueryFilters() {
		return [
			...this.#getSearchFilters(),
			...this.#getVariantIdFilters(),
			...this.#getDetailsFilters()
		];
	}

	#getSearchFilters() {
		return [
			{
				name: 'search',
				value: [
					{
						field: 'code',
						operator: 'EQ',
						value: this.getPropValue('product-code')
					}
				]
			}
		];
	}

	#getVariantIdFilters() {
		const variantId = this.#getRequestParam('Variant_ID');

		if (MMX.valueIsEmpty(variantId)) {
			return [];
		}

		const filter = {
			name: 'variant_ids',
			value: {}
		};

		filter.value[this.getPropValue('product-code')] = variantId;

		return [filter];
	}

	#getDetailsFilters() {
		const filters = [];
		const map = this.#getDetailsFiltersMap();

		for (const key in map) {
			const values = map[key];

			if (values.size === 0) {
				continue;
			}
			else if (key === 'images') {
				filters.push({
					name: key,
					value: {
						sizes: [...values]
					}
				});
			}
			else {
				filters.push({
					name: key,
					value: [...values]
				});
			}
		}

		return filters;
	}

	// Product Data
	#setProduct(product = {}) {
		this.#product = product;
		this.#variantId = 0;
		this.#images = [];
		this.#errorMessage = undefined;

		this.#setProductAttributeValues();
		this.#setSubscriptionTerm();
	}

	get product() {
		return this.#product;
	}

	get variantId() {
		return this.#variantId;
	}

	get images() {
		return this.#images;
	}
	get volumePricing() {
		return this.#volumePricing;
	}

	#setProductAttributeValues() {
		if (this.#getRequestParam('Variant_ID') > 0) {
			return;
		}

		this.#product.attributes = this.#setAttributeValues({attributes: this.#product?.attributes});
	}

	#setAttributeValues({attributes, index = 0} = {}) {
		if (MMX.arrayIsEmpty(attributes)) {
			return attributes;
		}

		return attributes.map((attribute) => {
			attribute = this.#setAttributeValue({attribute, index});

			index += attribute.type === 'template' ? attribute.attributes.length : 1;

			return attribute;
		});
	}

	#setAttributeValue({attribute, index = 0} = {}) {
		if (attribute.type === 'template') {
			attribute.attributes = this.#setAttributeValues({index, attributes: attribute.attributes});
			return attribute;
		}

		switch (MMX.variableType(this.data?.server?.Product_Attributes)) {
			case 'object':
				attribute.value = this.data.server.Product_Attributes[attribute?.code];
				break;
			case 'array':
				attribute.value = this.data.server.Product_Attributes[index]?.value;
				break;
			case 'undefined':
			default:
				attribute.value = this.#getRequestParam(`Product_Attributes:${attribute?.code}`) ?? this.#getRequestParam(`Product_Attributes[${index + 1}]:value`) ?? undefined;
				break;
		}

		return attribute;
	}

	#setSubscriptionTerm() {
		if (MMX.arrayIsEmpty(this.#product?.subscriptionterms)) {
			return;
		}

		const requestedTermId = MMX.coerceNumber(this.#getRequestParam('Product_Subscription_Term_ID'));

		this.#product.subscriptionterms = this.#product.subscriptionterms.map(term => {
			term.selected = term.id === requestedTermId;
			return term;
		});
	}

	#productIsOutOfStock() {
		return this.#product.inv_active && this.#product.inv_level === 'out';
	}

	#getFlatProductAttributes() {
		if (MMX.arrayIsEmpty(this.#product?.attributes)) {
			return [];
		}

		return this.#product?.attributes?.reduce?.((attributes, attribute) => {
			if (attribute.type === 'template') {
				attributes.push(...attribute.attributes);
			} else {
				attributes.push(attribute);
			}

			return attributes;
		}, []);
	}

	// Details
	#setDetails() {
		this.#flatDetails = this.#flattenProductDetails(this.data.details.children);
		this.#details = this.data.details;
	}

	#getDetailsByType(type = '') {
		return this.#flatDetails.filter(detail => detail?.type?.value === type);
	}

	#getDetailsFiltersMap() {
		const filtersMap = {
			fragments: new Set(),
			images: new Set(),
			ondemandcolumns: new Set(['descrip', 'category'])
		};

		this.#flatDetails.forEach(detail => {
			const type = detail?.type?.value;

			if (typeof type !== 'string'){
				return;
			}

			if (type === 'attributes') {
				filtersMap.ondemandcolumns.add('attributes').add('subscriptionsettings').add('subscriptionterms');
			}
			else if (type === 'customfield' && !MMX.valueIsEmpty(detail?.customfield?.value)) {
				filtersMap.ondemandcolumns.add(`CustomField_Values:${detail.customfield.value}`);
			}
			else if (type === 'discounts') {
				filtersMap.ondemandcolumns.add('discounts');
			}
			else if (type === 'fitment' && !MMX.valueIsEmpty(detail?.fitment_settings?.facet_code?.value)) {
				filtersMap.ondemandcolumns.add(`CustomField_Values:combofacets:${detail.fitment_settings.facet_code.value}_fit`);
			}
			else if (type === 'fitment-list' && !MMX.valueIsEmpty(detail?.fitment_list_settings?.facet_code?.value)) {
				filtersMap.ondemandcolumns.add(`CustomField_Values:combofacets:${detail.fitment_list_settings.facet_code.value}_fitment_list`);
			}
			else if (type === 'fragment' && !MMX.valueIsEmpty(detail?.fragment?.value)) {
				filtersMap.fragments.add(detail.fragment.value);
			}
			else if (type === 'images') {
				const main = detail?.image_settings?.main?.dimensions?.value;
				const closeup = detail?.image_settings?.closeup?.dimensions?.value;
				const thumbnail = detail?.image_settings?.thumbnail?.dimensions?.value;

				filtersMap.images.add('original');

				if (main) {
					filtersMap.images.add(main);
				}
				if (closeup) {
					filtersMap.images.add(closeup);
				}
				if (thumbnail) {
					filtersMap.images.add(thumbnail);
				}
			}
			else if (['inv_short', 'inv_long', 'inv_available'].includes(type)) {
				filtersMap.ondemandcolumns.add('inventory');
			}
			else if (type === 'price') {
				filtersMap.ondemandcolumns.add('sale_price');
			}
			else if (type === 'product-charges') {
				filtersMap.ondemandcolumns.add('discounts');
			}
		});

		return filtersMap;
	}

	#flattenProductDetails(details = [], {detailSelector = 'detail', nthChild = 1} = {}) {
		return details.reduce((reducedDetails, detail) => {
			detail._nthChild = nthChild++;
			detail._detailSelector = `${detailSelector}__child-${detail._nthChild}`;

			if (Array.isArray(detail.details?.children)) {
				reducedDetails.push(...this.#flattenProductDetails(detail.details.children, {
					detailSelector: detail._detailSelector
				}));
			} else {
				reducedDetails.push(detail);
			}

			return reducedDetails;
		}, []);
	}

	// Main
	#renderMain() {
		if (this.#errorMessage) {
			return this.#renderMainError();
		}
		else {
			return this.#renderMainValid();
		}
	}

	#renderMainError() {
		return /*html*/`
			<div part="error" class="mmx-product-display__error">
				<mmx-message data-style="warning">We're unable to display the product: ${MMX.encodeEntities(this.#errorMessage ?? 'There was a problem loading the product')}</mmx-message>
			</div>
		`;
	}

	#renderMainValid() {
		return /*html*/`
			<div part="main" class="mmx-product-display__main">
				<div
					part="details"
					style="${MMX.encodeEntities(MMX.objectToInlineStyles(this.#getGapStylesObject(this.data)))}"
				>
					${this.#renderDetails(this.#details.children)}
				</div>
			</div>
		`;
	}

	// Will Render Detail
	#willRenderDetail(detail = {}) {
		switch (detail?.type?.value) {
			case 'accordion-group':
				return this.#willRenderAccordionGroup(detail);
			case 'attributes':
				return this.#willRenderAttributes(detail);
			case 'add-to-cart-button':
			case 'add-to-wishlist-button':
				return this.#willRenderButton(detail);
			case 'custom-text':
				return this.#willRenderCustomText(detail);
			case 'customfield':
				return this.#willRenderCustomField(detail);
			case 'discounts':
				return this.#willRenderDiscounts(detail);
			case 'fitment':
				return this.#willRenderFitment(detail);
			case 'fitment-list':
				return this.#willRenderFitmentList(detail);
			case 'fragment':
				return this.#willRenderFragmentDetail(detail);
			case 'images':
				return this.#willRenderImages(detail);
			case 'inline-group':
				return this.#willRenderInlineGroup(detail);
			case 'inv_available':
				return this.#willRenderInventoryAvailable(detail);
			case 'inv_short':
			case 'inv_long':
				return this.#willRenderInventoryMessage(detail);
			case 'price':
				return this.#willRenderPrice(detail);
			case 'product-charges':
				return this.#willRenderProductCharges(detail);
			case 'quantity-in-basket':
				return this.#willRenderQuantityInBasket(detail);
			case 'quantity-input':
				return this.#willRenderQuantityInput(detail);
			case 'side-by-side-group':
				return this.#willRenderSideBySideGroup(detail);
			case 'tab-group':
				return this.#willRenderTabGroup(detail);
			case 'vertical-group':
				return this.#willRenderVerticalGroup(detail);
			case 'volume-pricing-table':
				return this.#willRenderVolumePricingTable(detail);
			case 'weight':
				return this.#willRenderWeight(detail);
			default:
				return this.#willRenderCoreDetail(detail);
		}
	}

	#willRenderSideBySideGroup(detail = {}) {
		return this.#willRenderGroupLowLevel(detail);
	}

	#willRenderInlineGroup(detail = {}) {
		return this.#willRenderGroupLowLevel(detail);
	}

	#willRenderVerticalGroup(detail = {}) {
		return this.#willRenderGroupLowLevel(detail);
	}

	#willRenderAccordionGroup(detail = {}) {
		return this.#willRenderGroupLowLevel(detail);
	}

	#willRenderTabGroup(detail = {}) {
		return this.#willRenderGroupLowLevel(detail);
	}

	#willRenderGroupLowLevel(detail = {}) {
		if (!MMX.arrayIsEmpty(detail.details?.children)) {
			for (const child of detail.details.children) {
				if (this.#willRenderDetail(child)) {
					return true;
				}
			}
		}

		return false;
	}

	#willRenderCoreDetail(detail = {}) {
		return !MMX.valueIsEmpty(this.#product?.[detail?.type?.value]);
	}

	#willRenderAttributes(detail = {}) {
		if (this.#renderedAttributes) {
			// Attributes can only be rendered once
			return false;
		}

		return !MMX.arrayIsEmpty(this.#product?.attributes) || !MMX.arrayIsEmpty(this.#product?.subscriptionterms);
	}

	#willRenderButton(detail = {}) {
		return true;
	}

	#willRenderFitment(detail = {}) {
		// Content may be dynamically updated with variant data
		return true;
	}

	#willRenderFitmentList(detail = {}) {
		// Content may be dynamically updated with variant data
		return true;
	}

	#willRenderCustomText(detail = {}) {
		return !MMX.valueIsEmpty(detail?.custom_text?.value);
	}

	#willRenderCustomField(detail = {}) {
		const customFieldParts = detail?.customfield?.value?.split?.(':');
		const [moduleCode, fieldCode] = customFieldParts;

		if (customFieldParts?.length !== 2 || MMX.valueIsEmpty(this.#product?.CustomField_Values?.[moduleCode]?.[fieldCode])) {
			return false;
		}

		return true;
	}

	#willRenderDiscounts(detail) {
		// Content may be dynamically updated with variant data
		return true;
	}

	#willRenderFragmentDetail(detail = {}) {
		const fragmentCode = detail?.fragment?.value;
		const fragmentContent = this.#product?.fragments?.[fragmentCode]?.trim?.();

		return !MMX.valueIsEmpty(fragmentContent);
	}

	#willRenderImages(detail = {}) {
		return !MMX.arrayIsEmpty(this.#product.images);
	}

	#willRenderInventoryAvailable(detail = {}) {
		// Content may be dynamically updated with variant data
		return true;
	}

	#willRenderInventoryMessage(detail = {}) {
		// Content may be dynamically updated with variant data
		return true;
	}

	#willRenderPrice(detail = {}) {
		// Content may be dynamically updated with variant data
		return true;
	}

	#willRenderProductCharges(detail = {}) {
		// Content may be dynamically updated with variant data
		return true;
	}

	#willRenderQuantityInBasket(detail = {}) {
		return !MMX.valueIsEmpty(this.#product?.quantity);
	}

	#willRenderQuantityInput(detail = {}) {
		// Quantity input can only be rendered once
		return !this.#renderedQuantity;
	}

	#willRenderWeight(detail = {}) {
		return !MMX.valueIsEmpty(this.#product?.formatted_weight);
	}

	#willRenderVolumePricingTable(detail = {}) {
		// Content may be dynamically updated with variant data
		return true;
	}

	// Details
	#renderDetails(details = []) {
		if (MMX.arrayIsEmpty(details)) {
			return '';
		}

		return details.reduce((content, detail) => {
			return content += this.#renderDetail(detail);
		}, '');
	}

	#renderDetail(detail = {}) {
		let content = '';
		let type = detail?.type?.value;

		switch (type) {
			case 'accordion-group':
				content = this.#renderAccordionGroup(detail);
				break;
			case 'attributes':
				content = this.#renderAttributes(detail);
				break;
			case 'add-to-cart-button':
			case 'add-to-wishlist-button':
				content = this.#renderButton(detail);
				break;
			case 'custom-text':
				content = this.#renderCustomText(detail);
				break;
			case 'customfield':
				content = this.#renderCustomField(detail);
				break;
			case 'discounts':
				content = this.#renderDiscounts(detail);
				break;
			case 'fitment':
				content = this.#renderFitment(detail);
				break;
			case 'fitment-list':
				content = this.#renderFitmentList(detail);
				break;
			case 'fragment':
				content = this.#renderFragmentDetail(detail);
				break;
			case 'images':
				content = this.#renderImages(detail);
				break;
			case 'inline-group':
				content = this.#renderInlineGroup(detail);
				break;
			case 'inv_available':
				content = this.#renderInventoryAvailable(detail);
				break;
			case 'inv_short':
			case 'inv_long':
				content = this.#renderInventoryMessage(detail);
				break;
			case 'price':
				content = this.#renderPrice(detail);
				break;
			case 'product-charges':
				content = this.#renderProductCharges(detail);
				break;
			case 'quantity-in-basket':
				content = this.#renderQuantityInBasket(detail);
				break;
			case 'quantity-input':
				content = this.#renderQuantityInput(detail);
				break;
			case 'side-by-side-group':
				content = this.#renderSideBySideGroup(detail);
				break;
			case 'tab-group':
				content = this.#renderTabGroup(detail);
				break;
			case 'vertical-group':
				content = this.#renderVerticalGroup(detail);
				break;
			case 'volume-pricing-table':
				content = this.#renderVolumePricingTable(detail);
				break;
			case 'weight':
				content = this.#renderWeight(detail);
				break;
			default:
				content = this.#renderCoreDetail(detail);
				break;
		}

		if (MMX.valueIsEmpty(content)) {
			type += ' empty';
		}

		return /*html*/`
			<div
				id="${MMX.encodeEntities(detail._detailSelector)}"
				part="detail ${MMX.encodeEntities(type)}"
				style="${MMX.encodeEntities(this.#getDetailStyles(detail))}"
			>
				${content}
			</div>
		`;
	}

	#getDetailStyles(detail = {}) {
		return MMX.objectToInlineStyles(this.#getDetailStyleObject(detail));
	}

	#getDetailStyleObject(detail = {}) {
		const borderWidth = MMX.objectToCssShorthand(detail.container_styles?.border_width, {key: 'border_%side%_width'});

		return {
			flexBasis: MMX.coerceString(detail?.flex_basis?.value, {suffix: '%'}),
			margin: MMX.objectToCssShorthand(detail.container_styles?.margin),
			padding: MMX.objectToCssShorthand(detail.container_styles?.padding),
			backgroundColor: MMX.coerceString(detail.container_styles?.background_color?.value),
			borderRadius: MMX.objectToCssShorthand(detail.container_styles?.border_radius, {key: 'border_%corner%_radius'}),
			borderColor: MMX.coerceString(detail.container_styles?.border_color?.value),
			boxShadow: MMX.boxShadowObjectToCssValue(detail.container_styles?.box_shadow),
			borderStyle: borderWidth ? 'solid' : undefined,
			borderWidth
		};
	}

	#updateDetailsOfType(type = '') {
		this.#getDetailsByType(type).forEach(detail => {
			const element = this.shadowRoot.querySelector(`#${detail._detailSelector}`);
			this.#replaceElementWithContent(element, this.#renderDetail(detail));
		});

		this.debouncedDispatchContentUpdated();
	}

	#replaceElementWithContent(element = {}, content = '') {
		const newElement = document.createElement('div');
		newElement.innerHTML = content;

		element?.replaceWith?.(...newElement.childNodes);
	}

	// Render: Attributes
	#renderedAttributes = false;
	#renderAttributes(detail = {}) {
		if (MMX.arrayIsEmpty(this.#product?.attributes) && MMX.arrayIsEmpty(this.#product?.subscriptionterms)) {
			return '';
		}

		if (this.#renderedAttributes) {
			return '';
		}

		this.#renderedAttributes = true;
		return /*html*/`
			<mmx-product-machine
				part="attributes-product-machine"
				exportparts="product-content: attributes-product-machine-content, product-attributes: attributes-product-machine-attributes, product-attribute: attributes-product-machine-attribute"
				data-init="script"
				data-show-product-images="false"
			>
				<script type="application/json">
					${MMX.scriptSafeJSONStringify(this.#getProductMachineConfig())}
				</script>
			</mmx-product-machine>
		`;
	}

	#attributesProductMachine() {
		return this.shadowRoot.querySelector('[part~="attributes"] mmx-product-machine');
	}

	#getProductMachineConfig() {
		const attributesDetail = this.#flatDetails.find(detail => detail?.type?.value === 'attributes');

		return {
			advanced: {
				product: {
					button: {
						settings: { enabled: false }
					},
					code: { value: false },
					sku: { value: false },
					discount: { value: true },
					multiple_images: { value: false }
				},
				attribute_settings: attributesDetail?.attribute_settings,
				attribute_messages: {
					invalid_msg: {
						source: attributesDetail?.attribute_messages?.invalid_msg?.source,
						value: attributesDetail?.attribute_messages?.invalid_msg?.value
					},
					missing_text_msg: {
						source: attributesDetail?.attribute_messages?.missing_text_msg?.source,
						value: attributesDetail?.attribute_messages?.missing_text_msg?.value
					},
					missing_radio_msg: {
						source: attributesDetail?.attribute_messages?.missing_radio_msg?.source,
						value: attributesDetail?.attribute_messages?.missing_radio_msg?.value
					}
				}
			},
			product: {
				product: {
					_isPreloaded: true,
					product: this.#product,
					product_code: this.#product.code
				}
			}
		};
	}

	#getGapStylesObject(detail = {}) {
		return {
			gap: MMX.coerceString(detail?.gap?.value, {suffix: 'px'})
		};
	}

	// Render: Side By Side Group
	#renderSideBySideGroup(detail = {}) {
		return /*html*/`
			${MMX.renderBreakpointStyle({
				selector: `#${detail._detailSelector} > div`,
				breakpoint: detail?.vertical_breakpoint,
				match: {
					flexDirection: 'column'
				}
			})}
			<div
				part="detail-content detail-content__${MMX.encodeEntities(detail.type.value)}"
				style="${MMX.encodeEntities(MMX.objectToInlineStyles(this.#getGapStylesObject(detail)))}"
			>
				${this.#renderDetails(detail.details?.children)}
			</div>
		`;
	}

	// Render: Inline Group
	#renderInlineGroup(detail = {}) {
		return /*html*/`
			<div
				part="detail-content detail-content__${MMX.encodeEntities(detail.type.value)}"
				style="${MMX.encodeEntities(MMX.objectToInlineStyles(this.#getGapStylesObject(detail)))}"
			>
				${this.#renderDetails(detail.details?.children)}
			</div>
		`;
	}

	// Render: Vertical Group
	#renderVerticalGroup(detail = {}) {
		const styles = this.#getGapStylesObject(detail);
		let readMore = '';
		let maxHeightClass = '';

		if (detail?.max_height_settings?.settings?.enabled) {
			maxHeightClass = 'has-read-more';

			styles.maxHeight = `${MMX.coerceNumber(detail?.max_height_settings?.amount?.value, 10)}vh`;

			detail.max_height_settings.read_more.value = MMX.valueIsEmpty(detail.max_height_settings.read_more.value) ? 'Read More' : detail.max_height_settings.read_more.value;
			readMore = this.renderButtonProperty(detail.max_height_settings.read_more, {
				defaultStyle: 'display-link',
				className: 'read-more-button'
			});
		}

		return /*html*/`
			<div
				part="detail-content detail-content__${MMX.encodeEntities(detail.type.value)}"
				style="${MMX.encodeEntities(MMX.objectToInlineStyles(styles))}"
				class="${MMX.encodeEntities(maxHeightClass)}"
			>
				${this.#renderDetails(detail.details?.children)}
			</div>
			${readMore}
		`;
	}

	#initializeReadMore() {
		this.#readMoreButtons().forEach(button => {
			const container = button.previousElementSibling;

			if (container.offsetHeight === container.scrollHeight) {
				this.#openReadMore(button);
			} else {
				button.addEventListener('click', () => {
					this.#onReadMoreButtonClick(button);
				});
			}

		});
	}

	#readMoreButtons() {
		return this.shadowRoot.querySelectorAll('.read-more-button');
	}

	#onReadMoreButtonClick(button) {
		this.#openReadMore(button);
	}

	#openReadMore(button) {
		const container = button.previousElementSibling;
		container.style.maxHeight = null;
		container.classList.remove('has-read-more');
		button.remove();
	}

	// Render: Accordion Group
	#renderAccordionGroup(detail = {}) {
		var border_styles;

		if (MMX.arrayIsEmpty(detail.details?.children)) {
			return '';
		}

		const theme_available = detail?.accordion_settings?.heading?.typography_theme?.theme_available ?? false;
		const border_enabled = detail?.accordion_settings?.border?.settings?.enabled ?? false;

		if (!border_enabled) {
			border_styles =  '';
		}
		else {
			border_styles = /*html*/`
				--mmx-accordion__border-width-amount: ${MMX.encodeEntities(MMX.coerceNumber(detail?.accordion_settings?.border?.width?.value))};
				--mmx-accordion__border-radius-amount: ${MMX.encodeEntities(MMX.coerceNumber(detail?.accordion_settings?.border?.radius?.value))};
				--mmx-accordion__border-color: ${MMX.encodeEntities(MMX.coerceString(detail?.accordion_settings?.border?.color?.value, {fallback: 'transparent' }))};
			`;
		}

		return /*html*/`
			<div
				part="detail-content detail-content__${MMX.encodeEntities(detail.type.value)}"
			>
				<mmx-accordion
					part="accordion"
					data-border-location="${MMX.encodeEntities(MMX.coerceString(!border_enabled ? 'none' : (detail?.accordion_settings?.border?.location?.value ?? '')))}"
					data-icon-location="${MMX.encodeEntities(MMX.coerceString(detail?.accordion_settings?.icon?.location?.value))}"
					style="
						--mmx-accordion__spacing: ${MMX.encodeEntities(MMX.coerceNumber(detail?.accordion_settings?.accordion?.spacing?.value))}rem;
						${border_styles}
					"
				>
					${detail.details.children.map(child => {
						return /*html*/`
							<details
								part="accordion-details"
								slot="details"
								class="mmx-accordion__details"
							>
								<summary
									part="accordion-heading"
									class="mmx-accordion__heading"
								>
									${this.#renderAccordionGroupIcons(detail)}
									<mmx-text
										part="accordion-heading-text"
										class="mmx-accordion__heading-text"
										data-theme="${MMX.encodeEntities(theme_available)}"
										data-theme-class="${MMX.encodeEntities(detail?.accordion_settings?.heading?.typography_theme?.classname ?? '')}"
										data-tag="${MMX.encodeEntities(MMX.coerceString(detail?.accordion_settings?.heading?.tag?.value))}"
										data-chars-per-line="none"
									>
										${this.renderThemeStylesheetTemplate(theme_available)}
										${child.name?.value}
									</mmx-text>
								</summary>
								<div
									part="accordion-content"
									class="mmx-accordion__content"
								>
									${this.#renderDetail(child)}
								</div>
							</details>
						`;
					}).join('')}
				</mmx-accordion>
			</div>
		`;
	}

	#renderAccordionGroupIcons(detail = {}) {
		let closedIcon;
		let openIcon;

		switch (detail?.accordion_settings?.icon?.set?.value) {
			case 'chevrons':
				closedIcon = 'chevron-down';
				openIcon = 'chevron-up';
				break;
			case 'triangles':
				closedIcon = 'triangle-down';
				openIcon = 'triangle-up';
				break;
			case 'plus_minus':
				closedIcon = 'add';
				openIcon = 'subtract';
				break;
			default:
				break;
		}

		if (detail?.accordion_settings?.icon?.location?.value === 'none') {
			return '';
		}
		else if (!closedIcon && !openIcon) {
			return '';
		}

		return /*html*/`
			<mmx-icon
				class="mmx-accordion__heading-icon-closed"
				data-color="${MMX.encodeEntities(MMX.coerceString(detail?.accordion_settings?.heading?.font_color?.value))}"
				data-name="${MMX.encodeEntities(closedIcon)}"
			></mmx-icon>
			<mmx-icon
				class="mmx-accordion__heading-icon-open"
				data-color="${MMX.encodeEntities(MMX.coerceString(detail?.accordion_settings?.heading?.font_color?.value))}"
				data-name="${MMX.encodeEntities(openIcon)}"
			></mmx-icon>
		`;
	}

	// Render: Tab Group
	#renderTabGroup(detail = {}) {
		if (MMX.arrayIsEmpty(detail.details?.children)) {
			return '';
		}

		const theme_available = detail?.tab_settings?.typography_theme?.theme_available ?? false;

		return /*html*/`
			<div
				part="detail-content detail-content__${MMX.encodeEntities(detail.type.value)}"
			>
				<mmx-tabs part="tabs">
					${detail.details.children.map(child => {
						if (!this.#willRenderDetail(child)) {
							return '';
						}

						return /*html*/`
							<mmx-tab part="tab">
								<mmx-text
									part="tab-text"
									data-theme="${MMX.encodeEntities(theme_available)}"
									data-theme-class="${MMX.encodeEntities(detail?.tab_settings?.typography_theme?.classname ?? '')}"
									data-tag="${MMX.encodeEntities(MMX.coerceString(detail?.tab_settings?.tag?.value))}"
									data-chars-per-line="none"
								>
									${this.renderThemeStylesheetTemplate(theme_available)}
									${child.name?.value}
								</mmx-text>
							</mmx-tab>
							<mmx-tab-panel part="tab-panel">
								${this.#renderDetail(child)}
							</mmx-tab-panel>
						`;
					}).join('')}
				</mmx-tabs>
			</div>
		`;
	}

	// Render: Core Detail
	#renderCoreDetail(detail = {}) {
		const type = detail?.type?.value;

		return this.#renderTextDetail({
			value: this.#product?.[type],
			detail
		});
	}

	// Render: Text Detail
	#renderTextDetail({value, detail, source = ''} = {}) {
		const prefix = detail?.prefix?.value;
		const suffix = detail?.suffix?.value;

		if (MMX.valueIsEmpty(value)) {
			return '';
		}

		const theme_available = detail?.text_styles?.typography_theme?.theme_available ?? false;

		return /*html*/`
			<mmx-text
				part="text"
				data-theme="${MMX.encodeEntities(theme_available)}"
				data-theme-class="${MMX.encodeEntities(detail?.text_styles?.typography_theme?.classname ?? '')}"
				data-align="${MMX.encodeEntities(detail?.text_styles?.text_align?.value)}"
				data-chars-per-line="none"
				data-source="${MMX.encodeEntities(source)}"
			>
				${this.renderThemeStylesheetTemplate(theme_available)}
				${this.#renderProductDetailSpan('prefix', prefix)}
				${value}
				${this.#renderProductDetailSpan('suffix', suffix)}
			</mmx-text>
		`;
	}

	#renderProductDetailSpan(type, value) {
		if (MMX.valueIsEmpty(value)) {
			return '';
		}

		return /*html*/`
			<span part="detail-${MMX.encodeEntities(type)}">
				${MMX.encodeEntities(value)}
			</span>
		`;
	}

	// Render: Button
	#renderButton(detail = {}) {
		const type = detail?.type?.value;
		let text = '';
		let prop = {};
		let disabled = '';
		let actionUrl = '';
		let successMessage = '';
		let errorMessage = '';

		if (type === 'add-to-cart-button') {
			prop = detail.add_to_cart_button;
			text = MMX.valueIsEmpty(prop?.value) ? 'Add to Cart' : prop.value;
			actionUrl = detail?.global_minibasket_url?.url ?? '';
			successMessage = detail?.add_to_cart_messages?.success_message?.value;
			errorMessage = detail?.add_to_cart_messages?.error_message?.value;
			if (this.#productIsOutOfStock()) {
				disabled = 'disabled';
			}

		} else if (type === 'add-to-wishlist-button') {
			prop = detail.add_to_wishlist_button;
			text = MMX.valueIsEmpty(prop?.value) ? 'Add to Wishlist' : prop.value;
			actionUrl = detail?.atwl_url?.url ?? '';
		}

		const theme_available = prop?.textsettings?.fields?.normal?.button_theme?.theme_available || false;

		return /*html*/`
			<mmx-button
				part="button"
				exportparts="button: button-wrapper"
				data-theme="${theme_available}"
				data-theme-class="${MMX.encodeEntities(prop?.textsettings?.fields?.normal?.button_theme?.classname ?? '')}"
				data-width="${!theme_available ? 'full' : MMX.encodeEntities(prop?.textsettings?.fields?.normal?.button_width?.value ?? 'full')}"
				data-action-url="${MMX.encodeEntities(actionUrl)}"
				data-success-message="${MMX.encodeEntities(successMessage)}"
				data-error-message="${MMX.encodeEntities(errorMessage)}"
				${disabled}
			>
				${this.renderThemeStylesheetTemplate(theme_available)}
				${MMX.encodeEntities(text)}
			</mmx-button>`;
	}

	#onEnablePurchaseButtons() {
		this.#elementsThatCanBeDisabled().forEach(element => {
			element.disabled = false;
		});
	}

	#onDisablePurchaseButtons() {
		this.#elementsThatCanBeDisabled().forEach(element => {
			element.disabled = true;
		});

		// Update inventory message details
		requestAnimationFrame(() => {
			this.#updateDetailsOfType('inv_short');
			this.#updateDetailsOfType('inv_long');
		});
	}

	#elementsThatCanBeDisabled() {
		return [...this.#addToCartButtons(), this.#quantityInput()];
	}

	// Add to Cart
	#listenForAddToCart() {
		Array.from(this.#addToCartButtons()).forEach(button => {
			button.addEventListener('click', () => {
				this.#onAddToCartButtonClick(button);
			});
		});
	}

	#addToCartButtons() {
		return this.shadowRoot.querySelectorAll('[part~="add-to-cart-button"] > [part~="button"]');
	}

	#onAddToCartButtonClick(button) {
		const productMachine = this.#attributesProductMachine();
		const insertParams = productMachine?.getRuntimeBasketItemInsertParams?.() ?? {};

		if (productMachine && !productMachine?.reportFormValidity?.()) {
			return;
		}

		button.disabled = true;
		this.#removeRuntimeBasketItemInsertMessage(button);

		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Runtime_BasketItem_Insert',
				Product_Code: this.#product.code,
				...insertParams,
				Quantity: this.#getQuantity()
			}
		})
		.then(() => {
			this.#afterRuntimeBasketItemInsert({button, productMachine});
		})
		.catch(response => {
			this.#runtimeBasketItemInsertFailed({button, response});
		})
		.finally(() => {
			button.disabled = false;
		});
	}

	#runtimeBasketItemInsertFailed({button = {}, response = {}} = {}) {
		this.#showRuntimeBasketItemInsertMessage({
			button,
			style: 'warning',
			text: response?.error_message ?? (button?.dataset?.errorMessage || 'There was a problem adding the product to the basket.')
		});
	}

	#showRuntimeBasketItemInsertMessage({button, style = 'info', text = ''} = {}) {
		this.#removeRuntimeBasketItemInsertMessage(button);

		button.insertAdjacentHTML('afterend', this.#renderMessage({
			autoRemove: 5000,
			part: 'add-to-cart-message',
			style,
			text
		}));
	}

	#removeRuntimeBasketItemInsertMessage(button) {
		if (button?.nextElementSibling?.part?.contains?.('add-to-cart-message')) {
			button.nextElementSibling.remove();
		}
	}

	#afterRuntimeBasketItemInsert({button, productMachine} = {}) {
		this.#showRuntimeBasketItemInsertMessage({
			button,
			style: 'success',
			text: button?.dataset?.successMessage || 'Product added to basket!'
		});
		this.#loadMiniBasket(button);
		this.#dispatchGtmEvent('add_to_cart');
		productMachine?.initializeAttributeMachine?.();
	}

	#loadMiniBasket(button) {
		const location = new URL(button?.dataset?.actionUrl || this.getPropValue('global-minibasket-url'), document.baseURI);

		MMX.fetchQueue.request(location, {
			headers: {
				'Cache-Control': 'no-store',
				'X-Miva-Partial-Render': 'global_minibasket'
			}
		})
		.then(async response => await response.text())
		.then(content => {
			this.#dispatchMiniBasketUpdated(content);
		});
	}

	#dispatchMiniBasketUpdated(content) {
		document.dispatchEvent(new CustomEvent('global_minibasket:updated', {
			bubbles: true,
			composed: true,
			detail: {
				openMenu: true,
				content
			}
		}));
	}

	// Add to Wishlist
	#listenForAddToWishlist() {
		Array.from(this.#addToWishlistButtons()).forEach(button => {
			button.addEventListener('click', (e) => {
				this.#onAddToWishlistButtonClick({button, e});
			});
		});
	}

	#addToWishlistButtons() {
		return this.shadowRoot.querySelectorAll('[part~="add-to-wishlist-button"] > [part~="button"]');
	}

	#onAddToWishlistButtonClick({button} = {}) {
		const productMachine = this.#attributesProductMachine();

		if (productMachine && !productMachine?.reportFormValidity?.()) {
			return;
		}

		this.#dispatchGtmEvent('add_to_wishlist');
		this.#goToAtwlUrl(button);
	}

	#goToAtwlUrl(button) {
		const atwlUrl = new URL(button?.dataset?.actionUrl || this.getPropValue('atwl-url'), document.baseURI);

		Object.entries(this.#getAdprObject()).forEach(([name, value]) => {
			if (name === 'Action') {
				value = 'ATWL';
			}

			atwlUrl.searchParams.append(name, value);
		});

		MMX.setWindowLocation(atwlUrl);
	}

	// Attribute Machine
	#listenForAttributeMachine() {
		Array.from(this.#productMachines()).forEach(productMachine => {
			productMachine.addEventListener('pricing_update', (e) => {
				this.#onPricingUpdate(e);
			});

			productMachine.addEventListener('enable_purchase_buttons', (e) => {
				this.#onEnablePurchaseButtons(e);
			});

			productMachine.addEventListener('disable_purchase_buttons', (e) => {
				this.#onDisablePurchaseButtons(e);
			});

			productMachine.addEventListener('variant_changed', (e) => {
				this.#onVariantChanged(e);
			});

			productMachine.addEventListener('price_changed', (e) => {
				this.#onPriceChanged(e);
			});
		});
	}

	#productMachines() {
		return this.shadowRoot.querySelectorAll('mmx-product-machine');
	}

	#onVariantChanged(e) {
		const variantId = MMX.coerceNumber(e.detail?.productData?.variant_id);

		if (this.#variantId === variantId) {
			return;
		}

		this.#variantId = variantId;
		this.#loadImages();
		this.#loadVolumePricingTable();
		this.#loadFitments();
		this.#updateUrl();
		this.#dispatchVariantChanged(e);
	}

	#dispatchVariantChanged(e) {
		this.dispatchEvent(new CustomEvent('variant_changed', {
			detail: e?.detail
		}));
	}

	#onPriceChanged(e) {
		this.#dispatchPriceChanged(e);
	}

	#onPricingUpdate(e) {
		this.#setPricingData(e?.detail?.data);
		this.#updateDetailsOfType('price');
		this.#updateDetailsOfType('discounts');
		this.#updateDetailsOfType('inv_available');
		this.#updateDetailsOfType('inv_short');
		this.#updateDetailsOfType('inv_long');
		this.#updateDetailsOfType('product-charges');
		this.#updateJsonLd();
		this.#updateFormInputs();
		this.#debouncedDispatchGtmViewItemOnce();
	}

	#setPricingData(data = {}) {
		this.#product.discounts = Array.isArray(data?.discounts) ? data.discounts : [];

		if (data?.have_price) {
			this.#product.retail = data?.retail;
			this.#product.formatted_retail = data?.formatted_retail;
			this.#product.base_price = data?.base_price;
			this.#product.formatted_base_price = data?.formatted_base_price;
			this.#product.price = data?.price;
			this.#product.formatted_price = data?.formatted_price;
			this.#product.sale_price = data?.price;
			this.#product.formatted_sale_price = data?.formatted_price;
		}

		if (data.variant) {
			this.#product.inv_active = data?.variant?.inv_active;
			this.#product.inv_available = data?.variant?.inv_available;
			this.#product.inv_instock = data?.variant?.inv_instock;
			this.#product.inv_level = data?.variant?.inv_level;
			this.#product.inv_long = data?.variant?.inv_long;
			this.#product.inv_short = data?.variant?.inv_short;
		}
	}

	#dispatchPriceChanged(e) {
		this.dispatchEvent(new CustomEvent('price_changed', {
			detail: e?.detail
		}));
	}

	// Images
	#loadImages() {
		const filtersMap = this.#getDetailsFiltersMap();
		const imageSizes = Array.from(filtersMap.images);

		MMX.Runtime_JSON_API_Call({
			params: {
				function:	'Runtime_ProductImageList_Load_Product_Variant',
				Product_Code: this.#product.code,
				Variant_ID: this.#variantId,
				Image_Sizes: imageSizes
			}
		})
		.then(response => {
			this.#setImages(response.data, imageSizes);
			this.#updateImages();
		})
		.catch(response => {});
	}

	#setImages(images = [], imageSizes = []) {
		images = Array.isArray(images) ? images : [];
		imageSizes = Array.isArray(imageSizes) ? imageSizes : [];

		this.#images = images.map(image => {
			const sizes = {};

			imageSizes.forEach((imageSize, index) => {
				sizes[imageSize] = {
					url: image?.image_data?.at?.(index)
				};
			});

			return {
				code: image?.type_code,
				sizes
			};
		});
	}

	#updateImages() {
		const imageGalleries = this.#imageGalleries();
		imageGalleries.forEach(imageGallery => {
			imageGallery.setImages(this.#images);
		});
	}

	#imageGalleries() {
		return this.shadowRoot.querySelectorAll('[part~="images"] mmx-image-gallery');
	}

	// Render: Combination Facet Fitment
	#renderFitmentList(detail = {}) {
		const facetCode = detail?.fitment_list_settings?.facet_code?.value;

		if (typeof facetCode === 'undefined') {
			return '';
		}

		return /*html*/`
			<mmx-product-fitment-list data-init="script">
				<script type="application/json">
					${MMX.scriptSafeJSONStringify({
						fitment_data: this.#product?.CustomField_Values?.combofacets?.[`${facetCode}_fitment_list`],
						settings: {
							facet_code: {
								value: facetCode
							},
							breakpoint: detail?.fitment_list_settings?.breakpoint,
							show_empty_results: true
						},
						table_styles: detail?.fitment_list_table_styles
					})}
				</script>
			</mmx-product-fitment-list>
		`;
	}

	// Render: Combination Facet Fitment
	#defaultFitmentMessages = {
		universal: 'This universal product works for your fitment',
		exact: 'This product works for your fitment',
		partial: 'This product may work for your fitment',
		none: 'This product does not work for your fitment'
	};

	#renderFitment(detail = {}) {
		const facetCode = detail?.fitment_settings?.facet_code?.value;
		const fitment = this.#product?.CustomField_Values?.combofacets?.[`${facetCode}_fit`];
		const text = detail.fitment_settings?.messages?.[`${fitment}_message`]?.value || this.#defaultFitmentMessages?.[fitment];

		if (typeof facetCode === 'undefined' || typeof fitment === 'undefined' || typeof text === 'undefined' || fitment === 'unknown') {
			return '';
		}

		let style = detail.fitment_settings?.messages?.[`${fitment}_message`]?.textsettings?.fields?.normal?.message_style?.value || 'auto';

		if (style === 'auto') {
			if (fitment === 'universal') {
				style = 'info';
			}
			else if (fitment === 'exact') {
				style = 'success';
			}
			else if (fitment === 'partial') {
				style = 'warning';
			}
			else if (fitment === 'none') {
				style = 'error';
			}
		}

		return this.#renderMessage({
			text,
			style,
			variant: detail.fitment_settings?.message_styles?.variant?.value,
			size: detail.fitment_settings?.message_styles?.size?.value,
			display: detail.fitment_settings?.message_styles?.display?.value,
			part: `${facetCode} ${fitment}`
		});
	}

	#loadFitments() {
		const facetCodes = this.#getFitmentFacetCodes();
		const requests = Array.from(facetCodes).map(facetCode => {
			return this.#loadFitmentVariant(facetCode);
		});

		Promise.all(requests)
			.then(() => {
				this.#updateDetailsOfType('fitment');
			});
	}

	#getFitmentFacetCodes() {
		const fitmentDetails = this.#getDetailsByType('fitment');

		return fitmentDetails.reduce((facetCodes, fitmentDetail) => {
			const facetCode = fitmentDetail?.fitment_settings?.facet_code?.value;

			if (MMX.valueIsEmpty(facetCode)) {
				return facetCodes;
			}

			return facetCodes.add(facetCode);
		}, new Set());
	}

	#loadFitmentVariant(facetCode) {
		return MMX.Runtime_JSON_API_Call({
			params: {
				function: 'Module',
				Module_Code: 'combofacets',
				Module_Function: 'Runtime_Fitment_Load_Product_Variant',
				CombinationFacet_Code: facetCode,
				Product_Code: this.getPropValue('product-code'),
				Variant_ID: this.#variantId,
			}
		})
		.then(response => {
			this.#product.CustomField_Values.combofacets[`${facetCode}_fit`] = response.data.fit;
		})
		.catch(response => {});
	}

	// Render: Custom Text
	#renderCustomText(detail = {}) {
		const value = detail?.custom_text?.source === 'markdown' ? detail?.custom_text?.value : MMX.encodeEntities(detail?.custom_text?.value);
		const source = detail?.custom_text?.source;

		return this.#renderTextDetail({value, detail, source});
	}

	// Render: Custom Field
	#renderCustomField(detail = {}) {
		const customFieldParts = detail?.customfield?.value?.split?.(':');

		if (customFieldParts?.length !== 2) {
			return '';
		}

		const [moduleCode, fieldCode] = customFieldParts;
		const value = this.#product?.CustomField_Values?.[moduleCode]?.[fieldCode];
		return this.#renderTextDetail({
			value,
			detail
		});
	}

	// Render: Discounts
	#renderDiscounts(detail) {
		if (MMX.arrayIsEmpty(this.#product.discounts)) {
			return '';
		}

		return this.#product.discounts.map(discount => {
			return this.#renderDiscount({discount, detail});
		}).join('');
	}

	#renderDiscount({discount = {}, detail = {}} = {}) {
		if (typeof discount?.descrip !== 'string') {
			return '';
		}

		const theme_available = detail?.text_styles?.typography_theme?.theme_available ?? false;

		return /*html*/`
			<mmx-text
				part="discount"
				data-theme="${MMX.encodeEntities(theme_available)}"
				data-theme-class="${MMX.encodeEntities(detail?.text_styles?.typography_theme?.classname ?? '')}"
				data-align="${MMX.encodeEntities(detail?.text_styles?.text_align?.value)}"
			>
				${this.renderThemeStylesheetTemplate(theme_available)}
				${discount.descrip}: ${discount.formatted_discount}
			</mmx-text>
		`;
	}

	// Render: Fragment
	#renderFragmentDetail(detail = {}) {
		const fragmentCode = detail?.fragment?.value;
		const fragmentContent = this.renderProductFragment({
			product: this.#product,
			fragmentCode
		});

		if (MMX.valueIsEmpty(fragmentContent)){
			return '';
		}

		const theme_available = detail?.text_styles?.typography_theme?.theme_available ?? false;

		return /*html*/`
			<mmx-text
				part="fragment__${MMX.encodeEntities(fragmentCode)}"
				data-hide-on-empty="false"
				data-theme="${MMX.encodeEntities(theme_available)}"
				data-theme-class="${MMX.encodeEntities(detail?.text_styles?.typography_theme?.classname ?? '')}"
				data-align="${MMX.encodeEntities(detail?.text_styles?.text_align?.value)}"
			>
				${this.renderThemeStylesheetTemplate(theme_available)}
				${fragmentContent}
			</mmx-text>
		`;
	}

	// Render: Images
	#renderImages(detail = {}) {
		return /*html*/`
			<mmx-image-gallery data-init="script">
				<script type="application/json">
					${MMX.scriptSafeJSONStringify({
						images: this.#product.images,
						settings: detail.image_settings
					})}
				</script>
			</mmx-image-gallery>
		`;
	}

	// Render: Inventory Available
	#renderInventoryAvailable(detail = {}) {
		if (!this.#product?.inv_active) {
			return '';
		}

		return this.#renderTextDetail({
			value: this.#product?.inv_available,
			detail
		});
	}

	// Render: Inventory Message
	#renderInventoryMessage(detail = {}) {
		let style = detail?.message_styles?.style?.value || 'auto';
		const variant = detail?.message_styles?.variant?.value;
		const size = detail?.message_styles?.size?.value;
		const display = detail?.message_styles?.display?.value;

		if (this.#product?.inv_active) {
			if (style === 'auto') {
				if (this.#product.inv_level === 'in') {
					style = 'success';
				}
				else if (this.#product.inv_level === 'low') {
					style = 'warning';
				}
				else if (this.#product.inv_level === 'out') {
					style = 'error';
				}
			}

			return this.#renderMessage({
				part: `inventory-message ${this.#product.inv_level}`,
				style,
				variant,
				size,
				display,
				text: this.#product?.[detail?.type?.value] || this.#attributesProductMachine()?.inventoryMessageHtml
			});
		}

		// Fallback to attribute machine inventory message when product inventory is not active
		const attributeMachineMessage = this.#attributesProductMachine()?.inventoryMessageHtml;
		if (attributeMachineMessage) {
			if (style === 'auto') {
				style = 'info';
			}

			return this.#renderMessage({
				part: 'inventory-message',
				style,
				variant,
				size,
				display,
				text: attributeMachineMessage
			});
		}

		return '';
	}

	// Render: Message
	#renderMessage({part, style, variant, size, display, text, autoRemove} = {}) {
		const tag = style === 'none' ? 'div': 'mmx-message';

		return /*html*/`
			<${tag}
				part="${MMX.encodeEntities(part)}"
				data-style="${MMX.encodeEntities(style)}"
				data-variant="${MMX.encodeEntities(variant)}"
				data-size="${MMX.encodeEntities(size)}"
				data-display="${MMX.encodeEntities(display)}"
				data-auto-remove="${MMX.encodeEntities(autoRemove)}"
			>
				${text}
			</${tag}>
		`;
	}

	// Render: Price
	#renderPrice(detail = {}) {
		const displayType = detail?.price?.value ?? 'sale';
		const salePrice = this.#product.formatted_sale_price ?? this.#product.formatted_price;
		const priceIsDiscounted = salePrice !== this.#product.formatted_retail;
		let displayPrice = salePrice;

		if (displayType === 'base'){
			displayPrice = this.#product.formatted_base_price;
		}
		else if (displayType === 'retail'){
			displayPrice = this.#product.formatted_retail;
		}

		if (!priceIsDiscounted && ['retail', 'base'].includes(displayType)) {
			return '';
		}

		const theme_available = detail?.text_styles?.typography_theme?.theme_available ?? false;

		return /*html*/`
			<mmx-text
				part="price-${MMX.encodeEntities(displayType)} ${displayType === 'sale' && priceIsDiscounted ? 'price-sale--discounted' : ''}"
				data-theme="${MMX.encodeEntities(theme_available)}"
				data-theme-class="${MMX.encodeEntities(detail?.text_styles?.typography_theme?.classname ?? '')}"
				data-align="${MMX.encodeEntities(detail?.text_styles?.text_align?.value)}"
			>
				${this.renderThemeStylesheetTemplate(theme_available)}
				${this.#renderProductDetailSpan('prefix', detail?.prefix?.value)}
				<span part="price-amount">${displayPrice}</span>
			</mmx-text>
		`;
	}

	// Render: Product Charges
	#renderProductCharges(detail = {}) {
		const totals = {};
		const charges = Array.isArray(this.data?.server?.productcharges?.chargetypes) ? this.data.server.productcharges.chargetypes : [];

		totals.charges = MMX.coerceNumber(this.data?.server?.productcharges?.totals?.charges);
		totals.productCharges = this.#product.price + totals.charges;
		totals.productChargesOriginal = this.#product.base_price + totals.charges;

		return /*html*/`
			${this.#renderProductChargesBaseProduct(totals)}
			<div part="product-charges__list">
				${this.#renderProductChargesDiscounts(detail)}
			</div>
			<div part="product-charges__list">
				${charges.map(charge => {
					return this.#renderProductCharge({charge, detail});
				}).join('')}
				${this.#renderProductChargesSubtotal(totals)}
			</div>
		`;
	}

	#renderProductChargesBaseProduct(totals = {}) {
		if (!totals?.charges) {
			return '';
		}

		return /*html*/`
			<div part="product-charges__list">
				<div part="product-charges__charge">
					<div part="product-charges__name">
						Base Product
					</div>
					<div part="product-charges__amount">
						${this.#product.formatted_base_price}
					</div>
				</div>
			</div>
		`;
	}

	#renderProductCharge({charge = {}, detail = {}} = {}) {
		return /*html*/`
			<div part="product-charges__charge">
				<div part="product-charges__name">
					${charge.name} ${this.#renderProductChargeDescrip({charge, detail})}
				</div>
				<div part="product-charges__amount">
					+${charge.formatted_price}
				</div>
			</div>
		`;
	}

	#renderProductChargeDescrip({charge = {}, detail = {}} = {}) {
		if (MMX.valueIsEmpty(charge?.descrip)) {
			return '';
		}

		return /*html*/`
			<mmx-dialog part="product-charges__charge-dialog-dialog" data-max-width="40vw">
				<mmx-icon part="product-charges__charge-dialog-trigger" slot="trigger" title="View Charge Description">info</mmx-icon>
				<mmx-text part="product-charges__charge-dialog-header" slot="header" data-style="title-3">${charge.name}</mmx-text>
				<div part="product-charges__charge-dialog-content"  slot="content">
					${this.renderContentIntoLightDomSlot({
						slotName: `charge-descrip-${charge.id}`,
						content: charge.descrip
					})}
				</div>
			</mmx-dialog>
		`;
	}

	#renderProductChargesDiscounts(detail = {}) {
		if (MMX.arrayIsEmpty(this.#product.discounts)) {
			return '';
		}

		return this.#product.discounts.map(discount => {
			return this.#renderProductChargesDiscount({discount, detail});
		}).join('');
	}

	#renderProductChargesDiscount({discount = {}, detail = {}} = {}) {
		if (typeof discount?.descrip !== 'string') {
			return '';
		}

		return /*html*/`
			<div part="product-charges__charge product-charges__discount">
				<div part="product-charges__name">
					${discount.descrip}
				</div>
				<div part="product-charges__amount">
					-${discount.formatted_discount}
				</div>
			</div>
		`;
	}

	#renderProductChargesSubtotal(totals = {}) {
		if (!totals?.charges) {
			return '';
		}

		return /*html*/`
			<div part="product-charges__charge product-charges__subtotal">
				<div part="product-charges__name">
					Subtotal Due Today
				</div>
				<div part="product-charges__amount">
					${!(totals.productChargesOriginal > totals.productCharges) ? '' : /*html*/`
						<s part="product-charges__amount-original">${MMCurrencyFormatter(totals.productChargesOriginal)}</s>
					`}
					<span part="product-charges__amount-total">
						${MMCurrencyFormatter(totals.productCharges)}
					</span>
				</div>
			</div>
		`;
	}

	// Render: Quantity In Basket
	#renderQuantityInBasket(detail = {}) {
		return this.#renderTextDetail({
			value: this.#product?.quantity,
			detail
		});
	}

	// Render: Quantity Input
	#renderedQuantity = false;
	#renderQuantityInput(detail = {}) {
		const disabled = this.#productIsOutOfStock() ? 'disabled' : '';
		const quantity = MMX.coerceNumber(this.#getRequestParam('Quantity'), 1);

		if (this.#renderedQuantity) {
			return '';
		}

		this.#renderedQuantity = true;

		return /*html*/`
			<mmx-form-input-quantity
				part="form-input-quantity"
				data-name="Quantity"
				data-size="${MMX.encodeEntities(detail?.quantity_input_size?.value)}"
				data-value="${MMX.encodeEntities(quantity)}"
				${disabled}
			>
			</mmx-form-input-quantity>
		`;
	}

	#quantityInput() {
		return this.shadowRoot.querySelector('[part~="quantity-input"] mmx-form-input-quantity');
	}

	#getQuantity() {
		return MMX.coerceNumber(this.#quantityInput()?.valueAsNumber, 1);
	}

	#listenForQuantityInput() {
		this.#quantityInput()?.addEventListener('input', () => {
			this.#onQuantityChange();
		});
	}

	#onQuantityChange() {
		this.#updateFormInputs();
	}

	// Render: Weight
	#renderWeight(detail = {}) {
		return this.#renderTextDetail({
			value: this.#product?.formatted_weight,
			detail
		});
	}

	// Reveal Element
	revealElement(element) {
		this.#imageGalleries().forEach(imageGallery => {
			imageGallery.closeCloseup();
		});

		if (element?.part?.contains?.('closeup')) {
			const imageGallery = element.getRootNode().host;
			imageGallery.openCloseup();
		}
	}

	// Volume Pricing Table
	#loadVolumePricingTable() {
		this.#volumePricing = [];

		const hasVolumePricingDetails = this.#getDetailsByType('volume-pricing-table').length > 0;

		if (!hasVolumePricingDetails) {
			return;
		}

		MMX.Runtime_JSON_API_Call({
			params: {
				function: 'Module',
				Module_Code: 'discount_volume',
				Module_Function: 'Runtime_VolumePricing_Load_Product_Variant',
				Product_Code: this.getPropValue('product-code'),
				Variant_ID: this.#variantId,
			}
		})
		.then(response => {
			this.#volumePricing = response.data;
			this.#updateDetailsOfType('volume-pricing-table');
		})
		.catch(response => {});
	}

	#renderVolumePricingTable(detail = {}) {
		if (MMX.arrayIsEmpty(this.#volumePricing)) {
			return '';
		}

		if (MMX.valueIsEmpty(detail?.volume_pricing_table_settings?.quantity?.value)) {
			detail.volume_pricing_table_settings.quantity.value = 'Quantity';
		}

		if (MMX.valueIsEmpty(detail?.volume_pricing_table_settings?.price?.value)) {
			detail.volume_pricing_table_settings.price.value = 'Price';
		}

		return /*html*/`
			<table part="volume-pricing-table-table">
				<thead part="volume-pricing-table-thead">
					<tr part="volume-pricing-table-tr">
						<th part="volume-pricing-table-th">
							${this.renderTextProperty(detail?.volume_pricing_table_settings?.quantity, {
								prefix: 'quantity_',
								defaultStyle: 'subheading-s'
							})}
						</th>
						<th part="volume-pricing-table-th">
							${this.renderTextProperty(detail?.volume_pricing_table_settings?.price, {
								prefix: 'price_',
								defaultStyle: 'subheading-s'
							})}
						</th>
					</tr>
				</thead>
				<tbody part="volume-pricing-table-tbody">
					${this.#volumePricing.map(pricing => {
						return this.#renderVolumePricingRow({pricing, detail});
					}).join('')}
				</tbody>
			</table>
		`;
	}

	#renderVolumePricingRow({pricing = {}, detail = {}} = {}) {
		let quantity = '';

		if (pricing.low === pricing.high) {
			quantity = pricing.low;
		}
		else if (pricing.high) {
			quantity = pricing.low + ' - ' + pricing.high;
		}
		else {
			quantity = pricing.low + '+';
		}

		return /*html*/`
			<tr part="volume-pricing-table-tr">
				<td part="volume-pricing-table-td">
					${MMX.encodeEntities(quantity)}
				</td>
				<td part="volume-pricing-table-td">
					${pricing.formatted_price}
				</td>
			</tr>
		`;

	}

	// JSON+LD
	#updateJsonLd() {
		this.#jsonLd().innerHTML = MMX.scriptSafeJSONStringify(this.#getJsonLdData());
	}

	#jsonLd() {
		return this.querySelector('script[type="application/ld+json"]') ?? this.#createJsonLd();
	}

	#createJsonLd() {
		const jsonLd = MMX.createElement({
			type: 'script',
			attributes: {
				type: 'application/ld+json',
				class: 'mmx-skip-mutation'
			}
		});

		return this.appendChild(jsonLd);
	}

	#getJsonLdData() {
		const name = this.#product?.name;
		const description = this.#product?.descrip;
		const sku = MMX.valueIsEmpty(this.#product?.sku) ? this.#product?.code : this.#product?.sku;
		const storeName = this.getPropValue('store-name');
		const brand = this.#product?.CustomField_Values?.customfields?.brand || storeName;

		let availability = '';

		switch (this.#product?.inv_level) {
			case 'low':
				availability = 'https://schema.org/LimitedAvailability';
				break;
			case 'out':
				availability = 'https://schema.org/OutOfStock';
				break;
			case 'in':
			default:
				availability = 'https://schema.org/InStock';
				break;
		}

		const data = {
			'@type': 'Product',
			name,
			description,
			sku,
			mpn: sku,
			image: this.#product?.images?.at(0)?.sizes?.original?.url,
			category: this.#product?.category?.name,
			offers: {
				'@type': 'Offer',
				url: this.#product?.url,
				name,
				description,
				sku,
				seller: storeName,
				itemCondition: 'https://schema.org/NewCondition',
				price: this.#product?.sale_price,
				availability,
				priceCurrency: 'USD'
			}
		};

		if (!MMX.valueIsEmpty(brand)) {
			data.brand = {
				'@type': 'Brand',
				name: brand
			};
		}

		return data;
	}

	// Form Inputs
	#updateFormInputs() {
		const adprObject = this.#getAdprObject();
		const content = this.#objectToHiddenInputs(adprObject);

		this.renderContentIntoLightDomSlot({
			slotName: 'adpr-params',
			content
		});
	}

	#getAdprObject() {
		const adprData = {};
		const productMachineFormData = this.#attributesProductMachine()?.formData;

		if (productMachineFormData) {
			for (const [key, value] of productMachineFormData.entries()) {
				adprData[key] = value;
			}
		}

		adprData.Action = 'ADPR';
		adprData.Product_Code = this.#product.code;
		adprData.Quantity = this.#getQuantity();

		return adprData;
	}

	#objectToHiddenInputs(obj = {}) {
		return Object.entries(obj).map(([key, value]) => {
			return this.#renderHiddenInput(key, value);
		}).join('');
	}

	#renderHiddenInput(key, value) {
		return /*html*/`
			<input type="hidden" name="${MMX.encodeEntities(key)}" value="${MMX.encodeEntities(value)}" />
		`;
	}

	// URL Methods
	#getUrl() {
		return new URL(window.location.href);
	}

	#getRequestParam(param) {
		const lowerParam = param.toLowerCase();

		if (this.data?.server) {
			for (const key of Object.keys(this.data.server)) {
				if (key.toLowerCase() === lowerParam) {
					return this.data.server[key];
				}
			}
		}

		for (const [key, value] of this.#getUrl().searchParams.entries()) {
			if (key.toLowerCase() === lowerParam) {
				return value;
			}
		}
	}

	#updateUrl() {
		if (MMX.isFalsy(this.data?.advanced?.update_url_with_variant_id?.value)) {
			return;
		}

		const url = this.#getUrl();

		for (const key of url.searchParams.keys()) {
			if (key.toLowerCase() === 'variant_id') {
				url.searchParams.delete(key);
			}
		}

		if (this.#variantId > 0) {
			url.searchParams.set('Variant_ID', this.#variantId);
		}

		window.history.replaceState(null, '', url);
	}

	// GTM/GA4 Events
	#dispatchGtmEvent(event = '') {
		const product = structuredClone(this.#product);
		product.quantity = this.#getQuantity();
		product.item_variant = this.#getGtmVariant();
		product.item_brand = this.#product?.CustomField_Values?.customfields?.brand;
		product.item_category = this.#product?.category?.name;

		this.dispatchEvent(new CustomEvent('track_mmx_event', {
			bubbles: true,
			composed: true,
			detail: {
				event,
				element: this,
				products: [product]
			}
		}));
	}

	#dispatchedViewItem = false;
	#dispatchGtmViewItemOnce() {
		if (this.#dispatchedViewItem) {
			return;
		}

		this.#dispatchedViewItem = true;
		this.#dispatchGtmEvent('view_item');
	}

	#debouncedDispatchGtmViewItemOnce = MMX.debounce(() => {
		this.#dispatchGtmViewItemOnce();
	}, 500);

	#getGtmVariant() {
		const variant = [];
		const productMachine = this.#attributesProductMachine();

		this.#getFlatProductAttributes().forEach((attribute, index) => {
			const value = productMachine.formData.get(`Product_Attributes[${index + 1}]:value`);
			if (value) {
				if (attribute.type === 'checkbox') {
					variant.push(`${attribute.code}`);
				}
				else {
					variant.push(`${attribute.code}: ${value}`);
				}
			}
		});

		const subscriptionTerm = productMachine?.selectedSubscriptionTerm?.descrip;
		if (subscriptionTerm) {
			variant.push(subscriptionTerm);
		}

		return variant.join(', ');
	}
}

if (!customElements.get('mmx-product-details')) {
	customElements.define('mmx-product-details', MMX_ProductDetails);
}

/**
 * MMX / PRODUCT MACHINE
 */

class MMX_ProductMachine extends MMX_FeaturedProduct {
	constructor() {
		super();
	}

	initializeAttributeMachine_OverwriteOnPriceChanged(attributeMachine) {
		const productMachine = this;

		const methods = ['Pricing_Update', 'Disable_Purchase_Buttons', 'Enable_Purchase_Buttons'];

		methods.forEach(method => {
			const backup = `_${method}`;
			attributeMachine[backup] = attributeMachine[method];
			attributeMachine[method] = function (...args) {
				const eventName = method.toLowerCase();

				this[backup](...args);

				productMachine.dispatchEvent(new CustomEvent(eventName, {
					bubbles: true,
					composed: true,
					detail: {
						data: args.at(0),
						args
					}
				}));
			};
		});
	}
}

if (!customElements.get('mmx-product-machine')) {
	customElements.define('mmx-product-machine', MMX_ProductMachine);
}