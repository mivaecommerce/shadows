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
					'paragraph-s'
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
			'product-name-font-size': {
				allowAny: true,
				isNumeric: true,
				default: null
			},
			'product-name-font-weight': {
				allowAny: true,
				default: null
			},
			'product-name-font-color': {
				allowAny: true,
				default: null
			},
			subheading: {
				allowAny: true,
				default: null
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
					'paragraph-s'
				],
				allowAny: true,
				default: ''
			},
			'subheading-font-family': {
				allowAny: true,
				default: null
			},
			'subheading-font-size': {
				allowAny: true,
				isNumeric: true,
				default: null
			},
			'subheading-font-weight': {
				allowAny: true,
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
					'paragraph-s'
				],
				allowAny: true,
				default: 'paragraph-s'
			},
			'description-font-family': {
				allowAny: true,
				default: null
			},
			'description-font-size': {
				allowAny: true,
				isNumeric: true,
				default: null
			},
			'description-font-weight': {
				allowAny: true,
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
				default: `/mm5/merchant.mvc?${window?.Store_Code?.length ? 'Store_Code=' + encodeURIComponent(Store_Code) + '&' : ''}Screen=BASK`
			}
		};
	}

	themeResourcePattern = /mmx-(base|button|hero|hero-slider|featured-product)\/styles.css|family=Inter/i;

	constructor() {
		super();
		this.makeShadow();
	}

	attributeChanged(name, oldValue, newValue) {
		if (name === 'data-product-code') {
			this.loadProduct();
		}
	}

	loadProduct() {
		const product_code = this.getPropValue('product-code');

		if (!product_code?.length) {
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
			},
			callback: (response) => {
				var image, index, image_type, product_image;

				if (response?.data?.data?.length === 1) {
					this.product	= response.data.data[ 0 ];
					this.images		= new Array();

					if (!this.product?.images?.length) {
						if (this.getPropValue('fallback-product-image-default')?.length || this.getPropValue('fallback-product-image-mobile')?.length) {
							product_image			= new Object();
							product_image.mobile	= this.getPropValue('fallback-product-image-mobile');
							product_image.default	= this.getPropValue('fallback-product-image-default') || product_image.mobile;

							this.images.push(product_image);
						}
					}
					else {
						image_type = this.getPropValue('image-type');

						if (image_type?.length && (index = this.product?.images.findIndex(image => image.code === image_type)) !== -1) {
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

				this.forceUpdate();
			}
		});
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
			}
		];
	}

	getDefaultFilterOnDemandColumnsCommon() {
		return [
			'descrip',
			'attributes',
			'subscriptionterms',
			'subscriptionsettings'
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
		if (!this.product)
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
		if (!this.product)
		{
			return;
		}

		this.initializeAttributeMachine();
		this.initializeImageManager();
	}

	renderProductImages() {
		return /*html*/`
			<mmx-hero-slider
				part="image-slider"
				class="mmx-featured-product__image-slider"
				data-autoplay="false"
				data-size="${MMX.encodeEntities(this.getPropValue('desktop-image-size'))}"
				data-nav-position="under"
				data-nav-style="minimal"
			>
				${this.images?.map(image => this.renderProductImage(image)).join('')}
			</mmx-hero-slider>
		`;
	}

	renderProductImage(image) {
		return /*html*/`
			<mmx-hero
				slot="hero_slide"
				data-fit="${MMX.encodeEntities(this.getPropValue('image-fit'))}"
				data-href="${MMX.encodeEntities(this.product.url)}"
			>
				${this.renderProductImagePictureTag(image)}
			</mmx-hero>
		`;
	}

	renderProductImagePictureTag(image) {
		return /*html*/`
			<picture slot="image">
				${this.renderProductMobileImage(image)}
				<img src="${MMX.encodeEntities(image.default)}">
			</picture>
		`;
	}

	renderProductMobileImage(image) {
		if (!image?.mobile?.length || image.mobile === image.default) {
			return '';
		}

		return /*html*/`
			<source class="source__mobile" media="(max-width: 640px)" srcset="${MMX.encodeEntities(image.mobile)}">
		`;
	}

	renderProductContent() {
		return /*html*/`
			<div part="product-content" class="mmx-featured-product__product-content">
				<form autocomplete="off" method="post" action="${MMX.encodeEntities(this.getBaskUrl())}">
					<input name="Action" type="hidden" value="ADPR" />
					<input name="Product_Code" type="hidden" value="${MMX.encodeEntities(this.getPropValue('product-code'))}" />
					<input name="Quantity" type="hidden" value="1" />
					${this.renderProductContentSubheading()}
					<mmx-text
						part="product-name"
						class="mmx-featured-product__product-name-text"
						data-style="${MMX.encodeEntities(this.getPropValue('product-name-style'))}"
						data-tag="${MMX.encodeEntities(this.getPropValue('product-name-tag'))}"
						${this.renderFontStyles('product-name')}
					>
						${this.product.name}
					</mmx-text>
					<div class="mmx-featured-product__pricing-discounts">
						<div class="mmx-featured-product__pricing">
							<div part="current-price" id="price-value" class="mmx-featured-product__current-price">${this.product.formatted_price}</div>
							${this.renderProductContentOriginalPricing()}
						</div>
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

		if (!subheading?.length) {
			return '';
		}

		return /*html*/`
			<mmx-text
				part="subheading"
				class="mmx-featured-product__subheading"
				data-style="${MMX.encodeEntities(this.getPropValue('subheading-style'))}"
				${this.renderFontStyles('subheading')}
			>
				${subheading}
			</mmx-text>
		`;
	}

	renderProductContentOriginalPricing() {
		if (!this.getPropValue('discount') || this.product.base_price <= this.product.price) {
			return '';
		}

		return /*html*/`
			<s part="original-price" id="price-value-additional" class="mmx-featured-product__original-price">${this.product.formatted_base_price}</s>
		`;
	}

	renderProductContentDiscounts() {
		if (!this.getPropValue('discount')) {
			return '';
		}

		return /*html*/`
			<div id="discount" class="mmx-featured-product__discounts">${this.product.discounts?.map(discount => this.renderProductContentDiscount(discount)).join('') || ''}</div>
		`;
	}

	renderProductContentDiscount(discount) {
		return /*html*/`
			<div part="discount">${discount.descrip}: ${discount.formatted_discount}</div>
		`;
	}

	renderProductContentInventoryMessage() {
		return /*html*/`
			<div part="inventory-message" id="inv-message" class="mmx-featured-product__product-inventory_message"></div>
		`;
	}

	renderProductContentAttributes() {
		if (!this.product.attributes?.length && (!this.product.subscriptionsettings?.enabled || !this.product.subscriptionterms?.length)) {
			return '';
		}

		return /*html*/`
			<div class="mmx-featured-product__product-attributes">
				${this.product.attributes.map((attribute, index) => this.renderProductContentAttribute(attribute, index + 1, null)).join('')}
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
			<div class="mmx-featured-product__product-attribute">
				<label class="mmx-featured-product__product-attribute-label ${MMX.encodeEntities(required)}" for="${MMX.encodeEntities(attribute_id)}" title="${MMX.encodeEntities(attribute.prompt)}">${attribute.prompt}</label>
				<input id="${MMX.encodeEntities(attribute_id)}" class="mmx-featured-product__product-attribute-input" data-attribute="${MMX.encodeEntities(attribute.code)}" data-option-price="${MMX.encodeEntities(attribute.price)}" data-regular-price="" type="text" name="Product_Attributes[${MMX.encodeEntities(index)}]:value" value="" placeholder="" />
			</div>
		`;
	}

	renderProductContentAttributeMemo(attribute, index, template) {
		const attribute_id	= this.buildAttributeID(attribute);
		const required		= attribute.required ? 'required' : '';

		return /*html*/`
			${this.renderProductContentAttributeCommon(attribute, index, template)}
			<div class="mmx-featured-product__product-attribute">
				<label class="mmx-featured-product__product-attribute-label ${MMX.encodeEntities(required)}" for="${MMX.encodeEntities(attribute_id)}" title="${MMX.encodeEntities(attribute.prompt)}">${attribute.prompt}</label>
				<textarea id="${MMX.encodeEntities(attribute_id)}" class="mmx-featured-product__product-attribute-textarea" data-attribute="${MMX.encodeEntities(attribute.code)}" data-option-price="${MMX.encodeEntities(attribute.price)}" data-regular-price="" name="Product_Attributes[${MMX.encodeEntities(index)}]:value" placeholder="" ${MMX.encodeEntities(required)}></textarea>
			</div>
		`;
	}

	renderProductContentAttributeRadio(attribute, index, template) {
		const required = attribute.required ? 'required' : '';

		return /*html*/`
			${this.renderProductContentAttributeCommon(attribute, index, template)}
			<div class="mmx-featured-product__product-attribute">
				<span class="mmx-featured-product__product-attribute-label ${MMX.encodeEntities(required)}" title="${MMX.encodeEntities(attribute.prompt)}">${attribute.prompt}</span>
				${attribute.options.map(option => this.renderProductContentAttributeRadioOption(attribute, index, option)).join('')}
			</div>
		`;
	}

	renderProductContentAttributeRadioOption(attribute, index, option) {
		var encoded_image_template;

		const required	= attribute.required ? 'required' : '';
		const checked	= attribute.default_id === option.id ? 'checked' : '';

		if (option.image?.length)	encoded_image_template = `<img src="${MMX.encodeEntities(option.image)}" alt="${MMX.encodeEntities(option.prompt)}" loading="lazy" />`;
		else						encoded_image_template = `${MMX.encodeEntities(option.prompt)} ${option.price ? option.formatted_price : ''}`;

		return /*html*/`
			<label class="mmx-featured-product__product-attribute-checkbox mmx-featured-product__product-attribute-checkbox__radio" title="${MMX.encodeEntities(option.prompt)}">
				<input class="mmx-featured-product__product-attribute-checkbox__input" data-attribute="${MMX.encodeEntities(attribute.code)}" data-option-price="${MMX.encodeEntities(option.price)}" data-regular-price="" type="radio" name="Product_Attributes[${MMX.encodeEntities(index)}]:value" value="${MMX.encodeEntities(option.code)}" ${MMX.encodeEntities(checked)} ${MMX.encodeEntities(required)}>
				<span class="mmx-featured-product__product-attribute-checkbox__caption">${encoded_image_template}</span>
			</label>
		`;
	}

	renderProductContentAttributeSelect(attribute, index, template) {
		const attribute_id	= this.buildAttributeID(attribute);
		const required		= attribute.required ? 'required' : '';

		return /*html*/`
			${this.renderProductContentAttributeCommon(attribute, index, template)}
			<div class="mmx-featured-product__product-attribute">
				<label class="mmx-featured-product__product-attribute-label ${MMX.encodeEntities(required)}" for="${MMX.encodeEntities(attribute_id)}" title="${MMX.encodeEntities(attribute.prompt)}">${attribute.prompt}</label>
				<div class="mmx-featured-product__product-attribute-select">
					<select id="${MMX.encodeEntities(attribute_id)}" class="mmx-featured-product__product-attribute-select__dropdown" data-attribute="${MMX.encodeEntities(attribute.code)}" name="Product_Attributes[${MMX.encodeEntities(index)}]:value" ${MMX.encodeEntities(required)}>
						${attribute.options.map(option => this.renderProductContentAttributeSelectOption(attribute, index, option)).join('')}
					</select>
				</div>
			</div>
		`;
	}

	renderProductContentAttributeSelectOption(attribute, index, option) {
		var encoded_image_template;
		const selected = attribute.default_id === option.id ? 'selected' : '';

		if (option.image?.length)	encoded_image_template = `<img src="${MMX.encodeEntities(option.image)}" alt="${MMX.encodeEntities(option.prompt)}" loading="lazy" />`;
		else						encoded_image_template = `${MMX.encodeEntities(option.prompt)} ${option.price ? option.formatted_price : ''}`;

		return /*html*/`
			<option value="${MMX.encodeEntities(option.code)}" data-option-price="${MMX.encodeEntities(option.price)}" data-regular-price="" ${selected}>
				${MMX.encodeEntities(option.prompt)} ${option.price ? option.formatted_price : ''}
			</option>
		`;
	}

	renderProductContentAttributeSwatchSelect(attribute, index, template) {
		const attribute_id	= this.buildAttributeID(attribute);
		const required		= attribute.required ? 'required' : '';

		return /*html*/`
			${this.renderProductContentAttributeCommon(attribute, index, template)}
			<div class="mmx-featured-product__product-attribute">
				<label class="mmx-featured-product__product-attribute-label ${MMX.encodeEntities(required)}" for="${MMX.encodeEntities(attribute_id)}" title="${MMX.encodeEntities(attribute.prompt)}">${attribute.prompt}:&nbsp;<span data-hook="attribute-swatch-name"></span></label>
				<div class="mmx-featured-product__product-attribute-select mmx-featured-product__product-attribute-select__swatch">
					<select class="mmx-featured-product__product-attribute-select__dropdown" aria-labelledby="${MMX.encodeEntities(attribute_id)}" data-attribute="${MMX.encodeEntities(attribute.code)}" data-hook="attribute-swatch-select" name="Product_Attributes[${MMX.encodeEntities(index)}]:value" ${MMX.encodeEntities(required)}>
						${attribute.options.map(option => this.renderProductContentAttributeSwatchSelectOption(attribute, index, option)).join('')}
					</select>
				</div>
				<div id="swatches" class="mmx-featured-product__product-attribute-swatch__swatches" aria-labelledby="${MMX.encodeEntities(attribute_id)}" role="group"></div>
			</div>
		`;
	}

	renderProductContentAttributeSwatchSelectOption(attribute, index, option) {
		var encoded_image_template;
		const selected = attribute.default_id === option.id ? 'selected' : '';

		if (option.image?.length)	encoded_image_template = `<img src="${MMX.encodeEntities(option.image)}" alt="${MMX.encodeEntities(option.prompt)}" loading="lazy" />`;
		else						encoded_image_template = `${MMX.encodeEntities(option.prompt)} ${option.price ? option.formatted_price : ''}`;

		return /*html*/`
			<option value="${MMX.encodeEntities(option.code)}" data-option-price="${MMX.encodeEntities(option.price)}" data-regular-price="" ${selected}>
				${MMX.encodeEntities(option.prompt)} ${option.price ? option.formatted_price : ''}
			</option>
		`;
	}

	renderProductContentAttributeCheckbox(attribute, index, template) {
		var encoded_image_template;
		const required = attribute.required ? 'required' : '';

		if (attribute.image?.length)	encoded_image_template = `<img src="${MMX.encodeEntities(attribute.image)}" alt="${MMX.encodeEntities(attribute.prompt)}" loading="lazy" />`;
		else							encoded_image_template = `${attribute.prompt} ${attribute.price ? attribute.formatted_price : ''}`;

		return /*html*/`
			${this.renderProductContentAttributeCommon(attribute, index, template)}
			<div class="mmx-featured-product__product-attribute">
				<label class="mmx-featured-product__product-attribute-checkbox" title="${MMX.encodeEntities(attribute.prompt)}">
					<input class="mmx-featured-product__product-attribute-checkbox__input" data-attribute="${MMX.encodeEntities(attribute.code)}" data-option-price="${MMX.encodeEntities(attribute.price)}" data-regular-price="" type="checkbox" name="Product_Attributes[${MMX.encodeEntities(index)}]:value" ${MMX.encodeEntities(required)}>
					<span class="mmx-featured-product__product-attribute-checkbox__caption">${encoded_image_template}</span>
				</label>
			</div>
		`;
	}

	renderProductContentAttributeTemplate(attribute, index) {
		return /*html*/`
			${attribute.attributes?.map((template_attribute, template_attribute_index) => this.renderProductContentAttribute(template_attribute, index + template_attribute_index, attribute)).join('')}
		`
	}

	renderProductContentAttributeSubscription() {
		if (!this.product.subscriptionsettings?.enabled || !this.product.subscriptionterms?.length) {
			return '';
		}

		const required = this.product.subscriptionsettings.mandatory ? 'required' : '';

		if (this.product.subscriptionsettings.mandatory) {
			return /*html*/`
				<label class="mmx-featured-product__product-attribute-label ${MMX.encodeEntities(required)}" for="l-subscription" title="Subscribe">Select Subscription</label>
				<div class="mmx-featured-product__product-attribute-select">
					<select id="l-subscription" class="mmx-featured-product__product-attribute-select__dropdown" name="Product_Subscription_Term_ID" ${MMX.encodeEntities(required)}>
						${this.product.subscriptionterms.map(term => this.renderProductContentAttributeSubscriptionOption(term)).join('')}
					</select>
				</div>
			`;
		}

		return /*html*/`
			<label class="mmx-featured-product__product-attribute-label ${MMX.encodeEntities(required)}" for="l-subscription" title="Subscribe">Select Subscription</label>
			<div class="mmx-featured-product__product-attribute-select">
				<select id="l-subscription" class="mmx-featured-product__product-attribute-select__dropdown" name="Product_Subscription_Term_ID" ${MMX.encodeEntities(required)}>
					<option value="0">One Time Purchase</option>
					${this.product.subscriptionterms.map(term => this.renderProductContentAttributeSubscriptionOption(term)).join('')}
				</select>
			</div>
		`;
	}

	renderProductContentAttributeSubscriptionOption(term) {
		return /*html*/`
			<option value="${MMX.encodeEntities(term.id)}">${MMX.encodeEntities(term.descrip)}</option>
		`;
	}

	renderProductContentDescription() {
		var description, max_chars;

		max_chars		= 0;
		description 	= this.product.descrip;

		if (this.getPropValue('overwrite-description')) {
			max_chars	= 600
			description	= this.getPropValue('description') ?? '';
		}

		return /*html*/`
			<mmx-text
				part="product-description"
				class="mmx-featured-product__product-description"
				data-max-chars="${MMX.encodeEntities(max_chars)}"
				data-trim-suffix="..."
				data-style="${MMX.encodeEntities(this.getPropValue('description-style'))}"
				${this.renderFontStyles('description')}
			>
				${description}
			</mmx-text>
		`;
	}

	renderProductContentAddToCartButton() {
		const button = this.getPropValue('button');

		if (!button) {
			return '';
		}

		return /*html*/`
			<div class="mmx-featured-product__product-add-to-cart">
				<mmx-button
					part="button"
					data-type="submit"
					data-style="${MMX.encodeEntities(this.getPropValue('button-style'))}"
					data-size="${MMX.encodeEntities(this.getPropValue('button-size'))}"
					data-width="full"
				>
					${MMX.encodeEntities(button)}
				</mmx-button>
			</div>
		`;
	}

	renderFontStyles(prefix) {
		var encoded_name_styles = new Array();

		if (this.getPropValue(`${prefix}-font-family`) !== null)	encoded_name_styles.push(`font-family: ${MMX.encodeEntities(this.getPropValue(`${prefix}-font-family`))};`);
		if (this.getPropValue(`${prefix}-font-size`) !== null)		encoded_name_styles.push(`font-size: ${MMX.encodeEntities(this.getPropValue(`${prefix}-font-size`))}px;`);
		if (this.getPropValue(`${prefix}-font-weight`) !== null)	encoded_name_styles.push(`font-weight: ${MMX.encodeEntities(this.getPropValue(`${prefix}-font-weight`))};`);
		if (this.getPropValue(`${prefix}-font-color`) !== null)		encoded_name_styles.push(`color: ${MMX.encodeEntities(this.getPropValue(`${prefix}-font-color`))};`);

		if (!encoded_name_styles.length) {
			return '';
		}

		return /*html*/`style="${encoded_name_styles.join('')}"`;
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
	// Attribute Machine
	//

	initializeAttributeMachine() {
		const self = this;
		var discount, product_data, attributemachine;

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
			invalid_msg:					'',
			missing_text_msg:				'',
			missing_radio_msg:				'',

			getElementById:					(id) => this.shadowRoot.getElementById(id),
			getElementsByTagName:			(tagName) => this.shadowRoot.querySelector('.mmx-featured-product').getElementsByTagName(tagName)
		};

		attributemachine = new AttributeMachine(product_data);

		this.initializeAttributeMachine_OverwriteGenerateDiscount(attributemachine)
		this.initializeAttributeMachine_OverwriteGenerateSwatch(attributemachine)
		this.initializeAttributeMachine_OverwriteSwatchClick(attributemachine)
		this.initializeAttributeMachine_OverwriteEnableDisablePurchaseButtons(attributemachine)

		attributemachine.Initialize(null, null);
	}

	initializeAttributeMachine_OverwriteGenerateDiscount(attributemachine) {
		const self = this;

		attributemachine.Generate_Discount = function(discount) {
			var discount_div;

			discount_div			= document.createElement( 'div' );
			discount_div.innerHTML	= discount.descrip + ': ' + discount.formatted_discount;

			return discount_div;
		}
	}

	initializeAttributeMachine_OverwriteGenerateSwatch(attributemachine) {
		const self = this;

		attributemachine.Generate_Swatch = function(product_code, attribute, option) {
			var img, swatch, swatch_button, swatch_container;

			swatch_container	= self.shadowRoot.getElementById('swatches');

			img					= document.createElement('img');
			img.src				= option.image;
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
				var swatch_select, swatch_list_element, swatch_name_element;

				if (swatch_container) {
					if (!(swatch_select = self.shadowRoot.querySelector('[data-hook="attribute-swatch-select"]'))) {
						return;
					}

					if (swatch_name_element = self.shadowRoot.querySelector('[data-hook="attribute-swatch-name"]')) {
						swatch_name_element.textContent = swatch_select.options[swatch_select.selectedIndex].text;
					}

					if (swatch_list_element = swatch_container.querySelector('ul')) {
						swatch_list_element.removeAttribute('style');
						swatch_list_element.classList.add('o-list-inline');
						swatch_list_element.querySelectorAll('li').forEach(function(swatch_element) {
							var swatch_color, element_swatch_image;

							element_swatch_image	= swatch_element.querySelector('button');
							swatch_color			= swatch_element.getAttribute('data-code');

							if (element_swatch_image && swatch_color === swatch_select.options[swatch_select.selectedIndex].value) {
								element_swatch_image.classList.add('mmx-featured-product__product-attribute-swatch__swatches--active');
							}
						});
					}
				}
			}, 0);

			return swatch;
		};
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
			if (button = self.getButton()) {
				button.disabled = true;
			}
		};

		attributemachine.Enable_Purchase_Buttons = function() {
			if (button = self.getButton()) {
				button.disabled = false;
			}
		};
	}

	//
	// Image Manager
	//

	initializeImageManager() {
		const self = this;

		MivaEvents?.SubscribeToEvent?.('variant_changed', (product_data) => {
			if (product_data.product_code === this.getPropValue('product-code')) {
				this.imageManagerUpdateVariant(product_data.variant_id);
			}
		});
	}

	imageManagerUpdateVariant(variant_id) {
		if (this.variant_id === variant_id) {
			return;
		}

		MMX.Runtime_JSON_API_Call({
			params: {
				function:		'Runtime_ProductImageList_Load_Product_Variant',
				Product_Code:	this.getPropValue('product-code'),
				Variant_ID:		variant_id,
				Image_Sizes:	[this.getPropValue('desktop-image-size'), this.getPropValue('mobile-image-size')]
			},
			callback: (response) => {
				if (!response.success) {
					return;
				}

				this.variant_id = variant_id;
				this.onInitializeImageManager(response.data);
			}
		});
	}

	onInitializeImageManager(images) {
		var i, i_len, image, index, template, image_type, picture_dom, product_image, elementlist_hero, element_hero_slider;

		this.images = new Array();

		image_type = this.getPropValue('image-type');

		if (!images?.length) {
			product_image			= new Object();
			product_image.mobile	= this.getPropValue('fallback-product-image-mobile');
			product_image.default	= this.getPropValue('fallback-product-image-default') || product_image.mobile;

			this.images.push(product_image);
		}
		else {
			if (image_type?.length && (index = images.findIndex(image => image.type_code === image_type)) !== -1) {
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
		// Avoid reflow of the mmx-hero-slider/mmx-hero by replacing just the picture tag when a
		// slide already exists, inserting a new one if we have more new images, or removing if
		// we have leftover old images. This ensures the selection state remains consistent.
		//

		if (element_hero_slider = this.shadowRoot.querySelector('mmx-hero-slider')) {
			elementlist_hero = element_hero_slider.querySelectorAll('mmx-hero');

			for ([index, image] of this.images.entries()) {
				if (elementlist_hero[index]) {
					elementlist_hero[index].innerHTML = this.renderProductImagePictureTag(image);
				}
				else {
					template			= document.createElement('template');
					template.innerHTML	= this.renderProductImage(image);

					element_hero_slider.appendChild(template.content.cloneNode(true));
				}
			}

			for (i = index + 1, i_len = elementlist_hero.length; i < i_len; i++) {
				elementlist_hero[ i ].remove();
			}

			return;
		}

		this.forceUpdate();
	}

	onDataChange() {
		this.product	= null;
		this.images		= null;

		this.setSpacing(this.data?.advanced?.spacing);

		MMX.setElementAttributes(this, {
			'data-image-position': this.data?.layout?.image_position?.value,
			'data-image-type': this.data?.advanced?.product?.image_type?.value,
			'data-image-fit': this.data?.advanced?.product?.image_fit?.value,
			'data-multiple-images': this.data?.advanced?.product?.multiple_images?.value,
			'data-discount': this.data?.advanced?.product?.discount?.value,
			'data-product-code': this.data?.product?.product?.product_code,
			'data-product-name-style': this.data?.text?.product_name?.product_name_style?.value,
			'data-product-name-tag': this.data?.advanced?.product?.product_name_tag?.value,
			'data-product-name-font-family': this.data?.text?.product_name?.font_family?.value,
			'data-product-name-font-size': this.data?.text?.product_name?.font_size?.value,
			'data-product-name-font-weight': this.data?.text?.product_name?.font_weight?.value,
			'data-product-name-font-color': this.data?.text?.product_name?.font_color?.value,
			'data-subheading': this.data?.text?.subheading?.text?.value,
			'data-subheading-style': this.data?.text?.subheading?.text?.textsettings?.fields?.normal?.subheading_style?.value,
			'data-subheading-font-family': this.data?.text?.subheading?.text?.textsettings?.fields?.normal?.font_family?.value,
			'data-subheading-font-size': this.data?.text?.subheading?.text?.textsettings?.fields?.normal?.font_size?.value,
			'data-subheading-font-weight': this.data?.text?.subheading?.text?.textsettings?.fields?.normal?.font_weight?.value,
			'data-subheading-font-color': this.data?.text?.subheading?.text?.textsettings?.fields?.normal?.font_color?.value,
			'data-overwrite-description': this.data?.text?.description?.overwritten_description?.settings?.enabled,
			'data-description': this.data?.text?.description?.overwritten_description?.settings?.enabled ? (this.data?.text?.description?.overwritten_description?.text?.value || '') : undefined,
			'data-description-style': this.data?.text?.description?.description_style?.value,
			'data-description-font-family': this.data?.text?.description?.font_family?.value,
			'data-description-font-size': this.data?.text?.description?.font_size?.value,
			'data-description-font-weight': this.data?.text?.description?.font_weight?.value,
			'data-description-font-color': this.data?.text?.description?.font_color?.value,
			'data-button': this.data?.advanced?.product?.button?.settings?.enabled ? this.data?.advanced?.product?.button?.button_text?.value : undefined,
			'data-button-style': this.data?.advanced?.product?.button?.settings?.enabled ? this.data?.advanced?.product?.button?.button_text?.textsettings?.fields?.normal?.button_style?.value : undefined,
			'data-button-size': this.data?.advanced?.product?.button?.settings?.enabled ? this.data?.advanced?.product?.button?.button_text?.textsettings?.fields?.normal?.button_size?.value : undefined,
			'data-fallback-product-image-default': this.data?.fallback_product_image_default,
			'data-fallback-product-image-mobile': this.data?.fallback_product_image_mobile
		});
	}
}

if (!customElements.get('mmx-featured-product')) {
	customElements.define('mmx-featured-product', MMX_FeaturedProduct);
}
