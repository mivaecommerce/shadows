/**
 * MMX / FEATURED PRODUCT
 */
class MMX_FeaturedProduct extends MMX_Element {

	static get props() {
		return {
			'image-position': {
				options: [
					'left',
					'right'
				],
				default: 'left'
			},
			'image-type': {
				allowAny: true,
				default: 'main'
			},
			'image-fit': {
				allowAny: true,
				options: [
					'cover',
					'contain',
					'fill',
					'none',
					'scale-down'
				],
				default: 'contain'
			},
			'multiple-images': {
				allowAny: true,
				isBoolean: true,
				default: true
			},
			discount: {
				allowAny: true,
				isBoolean: true,
				default: true
			},
			'product-code': {
				allowAny: true,
				default: null
			},
			'product-name-theme': {
				allowAny: true,
				isBoolean: true,
				default: false
			},
			'product-name-theme-class': {
				allowAny: true,
				default: ''
			},
			'product-name-style': {
				options: [
					'display-1',
					'display-2',
					'display-3',
					'title-1',
					'title-2',
					'title-3',
					'title-4',
					'subheading-l',
					'subheading-s',
					'subheading-xs',
					'paragraph-l',
					'paragraph-s',
					'paragraph-xs'
				],
				allowAny: true,
				default: 'title-3'
			},
			'product-name-tag': {
				options: [
					'h1',
					'h2',
					'h3',
					'h4',
					'h5',
					'h6',
					'div',
					'span'
				],
				allowAny: true,
				default: 'div'
			},
			'product-name-font-family': {
				allowAny: true,
				default: null
			},
			'product-name-font-weight': {
				allowAny: true,
				default: null
			},
			'product-name-font-style': {
				allowAny: true,
				default: null
			},
			'product-name-font-size': {
				allowAny: true,
				isNumeric: true,
				default: null
			},
			'product-name-font-color': {
				allowAny: true,
				default: null
			},
			'show-product-sku': {
				isBoolean: true,
				default: false
			},
			'product-sku-style': {
				allowAny: true,
				default: 'paragraph-xs'
			},
			'show-product-code': {
				isBoolean: true,
				default: false
			},
			'product-code-style': {
				allowAny: true,
				default: 'paragraph-xs'
			},
			subheading: {
				allowAny: true,
				default: null
			},
			'subheading-theme': {
				allowAny: true,
				isBoolean: true,
				default: false
			},
			'subheading-theme-class': {
				allowAny: true,
				default: ''
			},
			'subheading-style': {
				options: [
					'display-1',
					'display-2',
					'display-3',
					'title-1',
					'title-2',
					'title-3',
					'title-4',
					'subheading-l',
					'subheading-s',
					'subheading-xs',
					'paragraph-l',
					'paragraph-s',
					'paragraph-xs'
				],
				allowAny: true,
				default: ''
			},
			'subheading-font-family': {
				allowAny: true,
				default: null
			},
			'subheading-font-weight': {
				allowAny: true,
				default: null
			},
			'subheading-font-style': {
				allowAny: true,
				default: null
			},
			'subheading-font-size': {
				allowAny: true,
				isNumeric: true,
				default: null
			},
			'subheading-font-color': {
				allowAny: true,
				default: null
			},
			'overwrite-description': {
				allowAny: true,
				isBoolean: true,
				default: false
			},
			description: {
				allowAny: true,
				default: null
			},
			'description-theme': {
				allowAny: true,
				isBoolean: true,
				default: false
			},
			'description-theme-class': {
				allowAny: true,
				default: ''
			},
			'description-style': {
				options: [
					'display-1',
					'display-2',
					'display-3',
					'title-1',
					'title-2',
					'title-3',
					'title-4',
					'subheading-l',
					'subheading-s',
					'subheading-xs',
					'paragraph-l',
					'paragraph-s',
					'paragraph-xs'
				],
				allowAny: true,
				default: 'paragraph-s'
			},
			'description-font-family': {
				allowAny: true,
				default: null
			},
			'description-font-weight': {
				allowAny: true,
				default: null
			},
			'description-font-style': {
				allowAny: true,
				default: null
			},
			'description-font-size': {
				allowAny: true,
				isNumeric: true,
				default: null
			},
			'description-font-color': {
				allowAny: true,
				default: null
			},
			button: {
				allowAny: true,
				default: null
			},
			'button-style': {
				allowAny: true,
				default: 'primary'
			},
			'button-size': {
				allowAny: true,
				default: 's'
			},
			'button-theme': {
				allowAny: true,
				isBoolean: true,
				default: false
			},
			'button-theme-class': {
				allowAny: true,
				default: ''
			},
			'button-theme-width': {
				allowAny: true,
				default: 'full'
			},
			'desktop-image-size': {
				allowAny: true,
				default: '720x720'
			},
			'mobile-image-size': {
				allowAny: true,
				default: '335x335'
			},
			'fallback-product-image-default': {
				allowAny: true,
				default: null
			},
			'fallback-product-image-mobile': {
				allowAny: true,
				default: null
			},
			'bask-url': {
				allowAny: true,
				default: MMX.longMerchantUrl({Screen: 'BASK'})
			},
			'fragment-code': {
				allowAny: true,
				default: null
			},
			'nav-button-size': {
				allowAny: true,
				isNumeric: true,
				default: 10
			},
			'show-product-images': {
				isBoolean: true,
				default: true
			},
			'invalid-msg': {
				allowAny: true,
				default: ''
			},
			'invalid-msg-source': {
				allowAny: true
			},
			'missing-text-msg': {
				allowAny: true,
				default: ''
			},
			'missing-text-msg-source': {
				allowAny: true
			},
			'missing-radio-msg': {
				allowAny: true,
				default: ''
			},
			'missing-radio-msg-source': {
				allowAny: true
			},
			'select-one-text': {
				allowAny: true,
				default: ''
			},
			'show-attribute-prices': {
				isBoolean: true,
				default: true
			},
			'swatch-size': {
				allowAny: true,
				default: '40px'
			},
			'swatch-border-radius': {
				allowAny: true,
				default: '50%'
			},
			'swatch-border-width': {
				allowAny: true,
				default: '1px'
			},
			'swatch-border-color': {
				allowAny: true,
				default: 'var(--mmx-color-primary-text)'
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-button', 'mmx-forms', 'mmx-hero', 'mmx-hero-slider', 'mmx-featured-product'];
	#buttonEnabled = true;
	renderUniquely = true;

	constructor() {
		super();
		this.makeShadow();
	}

	attributeChanged(name, oldValue, newValue) {
		if (name === 'data-product-code' && newValue !== oldValue) {
			this.loadProduct();
		}
	}

	loadProduct() {
		const product_code = this.getPropValue('product-code');

		if (MMX.valueIsEmpty(product_code)) {
			return;
		}

		if (String(product_code) === String(this?.product?.code)) {
			this.productLoaded(this.product);
			return;
		}

		MMX.Runtime_JSON_API_Call({
			params: {
				function: 'Runtime_ProductList_Load_Query',
				filter: [
					{
						name: 'search',
						value: [
							{
								field: 'code',
								operator: 'EQ',
								value: product_code
							}
						]
					},
					...this.getDefaultFilters()
				]
			}
		})
		.then(response => {
			this.productLoaded(response?.data?.data?.at(0));
		})
		.catch(response => {});
	}

	clearProduct() {
		this.clearProductData();
		this.removeAttribute('data-product-code');
	}

	clearProductData() {
		this.product = null;
		this.images = null;
		this.variant_id = null;
	}

	isProductLoaded() {
		return MMX.variableType(this.product) === 'object' && Array.isArray(this.images);
	}

	setProduct(product) {
		if (MMX.variableType(product) !== 'object') {
			this.clearProduct();
			return;
		}

		this.setProductData(product);
		this.setAttribute('data-product-code', product.code);
	}

	setProductData(product) {
		var image, index, image_type, product_image;

		if (MMX.variableType(product) !== 'object') {
			this.clearProduct();
			return;
		}

		this.product	= product;
		this.images		= new Array();
		this.variant_id = null;

		if (!this.product?.images?.length) {
			if (this.getPropValue('fallback-product-image-default')?.length || this.getPropValue('fallback-product-image-mobile')?.length) {
				this.images.push(this.fallbackProductImage());
			}
		}
		else {
			image_type = this.getPropValue('image-type');

			if (!MMX.valueIsEmpty(image_type) && (index = this.product.images.findIndex(image => image.code === image_type)) > 0) {
				this.product.images.splice(0, 0, this.product.images.splice(index, 1)[0]);
			}

			for (image of this.product.images) {
				product_image			= new Object();
				product_image.mobile	= image?.sizes?.[this.getPropValue('mobile-image-size')]?.url || product_image.default;
				product_image.default	= image?.sizes?.[this.getPropValue('desktop-image-size')]?.url || image?.sizes?.['original']?.url;

				this.images.push(product_image);

				if (!this.getPropValue('multiple-images')) {
					break;
				}
			}
		}
	}

	productLoaded(product) {
		this.setProductData(product);
		this.forceUpdate();
		this.dispatchEvent(new CustomEvent('product:load'));
	}

	getDefaultFilters() {
		var ondemandcolumns;

		if (!this.getPropValue('discount'))	ondemandcolumns = this.getDefaultFilterOnDemandColumnsCommon();
		else								ondemandcolumns = [...this.getDefaultFilterOnDemandColumnsCommon(), ...this.getDefaultFilterOnDemandColumnsDiscount()];

		return [
			{
				name: 'images',
				value: {
					sizes: ['original', this.getPropValue('desktop-image-size'), this.getPropValue('mobile-image-size')]
				}
			},
			{
				name: 'ondemandcolumns',
				value: ondemandcolumns
			},
			{
				name: 'fragments',
				value: [
					this.getPropValue('fragment-code')
				]
			}
		];
	}

	getDefaultFilterOnDemandColumnsCommon() {
		return [
			'descrip',
			'attributes',
			'subscriptionterms',
			'subscriptionsettings',
			'inventory'
		];
	}

	getDefaultFilterOnDemandColumnsDiscount() {
		return [
			'sale_price',
			'discounts'
		];
	}

	//
	// Render Functions
	//

	render() {
		if (!this.isProductLoaded())
		{
			return '';
		}

		return /*html*/`
			<div part="wrapper" class="mmx-featured-product mmx-featured-product__image-position-${MMX.encodeEntities(this.getPropValue('image-position'))}">
				${this.renderProductImages()}
				${this.renderProductContent()}
			</div>
		`;
	}

	afterRender() {
		if (!this.isProductLoaded())
		{
			return;
		}

		this.initializeAttributeMachine({
			success: 1,
			data: this.product.attributes
		});
		this.initializeSubscription();
	}

	initializeSubscription() {
		if (this.productHasSubscription) {
			if (this.#subscriptionTermID() > 0) {
				this.#subscription().dispatchEvent(new Event('change'));
			}
		}
	}

	#subscription() {
		return this.shadowRoot.querySelector('#l-subscription');
	}

	#subscriptionTermID() {
		return MMX.coerceNumber(Number(this.#subscription()?.value), 0);
	}

	renderProductImages() {
		if (this.getPropValue('show-product-images') ) {
			return this.getPropValue('multiple-images') ? this.renderProductImageSlider() : this.renderProductImageStandalone();
		} else {
			return '';
		}
	}

	renderProductImageStandalone() {
		const dimensions = this.getPropValue('desktop-image-size').split('x');
		const width = MMX.coerceNumber(dimensions.at(0));
		const height = MMX.coerceNumber(dimensions.at(1));
		const image = Array.isArray(this.images) && this.images.length ? this.images.at(0) : this.fallbackProductImage();

		return /*html*/`
			<style>
				.mmx-featured-product__image-slider--standalone img {
					width: 100%;
					height: auto;
					aspect-ratio: ${width} / ${height};
					object-fit: ${this.getPropValue('image-fit')};
					object-position: top;
				}
			</style>
			<div part="image-slider" class="mmx-featured-product__image-slider mmx-featured-product__image-slider--standalone">
				<a part="image-slide" href="${MMX.encodeEntities(this.product.url)}">
					${this.renderProductImagePictureTag(image)}
				</a>
			</div>
		`;
	}

	renderProductImageSlider() {
		return /*html*/`
			<mmx-hero-slider
				part="image-slider"
				class="mmx-featured-product__image-slider"
				data-autoplay="false"
				data-size="${MMX.encodeEntities(this.getPropValue('desktop-image-size'))}"
				data-nav-position="under"
				data-nav-style="minimal"
				data-nav-button-size="${MMX.encodeEntities(this.getPropValue('nav-button-size'))}"
			>
				${this.images?.map(image => this.renderProductImage(image)).join('') ?? ''}
			</mmx-hero-slider>
		`;
	}

	renderProductImage(image) {
		return /*html*/`
			<mmx-hero
				slot="hero_slide"
				part="image-slide"
				data-fit="${MMX.encodeEntities(this.getPropValue('image-fit'))}"
				data-href="${MMX.encodeEntities(this.product.url)}"
				data-title="View ${MMX.encodeEntities(this.product.name)}"
			>
				${this.renderProductImagePictureTag(image)}
			</mmx-hero>
		`;
	}

	renderProductImagePictureTag(image) {
		if (typeof image?.default !== 'string') {
			return '';
		}

		return /*html*/`
			<picture slot="image">
				${this.renderProductMobileImage(image)}
				<img src="${MMX.encodeEntitiesURI(image.default)}" alt="">
			</picture>
		`;
	}

	renderProductMobileImage(image) {
		if (!image?.mobile?.length || image.mobile === image.default) {
			return '';
		}

		return /*html*/`
			<source class="source__mobile" media="(max-width: 39.999em)" srcset="${MMX.encodeEntitiesURI(image.mobile)}">
		`;
	}

	renderProductContent() {
		const theme_available = this.getPropValue('product-name-theme');

		return /*html*/`
			<div part="product-content" class="mmx-featured-product__product-content">
				<form autocomplete="off" method="post" action="${MMX.encodeEntities(this.getBaskUrl())}">
					<input name="Action" type="hidden" value="ADPR" />
					<input name="Product_Code" type="hidden" value="${MMX.encodeEntities(this.getPropValue('product-code'))}" />
					<input name="Quantity" type="hidden" value="1" />
					${this.renderProductContentSubheading()}
					${this.renderProductCode()}
					${this.renderProductSku()}
					<mmx-text
						part="product-name"
						class="mmx-featured-product__product-name-text"
						data-theme="${theme_available}"
						data-theme-class="${MMX.encodeEntities(this.getPropValue('product-name-theme-class'))}"
						data-style="${MMX.encodeEntities(this.getPropValue('product-name-style'))}"
						data-tag="${MMX.encodeEntities(this.getPropValue('product-name-tag'))}"
					>
						${this.renderLegacyStylesTemplate(theme_available, this.renderFontStyles('product-name'))}
						${this.renderThemeStylesheetTemplate(theme_available)}
						${this.product.name}
					</mmx-text>
					<div part="pricing-discounts" class="mmx-featured-product__pricing-discounts">
						<div part="pricing" class="mmx-featured-product__pricing">
							<div part="current-price" id="price-value" class="mmx-featured-product__current-price">${this.product.formatted_price}</div>
							${this.renderProductContentOriginalPricing()}
						</div>
						${this.renderProductFragmentPart()}
						${this.renderProductContentDiscounts()}
					</div>
					${this.renderProductContentInventoryMessage()}
					${this.renderProductContentAttributes()}
					${this.renderProductContentDescription()}
					${this.renderProductContentAddToCartButton()}
				</form>
			</div>
		`;
	}

	renderProductContentSubheading() {
		const subheading = this.getPropValue('subheading');

		if (MMX.valueIsEmpty(subheading)) {
			return '';
		}

		const theme_available = this.getPropValue('subheading-theme');

		return /*html*/`
			<mmx-text
				part="subheading"
				class="mmx-featured-product__subheading"
				data-theme="${theme_available}"
				data-theme-class="${MMX.encodeEntities(this.getPropValue('subheading-theme-class'))}"
				data-style="${MMX.encodeEntities(this.getPropValue('subheading-style'))}"
			>
				${this.renderLegacyStylesTemplate(theme_available, this.renderFontStyles('subheading'))}
				${this.renderThemeStylesheetTemplate(theme_available)}
				${subheading}
			</mmx-text>
		`;
	}

	renderProductCode() {
		if (!this.getPropValue('show-product-code')) {
			return '';
		}

		return /*html*/`
			<mmx-text
				part="product-code"
				class="mmx-featured-product__product-code-text"
				data-style="${MMX.encodeEntities(this.getPropValue('product-code-style'))}"
			>
				Code: ${this.product.code}
			</mmx-text>
		`;
	}

	renderProductSku() {
		if (!this.getPropValue('show-product-sku') || !this.product.sku.length) {
			return '';
		}

		return /*html*/`
			<mmx-text
				part="product-sku"
				class="mmx-featured-product__product-sku-text"
				data-style="${MMX.encodeEntities(this.getPropValue('product-sku-style'))}"
			>
				SKU: ${this.product.sku}
			</mmx-text>
		`;
	}

	renderProductContentOriginalPricing() {
		if (!this.getPropValue('discount')) {
			return '';
		}

		return /*html*/`
			<s part="original-price" id="price-value-additional" class="mmx-featured-product__original-price">${this.product.base_price > this.product.price ? this.product.formatted_base_price : ''}</s>
		`;
	}

	renderProductFragmentPart() {
		const fragmentCode = this.getPropValue('fragment-code');
		const fragmentContent = this.renderProductFragment({product: this.product, fragmentCode});

		if (MMX.valueIsEmpty(fragmentContent)){
			return '';
		}

		return /*html*/`
			<div part="product-fragment product-fragment__${MMX.encodeEntities(fragmentCode)}">
				${fragmentContent}
			</div>`;
	}

	renderProductContentDiscounts() {
		if (!this.getPropValue('discount')) {
			return '';
		}

		return /*html*/`
			<div id="discount" part="discounts" class="mmx-featured-product__discounts">${this.product.discounts?.map(discount => this.renderProductContentDiscount(discount)).join('') || ''}</div>
		`;
	}

	renderProductContentDiscount(discount) {
		return /*html*/`
			<div part="discount">${discount.descrip}: ${discount.formatted_discount}</div>
		`;
	}

	renderProductContentInventoryMessage() {
		return /*html*/`
			<div part="inventory-message" id="inv-message" class="mmx-featured-product__product-inventory_message">${this.product.inv_active ? this.product.inv_short : ''}</div>
		`;
	}

	get productHasAttributes() {
		return this.product?.attributes?.length > 0;
	}

	get productHasSubscription() {
		return this.product?.subscriptionsettings?.enabled === true && this.product?.subscriptionterms?.length > 0;
	}

	get shouldRenderAttributes() {
		return this.productHasAttributes || this.productHasSubscription;
	}

	renderProductContentAttributes() {
		if (!this.shouldRenderAttributes) {
			return '';
		}

		let index = 1;

		return /*html*/`
			<div part="product-attributes" class="mmx-featured-product__product-attributes">
				${this.product.attributes.map(attribute => {
					const content = this.renderProductContentAttribute(attribute, index, null);

					index += attribute.type === 'template' ? attribute.attributes.length : 1;

					return content;
				}).join('')}
				${this.renderProductContentAttributeSubscription()}
			</div>
		`;
	}

	renderProductContentAttribute(attribute, index, template) {
		switch (attribute.type) {
			case 'text'				: return this.renderProductContentAttributeText(attribute, index, template);
			case 'memo'				: return this.renderProductContentAttributeMemo(attribute, index, template);
			case 'radio'			: return this.renderProductContentAttributeRadio(attribute, index, template);
			case 'select'			: return this.renderProductContentAttributeSelect(attribute, index, template);
			case 'swatch-select'	: return this.renderProductContentAttributeSwatchSelect(attribute, index, template);
			case 'checkbox'			: return this.renderProductContentAttributeCheckbox(attribute, index, template);
			case 'template'			: return this.renderProductContentAttributeTemplate(attribute, index, template);
		}
	}

	renderProductContentAttributeCommon(attribute, index, template) {
		if (!template) {
			return `<input type="hidden" name="Product_Attributes[${MMX.encodeEntities(index)}]:code" value="${MMX.encodeEntities(attribute.code)}">`;
		}

		return `
			<input type="hidden" name="Product_Attributes[${MMX.encodeEntities(index)}]:code" value="${MMX.encodeEntities(template.code)}">
			<input type="hidden" name="Product_Attributes[${MMX.encodeEntities(index)}]:template_code" value="${MMX.encodeEntities(attribute.code)}">
		`;
	}

	renderProductContentAttributeText(attribute, index, template) {
		const attribute_id	= this.buildAttributeID(attribute);
		const required		= attribute.required ? 'required' : '';

		return /*html*/`
			${this.renderProductContentAttributeCommon(attribute, index, template)}
			<div part="product-attribute" class="mmx-featured-product__product-attribute">
				<label class="mmx-featured-product__product-attribute-label ${MMX.encodeEntities(required)}" for="${MMX.encodeEntities(attribute_id)}" title="${MMX.encodeEntities(attribute.prompt)}">${attribute.prompt}</label>
				<input id="${MMX.encodeEntities(attribute_id)}" class="mmx-featured-product__product-attribute-input mmx-form-input" data-attribute="${MMX.encodeEntities(attribute.code)}" data-option-price="${MMX.encodeEntities(attribute.price)}" data-regular-price="" type="text" name="Product_Attributes[${MMX.encodeEntities(index)}]:value" value="${MMX.encodeEntities(attribute.value ?? '')}" placeholder="" ${required} />
			</div>
		`;
	}

	renderProductContentAttributeMemo(attribute, index, template) {
		const attribute_id	= this.buildAttributeID(attribute);
		const required		= attribute.required ? 'required' : '';

		return /*html*/`
			${this.renderProductContentAttributeCommon(attribute, index, template)}
			<div part="product-attribute" class="mmx-featured-product__product-attribute">
				<label class="mmx-featured-product__product-attribute-label ${MMX.encodeEntities(required)}" for="${MMX.encodeEntities(attribute_id)}" title="${MMX.encodeEntities(attribute.prompt)}">${attribute.prompt}</label>
				<textarea id="${MMX.encodeEntities(attribute_id)}" class="mmx-featured-product__product-attribute-textarea mmx-form-textarea" data-attribute="${MMX.encodeEntities(attribute.code)}" data-option-price="${MMX.encodeEntities(attribute.price)}" data-regular-price="" name="Product_Attributes[${MMX.encodeEntities(index)}]:value" placeholder="" ${required}>${MMX.encodeEntities(attribute.value ?? '')}</textarea>
			</div>
		`;
	}

	renderProductContentAttributeRadio(attribute, index, template) {
		const required = attribute.required ? 'required' : '';

		return /*html*/`
			${this.renderProductContentAttributeCommon(attribute, index, template)}
			<div part="product-attribute" class="mmx-featured-product__product-attribute">
				<span class="mmx-featured-product__product-attribute-label ${MMX.encodeEntities(required)}" title="${MMX.encodeEntities(attribute.prompt)}">${attribute.prompt}</span>
				<fieldset class="mmx-form-fieldset">
					${attribute.options.map(option => this.renderProductContentAttributeRadioOption(attribute, index, option)).join('')}
				</fieldset>
			</div>
		`;
	}

	shouldSelectAttributeOption(attribute, option) {
		if (typeof attribute.value === 'undefined' && attribute.default_id === option.id) {
			return true;
		} else if (attribute.value === option.code) {
			return true;
		}
		return false;
	}

	renderProductContentAttributeRadioOption(attribute, index, option) {
		var encoded_image_template;

		const required	= attribute.required ? 'required' : '';
		const checked	= this.shouldSelectAttributeOption(attribute, option) ? 'checked' : '';

		if (option.image?.length)	encoded_image_template = `<img src="${MMX.encodeEntitiesURI(option.image)}" alt="${MMX.encodeEntities(option.prompt)}" loading="lazy" />`;
		else						encoded_image_template = `${MMX.encodeEntities(option.prompt)} ${this.#renderProductAttributePrice(option)}`;

		return /*html*/`
			<label class="mmx-featured-product__product-attribute-checkbox mmx-featured-product__product-attribute-checkbox__radio mmx-form-radio" title="${MMX.encodeEntities(option.prompt)}">
				<input class="mmx-featured-product__product-attribute-checkbox__input mmx-form-radio__input" data-attribute="${MMX.encodeEntities(attribute.code)}" data-option-price="${MMX.encodeEntities(option.price)}" data-regular-price="" type="radio" name="Product_Attributes[${MMX.encodeEntities(index)}]:value" value="${MMX.encodeEntities(option.code)}" ${checked} ${required}>
				<span class="mmx-featured-product__product-attribute-checkbox__caption mmx-form-radio__caption">${encoded_image_template}</span>
			</label>
		`;
	}

	renderProductContentAttributeSelect(attribute, index, template) {
		const attribute_id	= this.buildAttributeID(attribute);
		const required		= attribute.required ? 'required' : '';

		return /*html*/`
			${this.renderProductContentAttributeCommon(attribute, index, template)}
			<div part="product-attribute" class="mmx-featured-product__product-attribute">
				<label class="mmx-featured-product__product-attribute-label ${MMX.encodeEntities(required)}" for="${MMX.encodeEntities(attribute_id)}" title="${MMX.encodeEntities(attribute.prompt)}">${attribute.prompt}</label>
				<div class="mmx-featured-product__product-attribute-select mmx-form-select">
					<select id="${MMX.encodeEntities(attribute_id)}" class="mmx-featured-product__product-attribute-select__dropdown mmx-form-select__dropdown" data-attribute="${MMX.encodeEntities(attribute.code)}" name="Product_Attributes[${MMX.encodeEntities(index)}]:value" ${required}>
						${this.#renderProductContentAttributeSelectOneOption()}
						${attribute.options.map(option => this.renderProductContentAttributeSelectOption(attribute, index, option)).join('')}
					</select>
				</div>
			</div>
		`;
	}

	#renderProductContentAttributeSelectOneOption() {
		const selectOneText = this.getPropValue('select-one-text');

		if (MMX.valueIsEmpty(selectOneText)) {
			return '';
		}

		return /*html*/`
			<option value="">${MMX.encodeEntities(selectOneText)}</option>
		`;
	}

	renderProductContentAttributeSelectOption(attribute, index, option) {
		const selected = this.shouldSelectAttributeOption(attribute, option) ? 'selected' : '';

		return /*html*/`
			<option value="${MMX.encodeEntities(option.code)}" data-option-price="${MMX.encodeEntities(option.price)}" data-regular-price="" ${selected}>
				${MMX.encodeEntities(option.prompt)} ${this.#renderProductAttributePrice(option)}
			</option>
		`;
	}

	renderProductContentAttributeSwatchSelect(attribute, index, template) {
		const attribute_id	= this.buildAttributeID(attribute);
		const required		= attribute.required ? 'required' : '';

		return /*html*/`
			${this.renderProductContentAttributeCommon(attribute, index, template)}
			<div part="product-attribute" class="mmx-featured-product__product-attribute">
				<label class="mmx-featured-product__product-attribute-label ${MMX.encodeEntities(required)}" for="${MMX.encodeEntities(attribute_id)}" title="${MMX.encodeEntities(attribute.prompt)}">${attribute.prompt}:&nbsp;<span data-hook="attribute-swatch-name"></span></label>
				<div class="mmx-featured-product__product-attribute-select mmx-featured-product__product-attribute-select__swatch">
					<select class="mmx-featured-product__product-attribute-select__dropdown" aria-labelledby="${MMX.encodeEntities(attribute_id)}" data-attribute="${MMX.encodeEntities(attribute.code)}" data-hook="attribute-swatch-select" name="Product_Attributes[${MMX.encodeEntities(index)}]:value">
						${this.#renderProductContentAttributeSelectOneOption()}
						${attribute.options.map(option => this.renderProductContentAttributeSwatchSelectOption(attribute, index, option)).join('')}
					</select>
				</div>
				<div id="swatches" class="mmx-featured-product__product-attribute-swatch__swatches" aria-labelledby="${MMX.encodeEntities(attribute_id)}" role="group"></div>
			</div>
		`;
	}

	renderProductContentAttributeSwatchSelectOption(attribute, index, option) {
		const selected = this.shouldSelectAttributeOption(attribute, option) ? 'selected' : '';

		return /*html*/`
			<option value="${MMX.encodeEntities(option.code)}" data-option-price="${MMX.encodeEntities(option.price)}" data-regular-price="" ${selected}>
				${MMX.encodeEntities(option.prompt)} ${this.#renderProductAttributePrice(option)}
			</option>
		`;
	}

	renderProductContentAttributeCheckbox(attribute, index, template) {
		var encoded_image_template;
		const required = attribute.required ? 'required' : '';
		const checked  = this.#attributeValueIsTruthy(attribute.value) ? 'checked' : '';

		if (attribute.image?.length)	encoded_image_template = `<img src="${MMX.encodeEntitiesURI(attribute.image)}" alt="${MMX.encodeEntities(attribute.prompt)}" loading="lazy" />`;
		else							encoded_image_template = `${attribute.prompt} ${this.#renderProductAttributePrice(attribute)}`;

		return /*html*/`
			${this.renderProductContentAttributeCommon(attribute, index, template)}
			<div part="product-attribute" class="mmx-featured-product__product-attribute">
				<label class="mmx-featured-product__product-attribute-checkbox mmx-form-checkbox" title="${MMX.encodeEntities(attribute.prompt)}">
					<input class="mmx-featured-product__product-attribute-checkbox__input mmx-form-checkbox__input" data-attribute="${MMX.encodeEntities(attribute.code)}" data-option-price="${MMX.encodeEntities(attribute.price)}" data-regular-price="" type="checkbox" name="Product_Attributes[${MMX.encodeEntities(index)}]:value" ${required} ${checked}>
					<span class="mmx-featured-product__product-attribute-checkbox__caption mmx-form-checkbox__caption">${encoded_image_template}</span>
				</label>
			</div>
		`;
	}

	#attributeValueIsTruthy(value) {
		return !MMX.valueIsEmpty(value) && String(value) !== '0';
	}

	#renderProductAttributePrice(attributeOrOption) {
		if (this.getPropValue('show-attribute-prices')) {
			return attributeOrOption.price ? attributeOrOption.formatted_price : '';
		}

		return '';
	}

