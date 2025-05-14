/**
 * MMX / CARD
 */
class MMX_Card extends MMX_Element {

	static get props() {
		return {
			href: {
				allowAny: true
			},
			target: {
				allowAny: true
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-card'];
	renderUniquely = true;

	constructor() {
		super();
		this.makeShadow();
	}

	render() {
		return /*html*/`
			<a
				part="wrapper"
				class="mmx-card"
				${this.#renderHref()}
				${this.#renderTarget()}
			>
				<slot name="flag" part="flag" class="mmx-card__flag"></slot>
				<slot name="header" part="header" class="mmx-card__header"></slot>
				<slot name="main" part="main" class="mmx-card__main"></slot>
				<slot name="footer" part="footer" class="mmx-card__footer"></slot>
			</a>
		`;
	}

	#renderHref() {
		const href = this.getPropValue('href');
		return typeof href === 'string' ? `href="${MMX.encodeEntities(href)}"` : '';
	}

	#renderTarget() {
		const target = this.getPropValue('target');
		return typeof target === 'string' ? `target="${MMX.encodeEntities(target)}"` : '';
	}
}

if (!customElements.get('mmx-card')) {
	customElements.define('mmx-card', MMX_Card);
}

/**
 * MMX / PRODUCT CARD
 */
class MMX_ProductCard extends MMX_Card {

	static get props() {
		return MMX.assign(MMX_ProductCard.productCardProps, MMX_Card.props);
	}

	static productCardProps = {
		'fallback-image': {
			allowAny: true,
			default: 'graphics/en-US/cssui/blank.gif'
		},
		'adpr-url': {
			allowAny: true,
			default:  MMX.longMerchantUrl({Screen: 'BASK'})
		},
		'atwl-url': {
			allowAny: true,
			default:  MMX.longMerchantUrl({Screen: 'WISH'})
		},
		'show-image': {
			isBoolean: true,
			default: true
		},
		'image-type': {
			allowAny: true,
			default: 'main'
		},
		'image-dimensions': {
			allowAny: true,
			default: '350x350'
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
		}
	};

	styleResourceCodes = ['mmx-base', 'mmx-text', 'mmx-card'];
	renderUniquely = true;

	#product;
	#details = [
		{
			type: { value: 'name' }
		},
		{
			type: { value: 'price' },
			price: {
				displayed: {
					value: 'sale'
				},
				additional: {
					value: 'base'
				}
			}
		},
	];

	constructor() {
		super();
	}

	static create({product, details, ...options}) {
		return MMX.createElement({
			type: 'mmx-product-card',
			data: {
				product,
				details
			},
			...options
		});
	}

	onDataChange() {
		this.#product = this.data?.product ?? this.#product;
		this.#details = this.data?.details ?? this.#details;
	}

	render() {
		if (!this.#product) {
			return '';
		}

		return /*html*/`
			<mmx-card
				part="wrapper"
				exportparts="card-wrapper card-flag card-header card-main card-footer"
				data-href="${MMX.encodeEntities(this.getPropValue('href') ?? this.#product?.url)}"
				data-target="${MMX.encodeEntities(this.getPropValue('target'))}"
			>
				${this.#renderImage()}
				${this.#details?.map?.(detail => this.#renderProductDetail(detail)).join('')}
			</mmx-card>
		`;
	}

	#renderProductDetail(detail) {
		const type = detail?.type?.value;

		if (type === 'price') {
			return this.#renderPrice(detail);
		}

		if (['button__view-product', 'button__add-to-cart', 'button__add-to-wishlist'].includes(type)) {
			return this.#renderButton(detail);
		}

		if (type === 'customfield') {
			return this.#renderCustomField(detail);
		}

		if (type === 'fragment') {
			return this.#renderFragmentDetail(detail);
		}

		if (type === 'discounts') {
			return this.#renderDiscounts(detail);
		}

		if (type === 'inv_available') {
			return this.#renderInventoryAvailable(detail);
		}

		if (type === 'weight') {
			return this.#renderWeight(detail);
		}

		return this.#renderCoreDetail(detail);
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
	#renderTextDetail({value, detail} = {}) {
		const prefix = detail?.prefix?.value;
		const suffix = detail?.suffix?.value;

		if (MMX.valueIsEmpty(value)) {
			return this.#renderEmptyDetail();
		}

		const theme_available = detail?.text_styles?.typography_theme?.theme_available ?? false;