	renderProductContentAttributeTemplate(attribute, index) {
		return /*html*/`
			${attribute.attributes?.map((template_attribute, template_attribute_index) => this.renderProductContentAttribute(template_attribute, index + template_attribute_index, attribute)).join('')}
		`;
	}

	renderProductContentAttributeSubscription() {
		if (!this.productHasSubscription) {
			return '';
		}

		const required = this.product.subscriptionsettings.mandatory ? 'required' : '';

		if (this.product.subscriptionsettings.mandatory) {
			return /*html*/`
				<label class="mmx-featured-product__product-attribute-label ${MMX.encodeEntities(required)}" for="l-subscription" title="Subscribe">Select Subscription</label>
				<div class="mmx-featured-product__product-attribute-select mmx-form-select">
					<select id="l-subscription" class="mmx-featured-product__product-attribute-select__dropdown mmx-form-select__dropdown" name="Product_Subscription_Term_ID" ${required}>
						${this.product.subscriptionterms.map(term => this.renderProductContentAttributeSubscriptionOption(term)).join('')}
					</select>
				</div>
			`;
		}

		return /*html*/`
			<label class="mmx-featured-product__product-attribute-label ${MMX.encodeEntities(required)}" for="l-subscription" title="Subscribe">Select Subscription</label>
			<div class="mmx-featured-product__product-attribute-select mmx-form-select">
				<select id="l-subscription" class="mmx-featured-product__product-attribute-select__dropdown mmx-form-select__dropdown" name="Product_Subscription_Term_ID" ${required}>
					<option value="0">One Time Purchase</option>
					${this.product.subscriptionterms.map(term => this.renderProductContentAttributeSubscriptionOption(term)).join('')}
				</select>
			</div>
		`;
	}

	renderProductContentAttributeSubscriptionOption(term) {
		const selected = MMX.isTruthy(term.selected) ? 'selected' : '';
		return /*html*/`
			<option value="${MMX.encodeEntities(term.id)}" ${selected}>${MMX.encodeEntities(term.descrip)}</option>
		`;
	}

	renderProductContentDescription() {
		var description, max_chars;

		max_chars		= 0;
		description 	= this.product.descrip;

		if (this.getPropValue('overwrite-description')) {
			max_chars	= 600;
			description	= this.getPropValue('description') ?? '';
		}

		const theme_available = this.getPropValue('description-theme');

		return /*html*/`
			<mmx-text
				part="product-description"
				class="mmx-featured-product__product-description"
				data-max-chars="${MMX.encodeEntities(max_chars)}"
				data-trim-suffix="..."
				data-theme="${theme_available}"
				data-theme-class="${MMX.encodeEntities(this.getPropValue('description-theme-class'))}"
				data-style="${MMX.encodeEntities(this.getPropValue('description-style'))}"
			>
				${this.renderLegacyStylesTemplate(theme_available, this.renderFontStyles('description'))}
				${this.renderThemeStylesheetTemplate(theme_available)}
				${description}
			</mmx-text>
		`;
	}

	renderProductContentAddToCartButton() {
		const button = this.getPropValue('button');

		if (!button) {
			return '';
		}

		if (this.product.inv_active && this.product.inv_level === 'out') {
			return '';
		}

		const theme_available = this.getPropValue('button-theme');

		return /*html*/`
			<div part="product-add-to-cart" class="mmx-featured-product__product-add-to-cart">
				<mmx-button
					part="button"
					exportparts="button: button__inner"
					data-type="submit"
					data-style="${MMX.encodeEntities(this.getPropValue('button-style'))}"
					data-size="${MMX.encodeEntities(this.getPropValue('button-size'))}"
					data-theme="${MMX.encodeEntities(theme_available)}"
					data-theme-class="${MMX.encodeEntities(this.getPropValue('button-theme-class'))}"
					data-width="${!theme_available ? 'full' : MMX.encodeEntities(this.getPropValue('button-theme-width'))}"
				>
					${this.renderThemeStylesheetTemplate(theme_available)}
					${MMX.encodeEntities(button)}
				</mmx-button>
			</div>
		`;
	}