		return /*html*/`
			<mmx-text
				slot="main"
				part="detail ${MMX.encodeEntities(detail?.type?.value)}"
				data-theme="${MMX.encodeEntities(theme_available)}"
				data-theme-class="${MMX.encodeEntities(detail?.text_styles?.typography_theme?.classname ?? '')}"
				data-style="${MMX.encodeEntities(detail?.text_styles?.style?.value)}"
			>
				${this.renderLegacyStylesTemplate(theme_available, this.getStylesFromGroup(detail?.text_styles))}
				${this.renderThemeStylesheetTemplate(theme_available)}
				${this.#renderProductDetailSpan('prefix', prefix)}
				${MMX.encodeEntities(value)}
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

	// Render: Empty Detail (keeps index-based preview_property_selectors working)
	#renderEmptyDetail() {
		return /*html*/`<div slot="main" part="detail empty" class="mmx-product-card__detail--empty"></div>`;
	}

	// Render: Image
	#renderImage() {
		if (!this.getPropValue('show-image')) {
			return '';
		}

		const type = this.getPropValue('image-type');
		const fit = this.getPropValue('image-fit');
		const dimensions = this.getPropValue('image-dimensions');
		const [width, height] = dimensions?.split?.('x') ?? [1, 1];

		const image = this.#product?.imagetypes?.[type];
		const resizedImage = image?.sizes?.[dimensions] ?? image?.sizes?.original ?? {
			url: this.getPropValue('fallback-image'),
			height: '',
			width: ''
		};

		if (typeof resizedImage?.url !== 'string') {
			return '';
		}

		return /*html*/`
			<img
				slot="main"
				part="image"
				src="${MMX.encodeEntities(resizedImage.url)}"
				alt=""
				style="
					object-fit: ${MMX.encodeEntities(fit)};
					aspect-ratio: ${MMX.encodeEntities(width + ' / ' + height)};
				"
			>
		`;
	}

	// Render: Price
	#renderPrice(detail = {}) {
		// Price Display
		this.#product.price_display = this.#product.formatted_sale_price;
		if (detail.price?.displayed?.value === 'base'){
			this.#product.price_display = this.#product.formatted_base_price;
		}
		else if (detail.price?.displayed?.value === 'retail'){
			this.#product.price_display = this.#product.formatted_retail;
		}

		// Additional Price Display
		this.#product.additional_price_display = '';
		if (detail.price?.additional?.value === 'base'){
			this.#product.additional_price_display = this.#product.formatted_base_price;
		}
		else if (detail.price?.additional?.value === 'retail'){
			this.#product.additional_price_display = this.#product.formatted_retail;
		}

		const displayed_theme_available = detail?.price_text_styles?.displayed?.typography_theme?.theme_available ?? false;
		const additional_theme_available = detail?.price_text_styles?.additional?.typography_theme?.theme_available ?? false;

		return /*html*/`
		<div
			slot="main"
			part="detail prices"
			class="mmx-product-card__prices"
			style="text-align: ${detail?.price_text_styles?.text_align?.value ?? ''}"
		>
			<mmx-text
				part="price"
				class="mmx-product-card__price"
				data-theme="${MMX.encodeEntities(displayed_theme_available)}"
				data-theme-class="${MMX.encodeEntities(detail?.price_text_styles?.displayed?.typography_theme?.classname ?? '')}"
				data-style="${MMX.encodeEntities(detail?.price_text_styles?.displayed?.style?.value || 'product-price')}"
			>
				${this.renderLegacyStylesTemplate(displayed_theme_available, this.getStylesFromGroup(detail?.price_text_styles?.displayed))}
				${this.renderThemeStylesheetTemplate(displayed_theme_available)}
				${this.#product.price_display}
			</mmx-text>
			${this.#product.additional_price_display.length && this.#product.additional_price_display !== this.#product.price_display ? /*html*/`
				<mmx-text
					part="additional-price"
					class="mmx-product-card__additional-price"
					data-theme="${MMX.encodeEntities(additional_theme_available)}"
					data-theme-class="${MMX.encodeEntities(detail?.price_text_styles?.additional?.typography_theme?.classname ?? '')}"
					data-style="${MMX.encodeEntities(detail?.price_text_styles?.additional?.style?.value || 'product-additional-price')}"
				>
					${this.renderLegacyStylesTemplate(additional_theme_available, this.getStylesFromGroup(detail?.price_text_styles?.additional))}
					${this.renderThemeStylesheetTemplate(additional_theme_available)}
					${this.#product.additional_price_display}
				</mmx-text>
			` : ''}
		</div>
		`;
	}

	// Render: Button
	#renderButton(detail = {}) {
		const type = detail?.type?.value ?? 'button__view-product';

		let link;
		let text = detail.button?.text?.value;

		if (type === 'button__add-to-cart') {
			link = this.#addActionToUrl({
				url: detail?.ADPR_url?.url ?? this.getPropValue('adpr-url'),
				action: 'ADPR',
				product: this.#product
			});
			text = MMX.valueIsEmpty(text) ? 'Add to Cart' : text;
		} else if (type === 'button__add-to-wishlist') {
			link = this.#addActionToUrl({
				url: detail?.ATWL_url?.url ?? this.getPropValue('atwl-url'),
				action: 'ATWL',
				product: this.#product
			});
			text = MMX.valueIsEmpty(text) ? 'Add to Wishlist' : text;
		} else {
			link = this.#product.url;
			text = MMX.valueIsEmpty(text) ? 'View Details' : text;
		}

		const theme_available = detail.button?.text?.textsettings?.fields?.normal?.button_theme?.theme_available || false;

		return /*html*/`
			<mmx-button
				slot="main"
				part="detail button button-${MMX.encodeEntities(type)}"
				exportparts="button: button-wrapper"
				href="${MMX.encodeEntities(link)}"
				data-style="${detail.button?.text?.textsettings?.fields?.normal?.button_style?.value || 'display-link'}"
				data-size="${detail.button?.text?.textsettings?.fields?.normal?.button_size?.value || 'm'}"
				data-theme="${theme_available}"
				data-theme-class="${MMX.encodeEntities(detail.button?.text?.textsettings?.fields?.normal?.button_theme?.classname ?? '')}"
				data-width="${!theme_available ? 'full' : MMX.encodeEntities(detail.button?.text?.textsettings?.fields?.normal?.button_width?.value ?? 'auto')}"
			>
				${this.renderThemeStylesheetTemplate(theme_available)}
				${MMX.encodeEntities(text)}
			</mmx-button>`;
	}

	#addActionToUrl({url, action = 'ADPR', quantity = 1}) {
		let actionUrl = new URL(url, document.baseURI);

		actionUrl.searchParams.append('Action', action);
		actionUrl.searchParams.append('Product_Code', this.#product.code);
		actionUrl.searchParams.append('Quantity', quantity);

		return actionUrl.toString();
	}

	// Render: Custom Field
	#renderCustomField(detail = {}) {
		const customFieldParts = detail?.customfield?.value?.split?.(':');

		if (customFieldParts?.length !== 2) {
			return this.#renderEmptyDetail();
		}

		const [moduleCode, fieldCode] = customFieldParts;
		const value = this.#product?.CustomField_Values?.[moduleCode]?.[fieldCode];
		return this.#renderTextDetail({
			value,
			detail
		});
	}

	// Render: Fragment
	#renderFragmentDetail(detail = {}) {
		const fragmentCode = detail?.fragment?.value;
		const fragmentContent = this.renderProductFragment({
			product: this.#product,
			fragmentCode
		});

		if (MMX.valueIsEmpty(fragmentContent)){
			return this.#renderEmptyDetail();
		}

		let classname = '';
		const theme_available = detail?.text_styles?.typography_theme?.theme_available ?? false;

		if (!theme_available) {
			classname = `class="type-${MMX.encodeEntities(detail?.text_styles?.style?.value)}"`;
		}

		return /*html*/`
			<mmx-text
				slot="main"
				part="detail fragment fragment__${MMX.encodeEntities(fragmentCode)}"
				${classname}
				data-hide-on-empty="false"
				data-theme="${MMX.encodeEntities(theme_available)}"
				data-theme-class="${MMX.encodeEntities(detail?.text_styles?.typography_theme?.classname ?? '')}"
				data-style="${MMX.encodeEntities(detail?.text_styles?.style?.value)}"
			>
				${this.renderLegacyStylesTemplate(theme_available, this.getStylesFromGroup(detail?.text_styles))}
				${this.renderThemeStylesheetTemplate(theme_available)}
				${fragmentContent}
			</mmx-text>
		`;
	}

	// Render: Discounts
	#renderDiscounts(detail) {
		if (!Array.isArray(this.#product.discounts) || !this.#product.discounts.length) {
			return this.#renderEmptyDetail();
		}

		return /*html*/`
			<div
				slot="main"
				part="detail discounts"
			>
				${this.#product.discounts.map(discount => this.#renderDiscount({discount, detail})).join('')}
			</div>
		`;
	}

	#renderDiscount({discount = {}, detail = {}} = {}) {
		if (typeof discount?.descrip !== 'string') {
			return '';
		}

		let classname = '';
		const theme_available = detail?.text_styles?.typography_theme?.theme_available ?? false;

		if (!theme_available) {
			classname = `class="type-${MMX.encodeEntities(detail?.text_styles?.style?.value)}"`;
		}

		return /*html*/`
			<mmx-text
				part="discount"
				${classname}
				data-theme="${MMX.encodeEntities(theme_available)}"
				data-theme-class="${MMX.encodeEntities(detail?.text_styles?.typography_theme?.classname ?? '')}"
				data-style="${MMX.encodeEntities(detail?.text_styles?.style?.value)}"
			>
				${this.renderLegacyStylesTemplate(theme_available, this.getStylesFromGroup(detail?.text_styles))}
				${this.renderThemeStylesheetTemplate(theme_available)}
				${discount.descrip}: ${discount.formatted_discount}
			</mmx-text>
		`;
	}

	// Render: Inventory Available
	#renderInventoryAvailable(detail = {}) {
		if (!this.#product?.inv_active) {
			return this.#renderEmptyDetail();
		}

		return this.#renderTextDetail({
			value: this.#product?.inv_available,
			detail
		});
	}

	// Render: Weight
	#renderWeight(detail = {}) {
		return this.#renderTextDetail({
			value: this.#product?.formatted_weight,
			detail
		});
	}
}

if (!customElements.get('mmx-product-card')) {
	customElements.define('mmx-product-card', MMX_ProductCard);
}