	renderFontStyles(prefix) {
		var encoded_name_styles = new Array();

		if (this.getPropValue(`${prefix}-font-family`) !== null)	encoded_name_styles.push(`font-family: ${MMX.encodeEntities(this.getPropValue(`${prefix}-font-family`))};`);
		if (this.getPropValue(`${prefix}-font-weight`) !== null)	encoded_name_styles.push(`font-weight: ${MMX.encodeEntities(this.getPropValue(`${prefix}-font-weight`))};`);
		if (this.getPropValue(`${prefix}-font-style`) !== null)		encoded_name_styles.push(`font-style: ${MMX.encodeEntities(this.getPropValue(`${prefix}-font-style`))};`);
		if (this.getPropValue(`${prefix}-font-size`) !== null)		encoded_name_styles.push(`font-size: ${MMX.encodeEntities(this.getPropValue(`${prefix}-font-size`))}px;`);
		if (this.getPropValue(`${prefix}-font-color`) !== null)		encoded_name_styles.push(`color: ${MMX.encodeEntities(this.getPropValue(`${prefix}-font-color`))};`);

		if (!encoded_name_styles.length) {
			return '';
		}

		return /*html*/`${encoded_name_styles.join('')}`;
	}

	getButton() {
		return this.shadowRoot.querySelector('.mmx-featured-product__product-add-to-cart > mmx-button');
	}

	buildAttributeID(attribute) {
		return `l-${attribute.code.toLowerCase()}`;
	}

	getBaskUrl() {
		return this.getPropValue('bask-url');
	}

	//
	// Form
	//

	get #form() {
		return this.shadowRoot.querySelector('.mmx-featured-product__product-content > form');
	}

	get formValidity() {
		const hasValidAttributes = this.checkFormValidity();

		return {
			valid: this.#canPurchase && hasValidAttributes,
			canPurchase: this.#canPurchase,
			hasValidAttributes
		};
	}

	get #canPurchase() {
		if (!this.product) {
			return false;
		}

		if (this.productHasAttributes) {
			return this.#buttonEnabled;
		}

		const outOfStock = this.product.inv_active && this.product.inv_level === 'out';
		return !outOfStock;
	}

	checkFormValidity() {
		return this.#form?.checkValidity() ?? false;
	}

	reportFormValidity() {
		return this.#form?.reportValidity() ?? false;
	}

	get formData () {
		return new FormData(this.#form || undefined);
	}

	get inventoryMessage() {
		return this.shadowRoot.getElementById('inv-message')?.textContent?.trim() ?? '';
	}

	get inventoryMessageHtml() {
		return this.shadowRoot.getElementById('inv-message')?.innerHTML?.trim() ?? '';
	}

	get quantity() {
		return MMX.coerceNumber(this.shadowRoot.querySelector('[name="Quantity"]').value, 1);
	}

	get selectedSubscriptionTerm() {
		const subscriptionTermID = this.#subscriptionTermID();
		return this.product?.subscriptionterms?.find?.(term => {
			return term.id === subscriptionTermID;
		});
	}

	getRuntimeBasketItemInsertParams() {
		return {
			Function: 'Runtime_BasketItem_Insert',
			Product_Code: this.product.code,
			Quantity: this.quantity,
			Attributes: this.#getRuntimeBasketItemInsertAttributes(),
			Subscription_Term_ID: this.#subscriptionTermID()
		};
	}

	#getRuntimeBasketItemInsertAttributes() {
		const attributes = this.#getFlatAttributes();

		return attributes.map((attribute, index) => {
			const value = this.formData?.get?.(`Product_Attributes[${index + 1}]:value`) ?? '';

			if (attribute.templateAttribute?.code) {
				return {
					code: attribute.templateAttribute.code,
					template_code: attribute.code,
					value
				};
			}

			return {
				code: attribute.code,
				value
			};
		});
	}

	#getFlatAttributes() {
		return this.product.attributes.reduce((flatAttributes, attribute) => {
			if (attribute.attemp_id > 0) {
				attribute.attributes.forEach(templateAttribute => {
					templateAttribute.templateAttribute = attribute;
					flatAttributes.push(templateAttribute);
				});
			} else {
				flatAttributes.push(attribute);
			}

			return flatAttributes;
		}, []);
	}

	//
	// Attribute Machine
	//

	initializeAttributeMachine(attributes, possible) {
		const self = this;
		var discount, product_data, attributemachine;

		if (!this.shouldRenderAttributes) {
			return;
		}

		discount = this.getPropValue('discount');

		product_data = {
			dependency_resolution:			'first',
			price_element_id:				'price-value',
			additional_price_element_id:	'price-value-additional',
			inventory_element_id:			'inv-message',
			swatch_element_id:				'swatches',
			discount_element_id:			'discount',
			inv_long:						false,
			price:							discount ? 'sale' : 'price',
			additionalprice:				discount ? 'base' : '',
			displaydiscounts:				discount,
			predictdiscounts:				discount,
			product_code:					this.getPropValue('product-code'),
			invalid_msg:					this.getPropValue('invalid-msg-source') === 'markdown' ? this.getPropValue('invalid-msg') : MMX.encodeEntities(this.getPropValue('invalid-msg')),
			missing_text_msg:				this.getPropValue('missing-text-msg-source') === 'markdown' ? this.getPropValue('missing-text-msg') : MMX.encodeEntities(this.getPropValue('missing-text-msg')),
			missing_radio_msg:				this.getPropValue('missing-radio-msg-source') === 'markdown' ? this.getPropValue('missing-radio-msg') : MMX.encodeEntities(this.getPropValue('missing-radio-msg')),

			getElementById:					(id) => this.shadowRoot.getElementById(id),
			getElementsByTagName:			(tagName) => this.shadowRoot.querySelector('.mmx-featured-product').getElementsByTagName(tagName)
		};

		attributemachine = new AttributeMachine(product_data);

		this.initializeAttributeMachine_OverwriteGenerateDiscount(attributemachine);
		this.initializeAttributeMachine_OverwriteGenerateSwatch(attributemachine);
		this.initializeAttributeMachine_OverwriteSwatchClick(attributemachine);
		this.initializeAttributeMachine_OverwriteEnableDisablePurchaseButtons(attributemachine);
		this.initializeAttributeMachine_OverwriteOnPriceChanged(attributemachine);
		this.initializeAttributeMachine_OverwriteOnVariantChanged(attributemachine);

		attributemachine.Initialize(attributes, possible);
	}

	initializeAttributeMachine_OverwriteGenerateDiscount(attributemachine) {
		const self = this;

		attributemachine.Generate_Discount = function(discount) {
			var discount_div;

			discount_div			= document.createElement( 'div' );
			discount_div.innerHTML	= discount.descrip + ': ' + discount.formatted_discount;
			discount_div.part       = 'discount';

			return discount_div;
		};
	}

	initializeAttributeMachine_OverwriteGenerateSwatch(attributemachine) {
		const self = this;

		attributemachine.Generate_Swatch = function(product_code, attribute, option) {
			var img, swatch, swatch_button, swatch_container;

			swatch_container	= self.shadowRoot.getElementById('swatches');

			img					= document.createElement('img');
			img.src				= encodeURI(option.image);
			img.setAttribute('alt', option.prompt);

			swatch_button		= document.createElement('button');
			swatch_button.setAttribute('type', 'button');
			swatch_button.setAttribute('aria-label', option.prompt);
			swatch_button.appendChild(img);

			swatch				= document.createElement('li');
			swatch.classList.add('o-list-inline__item');
			swatch.setAttribute('data-code', option.code);
			swatch.setAttribute('data-color', option.prompt);
			swatch.appendChild(swatch_button);

			img.onload			= function() {
				if (window.matchMedia('(pointer: fine)').matches) {
					img.height	= this.height / 2;
					img.width	= this.width / 2;
				}
				else {
					img.height	= this.height;
					img.width	= this.width;
				}

				if (swatch_container) {
					swatch_container.style.minHeight = `${this.height * 1.25}px`;
				}
			};

			setTimeout(function() {
				var swatch_select, swatch_list_element, swatch_name_element, selected_swatch_option;

				if (!swatch_container) {
					return;
				}

				if (!(swatch_select = self.shadowRoot.querySelector('[data-hook="attribute-swatch-select"]'))) {
					return;
				}

				selected_swatch_option = swatch_select.options[swatch_select.selectedIndex];

				if (swatch_name_element = self.shadowRoot.querySelector('[data-hook="attribute-swatch-name"]')) {
					swatch_name_element.textContent = MMX.valueIsEmpty(selected_swatch_option.value) ? '' : selected_swatch_option.text;
				}

				if (swatch_list_element = swatch_container.querySelector('ul')) {
					swatch_list_element.removeAttribute('style');
					swatch_list_element.classList.add('o-list-inline');
					swatch_list_element.querySelectorAll('li').forEach(function(swatch_element) {
						var swatch_color, element_swatch_image;

						element_swatch_image	= swatch_element.querySelector('button');
						swatch_color			= swatch_element.getAttribute('data-code');

						if (element_swatch_image && swatch_color === selected_swatch_option.value) {
							element_swatch_image.classList.add('mmx-featured-product__product-attribute-swatch__swatches--active');
						}
					});
				}
			}, 0);

			return swatch;
		};
	}

	styles() {
		const swatchSize = this.getPropValue('swatch-size');
		const swatchBorderRadius = this.getPropValue('swatch-border-radius');
		const swatchBorderWidth = this.getPropValue('swatch-border-width');
		const swatchBorderColor = this.getPropValue('swatch-border-color');

		return /*css*/`
			:host {
				--mmx-featured-product__swatch-size: ${MMX.encodeEntities(swatchSize)};
				--mmx-featured-product__swatch-border-radius: ${MMX.encodeEntities(swatchBorderRadius)};
				--mmx-featured-product__swatch-border-width: ${MMX.encodeEntities(swatchBorderWidth)};
				--mmx-featured-product__swatch-border-color: ${MMX.encodeEntities(swatchBorderColor)};
			}
		`;
	}

	initializeAttributeMachine_OverwriteSwatchClick(attributemachine) {
		const self = this;

		attributemachine.Swatch_Click = function(input, attribute, option) {
			var i, swatch_name_element;

			if (swatch_name_element = self.shadowRoot.querySelector('[data-hook="attribute-swatch-name"]')) {
				swatch_name_element.innerHTML = option.prompt;
			}

			for (i = 0; i < input?.select?.options?.length; i++) {
				if (input.select.options[i].value === option.code) {
					input.select.selectedIndex = i;
				}
			}

			this.Attribute_Changed(input);

			input?.machine?.swatches?.childNodes?.[0]?.childNodes?.forEach(function(swatchElement) {
				var swatch_color, element_swatch_image;

				element_swatch_image	= swatchElement.querySelector('button');
				swatch_color			= swatchElement.getAttribute('data-code');

				if (element_swatch_image && swatch_color === input?.select?.options?.[input?.select?.selectedIndex]?.value) {
					element_swatch_image.focus();
				}
			});
		};
	}

	initializeAttributeMachine_OverwriteEnableDisablePurchaseButtons(attributemachine) {
		const self = this;
		var button;

		attributemachine.Disable_Purchase_Buttons = function() {
			self.#buttonEnabled = false;
			if (button = self.getButton()) {
				button.disabled = true;
			}

			self.debouncedDispatchContentUpdated();
		};

		attributemachine.Enable_Purchase_Buttons = function() {
			self.#buttonEnabled = true;
			if (button = self.getButton()) {
				button.disabled = false;
			}
		};
	}

	initializeAttributeMachine_OverwriteOnPriceChanged(attributemachine) {
		attributemachine.onPriceChanged = (productData) => {
			this.dispatchEvent(new CustomEvent('price_changed', {
				detail: {
					productData
				}
			}));
		};
	}

	initializeAttributeMachine_OverwriteOnVariantChanged(attributemachine) {
		attributemachine.onVariantChanged = (productData) => {
			this.imageManagerUpdateVariant(productData.variant_id);
			this.dispatchEvent(new CustomEvent('variant_changed', {
				detail: {
					productData
				}
			}));
		};
	}

	//
	// Image Manager
	//
	imageManagerUpdateVariant(variant_id) {
		if (this.variant_id === variant_id || !this.getPropValue('show-product-images')) {
			return;
		}

		MMX.Runtime_JSON_API_Call({
			params: {
				function:		'Runtime_ProductImageList_Load_Product_Variant',
				Product_Code:	this.getPropValue('product-code'),
				Variant_ID:		variant_id,
				Image_Sizes:	[this.getPropValue('desktop-image-size'), this.getPropValue('mobile-image-size')]
			}
		})
		.then(response => {
			this.variant_id = variant_id;
			this.onInitializeImageManager(response.data);
		})
		.catch(response => {});
	}

	fallbackProductImage() {
		const image   = new Object();
		image.mobile  = this.getPropValue('fallback-product-image-mobile');
		image.default = this.getPropValue('fallback-product-image-default') || image.mobile;
		return image;
	}

	onInitializeImageManager(images) {
		var i, i_len, image, index, template, image_type, picture_dom, product_image, slides, slider;

		this.images = new Array();

		image_type = this.getPropValue('image-type');

		if (!images?.length) {
			this.images.push(this.fallbackProductImage());
		}
		else {
			if (!MMX.valueIsEmpty(image_type) && (index = images.findIndex(image => image.type_code === image_type)) !== -1) {
				images.splice(0, 0, images.splice(index, 1)[0]);
			}

			for (image of images) {
				if (image?.image_data?.length) {
					product_image			= new Object();
					product_image.mobile	= image?.image_data?.[1];
					product_image.default	= image?.image_data?.[0];

					this.images.push(product_image);

					if (!this.getPropValue('multiple-images')) {
						break;
					}
				}
			}
		}

		//
		// Avoid reflow of the slider/slide by replacing just the picture tag when a
		// slide already exists, inserting a new one if we have more new images, or removing if
		// we have leftover old images. This ensures the selection state remains consistent.
		//

		if (slider = this.shadowRoot.querySelector('[part="image-slider"]')) {
			slides = slider.querySelectorAll('[part="image-slide"]');

			for ([index, image] of this.images.entries()) {
				if (slides[index]) {
					slides[index].innerHTML = this.renderProductImagePictureTag(image);
				}
				else {
					template			= document.createElement('template');
					template.innerHTML	= this.renderProductImage(image);

					slider.appendChild(template.content.cloneNode(true));
				}
			}

			for (i = index + 1, i_len = slides.length; i < i_len; i++) {
				slides[ i ].remove();
			}

			return;
		}

		this.forceUpdate();
	}

	onDataChange() {
		this.setSpacing(this.data?.advanced?.spacing);

		if (this.data?.product?.product?._isPreloaded) {
			this.setProduct(this.data?.product?.product?.product);
		}

		MMX.setElementAttributes(this, {
			'data-image-position': this.data?.layout?.image_position?.value,
			'data-image-type': this.data?.advanced?.product?.image_type?.value,
			'data-image-fit': this.data?.advanced?.product?.image_fit?.value,
			'data-multiple-images': this.data?.advanced?.product?.multiple_images?.value,
			'data-discount': this.data?.advanced?.product?.discount?.value,
			'data-show-product-sku': this.data?.advanced?.product?.sku?.value,
			'data-show-product-code': this.data?.advanced?.product?.code?.value,
			'data-product-name-theme': this.data?.text?.product_name?.typography_theme?.theme_available,
			'data-product-name-theme-class': this.data?.text?.product_name?.typography_theme?.classname,
			'data-product-name-style': this.data?.text?.product_name?.product_name_style?.value,
			'data-product-name-tag': this.data?.advanced?.product?.product_name_tag?.value,
			'data-product-name-font-family': this.data?.text?.product_name?.font?.font?.family,
			'data-product-name-font-weight': this.data?.text?.product_name?.font?.weight,
			'data-product-name-font-style': this.data?.text?.product_name?.font?.style,
			'data-product-name-font-size': this.data?.text?.product_name?.font_size?.value,
			'data-product-name-font-color': this.data?.text?.product_name?.font_color?.value,
			'data-subheading': this.data?.text?.subheading?.text?.value,
			'data-subheading-theme': this.data?.text?.subheading?.text?.textsettings?.fields?.normal?.typography_theme?.theme_available,
			'data-subheading-theme-class': this.data?.text?.subheading?.text?.textsettings?.fields?.normal?.typography_theme?.classname,
			'data-subheading-style': this.data?.text?.subheading?.text?.textsettings?.fields?.normal?.subheading_style?.value,
			'data-subheading-font-family': this.data?.text?.subheading?.text?.textsettings?.fields?.normal?.font?.font?.family,
			'data-subheading-font-weight': this.data?.text?.subheading?.text?.textsettings?.fields?.normal?.font?.weight,
			'data-subheading-font-style': this.data?.text?.subheading?.text?.textsettings?.fields?.normal?.font?.style,
			'data-subheading-font-size': this.data?.text?.subheading?.text?.textsettings?.fields?.normal?.font_size?.value,
			'data-subheading-font-color': this.data?.text?.subheading?.text?.textsettings?.fields?.normal?.font_color?.value,
			'data-overwrite-description': this.data?.text?.description?.overwritten_description?.settings?.enabled,
			'data-description': this.data?.text?.description?.overwritten_description?.settings?.enabled ? (this.data?.text?.description?.overwritten_description?.text?.value || '') : undefined,
			'data-description-theme': this.data?.text?.description?.typography_theme?.theme_available,
			'data-description-theme-class': this.data?.text?.description?.typography_theme?.classname,
			'data-description-style': this.data?.text?.description?.description_style?.value,
			'data-description-font-family': this.data?.text?.description?.font?.font?.family,
			'data-description-font-weight': this.data?.text?.description?.font?.weight,
			'data-description-font-style': this.data?.text?.description?.font?.style,
			'data-description-font-size': this.data?.text?.description?.font_size?.value,
			'data-description-font-color': this.data?.text?.description?.font_color?.value,
			'data-button': this.data?.advanced?.product?.button?.settings?.enabled ? this.data?.advanced?.product?.button?.button_text?.value : undefined,
			'data-button-style': this.data?.advanced?.product?.button?.settings?.enabled ? this.data?.advanced?.product?.button?.button_text?.textsettings?.fields?.normal?.button_style?.value : undefined,
			'data-button-size': this.data?.advanced?.product?.button?.settings?.enabled ? this.data?.advanced?.product?.button?.button_text?.textsettings?.fields?.normal?.button_size?.value : undefined,
			'data-button-theme': this.data?.advanced?.product?.button?.settings?.enabled ? this.data?.advanced?.product?.button?.button_text?.textsettings?.fields?.normal?.button_theme?.theme_available : undefined,
			'data-button-theme-class': this.data?.advanced?.product?.button?.settings?.enabled ? this.data?.advanced?.product?.button?.button_text?.textsettings?.fields?.normal?.button_theme?.classname : undefined,
			'data-button-theme-width': this.data?.advanced?.product?.button?.settings?.enabled ? this.data?.advanced?.product?.button?.button_text?.textsettings?.fields?.normal?.button_width?.value : undefined,
			'data-fallback-product-image-default': this.data?.fallback_product_image_default,
			'data-fallback-product-image-mobile': this.data?.fallback_product_image_mobile,
			'data-fragment-code': this.data?.advanced?.product?.fragment_code?.value,
			'data-nav-button-size': this.data?.advanced?.product?.nav_button_size?.value ?? '',
			'data-invalid-msg-source': this.data?.advanced?.attribute_messages?.invalid_msg?.source,
			'data-invalid-msg': this.data?.advanced?.attribute_messages?.invalid_msg?.value,
			'data-missing-text-msg-source': this.data?.advanced?.attribute_messages?.missing_text_msg?.source,
			'data-missing-text-msg': this.data?.advanced?.attribute_messages?.missing_text_msg?.value,
			'data-missing-radio-msg-source': this.data?.advanced?.attribute_messages?.missing_radio_msg?.source,
			'data-missing-radio-msg': this.data?.advanced?.attribute_messages?.missing_radio_msg?.value,
			'data-select-one-text': MMX.isTruthy(this.data?.advanced?.attribute_settings?.include_select_one?.value) ? MMX.coerceString(this.data?.advanced?.attribute_settings?.select_one_text?.value, {fallback: '<Select One>'}) : undefined,
			'data-show-attribute-prices': this.data?.advanced?.attribute_settings?.attribute_prices?.value === 'hide' ? false : true,
			'data-swatch-size': MMX.composeUnitValue(this.data?.advanced?.attribute_settings?.swatches?.size),
			'data-swatch-border-radius': MMX.objectToCssShorthand(this.data?.advanced?.attribute_settings?.swatches?.border_radius, {key: 'border_%corner%_radius'}),
			'data-swatch-border-width': `${MMX.objectToCssShorthand(this.data?.advanced?.attribute_settings?.swatches?.border_width, {key: 'border_%side%_width'})}`,
			'data-swatch-border-color': this.data?.advanced?.attribute_settings?.swatches?.border_color?.value,
			'data-product-code': this.data?.product?.product?.product_code // this should always be last so that loadProduct() is called once the previous attribute-values/props are set
		});
	}
}

if (!customElements.get('mmx-featured-product')) {
	customElements.define('mmx-featured-product', MMX_FeaturedProduct);
}