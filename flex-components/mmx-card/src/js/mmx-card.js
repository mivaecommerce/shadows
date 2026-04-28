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
				${this.inheritAttrs()}
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

	getCustomFieldValueFromRecord(customField = '', record = {}) {
		return MMX.getCustomFieldValueFromRecord(customField, record);
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
	#card;
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

	static create({product, card, details, ...options} = {}) {
		return MMX.createElement({
			type: 'mmx-product-card',
			data: {
				product,
				card,
				details
			},
			...options
		});
	}

	#swatchAttribute = {};

	onDataChange() {
		this.#product = this.data?.product ?? this.#product;
		this.#card = this.data?.card ?? this.#card;
		this.#details = this.data?.details ?? this.#card?.details?.children ?? this.#details;
		this.#swatchAttribute = this.#getSwatchAttribute();
	}

	render() {
		if (!this.#product) {
			return '';
		}

		return /*html*/`
			<mmx-card
				part="wrapper"
				exportparts="wrapper:card-wrapper, flag:card-flag, header:card-header, main:card-main, footer:card-footer"
				data-href="${MMX.encodeEntities(this.getPropValue('href') ?? this.#product?.url)}"
				data-target="${MMX.encodeEntities(this.getPropValue('target'))}"
			>
				${this.#renderImage()}
				${this.#details?.map?.(detail => this.#renderProductDetail(detail)).join('')}
				${this.#renderAddToWishlist()}
			</mmx-card>
		`;
	}

	afterRender() {
		this.#bindEvents();
	}

	#bindEvents() {
		this.#listenForSwatchButtonInteractions();
		this.#listenForHover();
	}

	#listenForHover() {
		if (!this.#isHoverEnabled()) {
			return;
		}

		const imageContainer = '[part~="image-container"]';

		this.on('mouseover, touchstart', imageContainer, () => {
			this.#setHovered(true);
		});

		this.on('mouseout, touchend, touchcancel', imageContainer, () => {
			this.#setHovered(false);
		});

		this.#maintainHoverImageOnDrag();
	}

	#isHoverEnabled() {
		const mainImage = this.#getProductResizedImage();

		return !!this.#getHoverImage(mainImage)?.url;
	}

	#setHovered(isHovered) {
		this.classList.toggle('mmx-product-card__is-hovered', isHovered);

		if (isHovered) {
			this.#loadHoverImage();
		}
	}

	#maintainHoverImageOnDrag() {
		this.style.touchAction = 'none';

		const card = this.shadowRoot?.querySelector?.('mmx-card');

		if (card) {
			card.style.touchAction = 'none';
		}
	}

	#renderProductDetail(detail) {
		const type = detail?.type?.value;

		if (type === 'price') {
			return this.#renderPrice(detail);
		}

		if (type === 'rating') {
			return this.#renderRating(detail);
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
				data-align="${MMX.encodeEntities(detail?.text_styles?.text_align?.value)}"
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
		return /*html*/`
			<div slot="main" part="detail empty" class="mmx-product-card__detail--empty"></div>
		`;
	}

	// Render: Rating
	#renderRating(detail = {}) {
		const rating = this.getCustomFieldValueFromRecord(detail?.rating_settings?.rating_custom_field?.value, this.#product);
		const count  = this.getCustomFieldValueFromRecord(detail?.rating_settings?.count_custom_field?.value, this.#product);
		const iconSet = detail?.rating_settings?.icon?.value;
		const maxRating = detail?.rating_settings?.max_rating?.value;
		const activeColor = detail?.rating_settings?.active_color?.value;
		const inactiveColor = detail?.rating_settings?.inactive_color?.value;
		const textAlign = detail?.rating_settings?.align?.value;

		return /*html*/`
			<div
				slot="main"
				part="detail reviews-rating"
				class="mmx-product-card__reviews-rating"
				style="${textAlign ? `text-align: ${MMX.encodeEntities(textAlign)};` : ''}"
			>
				<mmx-rating
					data-rating="${MMX.encodeEntities(rating)}"
					data-count="${MMX.encodeEntities(count)}"
					data-max-rating="${MMX.encodeEntities(maxRating)}"
					data-icon-set="${MMX.encodeEntities(iconSet)}"
					data-active-color="${MMX.encodeEntities(activeColor)}"
					data-inactive-color="${MMX.encodeEntities(inactiveColor)}"
				></mmx-rating>
			</div>
		`;
	}

	// Render: Image
	#renderImage() {
		if (!this.getPropValue('show-image')) {
			return '';
		}

		const mainImage = this.#getProductResizedImage();

  		if (typeof mainImage?.url !== 'string') {
			return '';
		}

		const hoverImage = this.#getHoverImage(mainImage);

		return /*html*/`
			<div
				slot="main"
				part="image-container"
				class="mmx-product-card__image-container ${this.#getHoverTransitionClass()}"
				style="${this.#getImageContainerStyle()}"
			>
				<img
					slot="main"
					part="image main-image"
					src="${MMX.encodeEntitiesURI(mainImage.url)}"
					alt=""
				>
				${hoverImage?.url ? /*html*/`
					<img
						part="image hover-image"
						data-src="${MMX.encodeEntitiesURI(hoverImage.url)}"
						alt=""
					>
				` : ''}
			</div>
			${this.#renderAttributeSwatches()}
		`;
	}

	#getHoverImage(mainImage) {
		const hoverType = this.#card?.image?.hover_image?.type?.value;

		if (MMX.valueIsEmpty(hoverType)) {
			return undefined;
		}

		const imageType = this.#product?.imagetypes?.[hoverType];
		const dimensions = this.getPropValue('image-dimensions');

		const hasImage = imageType?.sizes?.[dimensions]?.url || imageType?.sizes?.original?.url;

		if (!hasImage) {
			return undefined;
		}

		const hoverImage = this.#getProductResizedImage(hoverType);

		if (hoverImage?.url && hoverImage.url === mainImage?.url) {
			return undefined;
		}

		return hoverImage;
	}

	#getHoverTransitionClass() {
		const transition = (this.#card?.image?.hover_image?.transition?.value ?? 'swap').toLowerCase();

		return transition === 'fade' ? 'mmx-product-card__hover--fade' : '';
	}

	#getImageContainerStyle() {
		const fit = this.getPropValue('image-fit');
		const dimensions = this.getPropValue('image-dimensions');
		const [width, height] = dimensions?.split?.('x') ?? [1, 1];

		return `
			--mmx-card__object-fit: ${MMX.encodeEntities(fit)};
			--mmx-card__aspect-ratio: ${MMX.encodeEntities(`${width} / ${height}`)};
		`.trim();
	}

	#loadHoverImage() {
		const hoverImg = this.#hoverImage();

		if (!hoverImg) {
			return;
		}

		if (hoverImg.getAttribute('src')) {
			return;
		}

		const dataSrc = hoverImg.getAttribute('data-src');

		if (!dataSrc) {
			return;
		}

		hoverImg.setAttribute('src', dataSrc);
		hoverImg.removeAttribute('data-src');
	}

	#getProductResizedImage(type = this.getPropValue('image-type')) {
		const dimensions = this.getPropValue('image-dimensions');

		const image = this.#product?.imagetypes?.[type];
		return image?.sizes?.[dimensions] ?? image?.sizes?.original ?? {
			url: this.getPropValue('fallback-image'),
			height: '',
			width: ''
		};
	}

	// Attribute Swatches
	#renderAttributeSwatches() {
		if (!this.#swatchAttribute) {
			return '';
		}

		return /*html*/`
			<div
				slot="main"
				part="attribute-swatches"
				class="mmx-product-card__attribute-swatches"
				data-avoid-navigation="true"
			>
				${this.#swatchAttribute?.options?.map(this.#renderAttributeSwatch.bind(this)).join('')}
				${this.#renderMoreSwatches()}
			</div>
			${this.#renderAttributeSwatchStyles()}
		`;
	}

	#renderAttributeSwatchStyles() {
		const swatchSize = MMX.composeUnitValue(this.#card?.image?.swatches?.size) ?? '20px';
		const swatchBorderRadius = MMX.objectToCssShorthand(this.#card?.image?.swatches?.border_radius, {key: 'border_%corner%_radius'}) ?? '50%';
		const swatchBorderWidth = MMX.objectToCssShorthand(this.#card?.image?.swatches?.border_width, {key: 'border_%side%_width'}) ?? '1px';
		const swatchBorderColor = this.#card?.image?.swatches?.border_color?.value ?? 'var(--mmx-color-primary-text)';

		return /*html*/`
			<style>
				.mmx-product-card__attribute-swatches {
					--mmx-product-card__swatch-size: ${MMX.encodeEntities(swatchSize)};
					--mmx-product-card__swatch-border-radius: ${MMX.encodeEntities(swatchBorderRadius)};
					--mmx-product-card__swatch-border-width: ${MMX.encodeEntities(swatchBorderWidth)};
					--mmx-product-card__swatch-border-color: ${MMX.encodeEntities(swatchBorderColor)};
				}
			</style>
		`;
	}

	#getSwatchAttribute() {
		if (MMX.isFalsy(this.#card?.image?.swatches?.settings?.enabled) || MMX.arrayIsEmpty(this.#product?.attributes)) {
			return undefined;
		}

		return this.#getFlatAttributes().find(attribute => this.#isSwatchAttribute(attribute));
	}

	#getFlatAttributes() {
		const flatAttributes = [];

		for (const attribute of this.#product.attributes) {
			if (attribute.type === 'template') {
				for (const templateAttribute of attribute.attributes) {
					flatAttributes.push({
						...templateAttribute,
						id: attribute.id,
						templateAttributeId: templateAttribute.id
					});
				}
			}
			else {
				flatAttributes.push({
					...attribute
				});
			}
		}

		return flatAttributes;
	}

	#isSwatchAttribute(attribute = {}) {
		if (MMX.isFalsy(attribute?.inventory)) {
			return false;
		}

		if (!MMX.valueIsEmpty(this.#card.image?.swatches?.attribute_codes?.value)) {
			const includedAttributeCodes = MMX.splitString(this.#card.image.swatches.attribute_codes.value);
			if (!includedAttributeCodes.includes(attribute.code)) {
				return false;
			}
		}

		if (!MMX.valueIsEmpty(this.#card.image?.swatches?.attribute_types?.value)) {
			const includedAttributeTypes = MMX.splitString(this.#card.image.swatches.attribute_types.value);
			if (!includedAttributeTypes.includes(attribute.type)) {
				return false;
			}
		}

		return attribute.options?.some?.(option => option.image);
	}

	#renderAttributeSwatch(option, index) {
		if (index >= this.#getMaxSwatchCount()) {
			return '';
		}

		return /*html*/`
			<button
				type="button"
				part="attribute-swatch-button"
				class="mmx-product-card__attribute-swatch-button"
				data-option-code="${MMX.encodeEntities(option.code)}"
				title="${MMX.encodeEntities(option.prompt)}"
			>
				<img
					part="attribute-swatch-image"
					class="mmx-product-card__attribute-swatch-image"
					src="${MMX.encodeEntitiesURI(option.image)}"
					alt=""
					loading="lazy"
				>
			</button>
		`;
	}

	#renderMoreSwatches() {
		const remainingCount = this.#swatchAttribute.options.length - this.#getMaxSwatchCount();

		if (remainingCount <= 0) {
			return '';
		}

		return /*html*/`
			<span part="attribute-swatch-more" class="mmx-product-card__attribute-swatch-more">+${remainingCount} more</span>
		`;
	}

	#getMaxSwatchCount() {
		return MMX.coerceNumber(this.#card?.image?.swatches?.max_swatches?.value, 3);
	}

	#listenForSwatchButtonInteractions() {
		const eventName = this.#getSwatchChangeEventName();

		this.on(eventName, '.mmx-product-card__attribute-swatch-button', (e, button) => {
			this.#onSwatchButtonInteraction(e, button);
		});
	}

	#getSwatchChangeEventName() {
		return this.#card?.image?.swatches?.change_swatches_on?.value?.toLowerCase?.() === 'hover'
			? 'pointerover, click'
			: 'click';
	}

	#onSwatchButtonInteraction(e, button) {
		if (e.type === 'click') {
			e.preventDefault();
			e.stopPropagation();
		}
		else if (e.type === 'pointerover') {
			const previousElement = e.relatedTarget;

			if (previousElement && button.contains(previousElement)) {
				return;
			}
		}

		this.#loadVariantFromSelectedSwatchButton(button);
	}

	#loadVariantFromSelectedSwatchButton(button) {
		const selections = this.#getSelections(button);

		MMX.Runtime_JSON_API_Call({
			cached: true,
			params: {
				Function: 'Runtime_AttributeList_Load_ProductVariant_Possible',
				Product_Code: this.#product.code,
				Selected_Attribute_IDs: selections.attributeIds,
				Selected_AttributeTemplateAttribute_IDs: selections.templateAttributeIds,
				Selected_Option_IDs: selections.optionIds,
				Selected_Attribute_Types: selections.attributeTypes
			}
		})
			.then(response => {
				this.#handleLoadedVariant(response);
			});
	}

	#getSelections(button) {
		const selections = {
			attributeTypes: [],
			attributeIds: [],
			templateAttributeIds: [],
			optionIds: []
		};

		this.#getFlatAttributes().forEach(attribute => {
			if (MMX.isFalsy(attribute?.inventory)) {
				return;
			}

			selections.attributeTypes.push(attribute.type);
			selections.attributeIds.push(attribute.id);

			if (attribute.templateAttributeId) {
				selections.templateAttributeIds.push(attribute.templateAttributeId);
			}

			if (attribute.options) {
				const isSwatchAttribute = attribute.disp_order === this.#swatchAttribute.disp_order;
				const option = isSwatchAttribute ? this.#getOptionFromSwatchButton(button) : this.#getOptionFromAttribute(attribute);

				selections.optionIds.push(option?.id);
			}
		});

		return selections;
	}

	#getOptionFromAttribute(attribute) {
		if (attribute.default_id > 0) {
			return attribute.options.find(option => option.id === attribute.default_id);
		} else {
			return attribute.options.at(0);
		}
	}

	#getOptionFromSwatchButton(button) {
		return this.#swatchAttribute?.options.find(option => option.code === button.dataset.optionCode);
	}

	#handleLoadedVariant(response) {
		this.#loadVariantImages(response?.data?.variant?.variant_id);
	}

	#loadVariantImages(Variant_ID) {
		MMX.Runtime_JSON_API_Call({
			cached: true,
			params: {
				Function: 'Runtime_ProductImageList_Load_Product_Variant',
				Product_Code: this.#product.code,
				Variant_ID,
				Image_Sizes: this.getPropValue('image-dimensions')
			}
		})
			.then(response => {
				this.#handleLoadedVariantImages(response);
			});
	}

	#handleLoadedVariantImages(response) {
		const mainImage = this.#findImageByType(response?.data, this.getPropValue('image-type'));
		this.#updateImageSrc(mainImage?.image_data?.[0]);

		const hoverType = this.#card?.image?.hover_image?.type?.value;
		const hoverImage = this.#findImageByType(response?.data, hoverType)?.image_data?.[0];

		if (hoverImage && this.#hoverImage()) {
			this.#hoverImage().src = hoverImage;
		}
	}

	#findImageByType(images = [], type = 'main') {
		return images?.find?.(image => image?.type_code === type);
	}

	#updateImageSrc(src) {
		this.#image().src = src ?? this.#getProductResizedImage().url;
	}

	#image() {
		return this.shadowRoot.querySelector('[part~="main-image"]');
	}

	#hoverImage() {
		return this.shadowRoot.querySelector('[part~="hover-image"]');
	}

	// Render: Add to Wishlist
	#renderAddToWishlist() {
		if (!MMX.isTruthy(this.#card?.add_to_wishlist?.settings?.enabled)) {
			return '';
		}

		if (this.#card?.add_to_wishlist?.login?.method?.value === 'none' && MMX.isTruthy(this.#card?.add_to_wishlist?.needs_login)) {
			return '';
		}

		const added = this.#product?.quantity_in_wishlists > 0 ? true : false;

		return /*html*/`
			<mmx-atwl-button
				slot="flag"
				part="wishlist-button"
				data-product-code="${MMX.encodeEntities(this.#product.code)}"
				data-icon-set="${MMX.encodeEntities(this.#card?.add_to_wishlist?.icon?.set?.value)}"
				data-color="${MMX.encodeEntities(this.#card?.add_to_wishlist?.icon?.color?.value)}"
				data-added="${added}"
			>
			</mmx-atwl-button>
		`;
	}

	// Render: Price
	#renderPrice(detail = {}) {
		// Price Display
		this.#product.price_display = this.#product.formatted_sale_price;
		if (detail.price?.displayed?.value === 'base') {
			this.#product.price_display = this.#product.formatted_base_price;
		}
		else if (detail.price?.displayed?.value === 'retail') {
			this.#product.price_display = this.#product.formatted_retail;
		}

		// Additional Price Display
		this.#product.additional_price_display = '';
		if (detail.price?.additional?.value === 'base') {
			this.#product.additional_price_display = this.#product.formatted_base_price;
		}
		else if (detail.price?.additional?.value === 'retail') {
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

		const theme_available = detail.button?.text?.textsettings?.fields?.normal?.button_theme?.theme_available ?? false;

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
		return this.#renderTextDetail({
			value: this.getCustomFieldValueFromRecord(detail?.customfield?.value, this.#product),
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

		if (MMX.valueIsEmpty(fragmentContent)) {
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
				data-spacing="none"
				data-theme="${MMX.encodeEntities(theme_available)}"
				data-theme-class="${MMX.encodeEntities(detail?.text_styles?.typography_theme?.classname ?? '')}"
				data-style="${MMX.encodeEntities(detail?.text_styles?.style?.value)}"
				data-align="${MMX.encodeEntities(detail?.text_styles?.text_align?.value)}"
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
				data-align="${MMX.encodeEntities(detail?.text_styles?.text_align?.value)}"
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

/**
 * MMX / CATEGORY CARD
 */
class MMX_CategoryCard extends MMX_Card {

	static get props() {
		return MMX.assign(MMX_CategoryCard.categoryCardProps, MMX_Card.props);
	}

	static categoryCardProps = {
		'fallback-image': {
			allowAny: true,
			default: 'graphics/en-US/cssui/blank.gif'
		},
		'image-type': {
			allowAny: true,
			options: [
				'cattree',
				'cattitle',
				'customfield'
			],
			default: 'cattree'
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

	#category;
	#details = [
		{
			type: { value: 'image' }
		},
		{
			type: { value: 'name' }
		}
	];
	#styles = {};

	constructor() {
		super();
	}

	static create({category, details, styles, ...options}) {
		return MMX.createElement({
			type: 'mmx-category-card',
			data: {
				category,
				details,
				styles
			},
			...options
		});
	}

	render() {
		if (!this.#category) {
			return '';
		}

		return /*html*/`
			<mmx-card
				part="wrapper"
				exportparts="wrapper:card-wrapper, flag:card-flag, header:card-header, main:card-main, footer:card-footer"
				data-href="${MMX.encodeEntities(this.getPropValue('href') ?? this.#category?.url)}"
				data-target="${MMX.encodeEntities(this.getPropValue('target'))}"
				style="${MMX.encodeEntities(this.#getStyles())}"
			>
				${this.#renderCategoryDetails()}
			</mmx-card>
		`;
	}

	onDataChange() {
		this.#category = this.data?.category ?? this.#category;
		this.#details = this.data?.details ?? this.#details;
		this.#styles = this.data?.styles ?? this.#styles;
	}

	// Details
	#renderCategoryDetails() {
		return this.#details?.map?.(detail => {
			return this.#renderCategoryDetail(detail);
		}).join('');
	}

	#renderCategoryDetail(detail = {}) {
		switch (detail?.type?.value) {
			case 'button__view-category':
				return this.#renderButton(detail);
			case 'customfield':
				return this.#renderCustomField(detail);
			case 'fragment':
				return this.#renderFragmentDetail(detail);
			case 'image':
				return this.#renderImage(detail);
			default:
				return this.#renderCoreDetail(detail);
		}
	}

	// Render: Button
	#renderButton(detail = {}) {
		const className = MMX.coerceString(detail.button?.text?.textsettings?.fields?.normal?.button_theme?.classname);
		const link = this.#category.url;
		const size = MMX.coerceString(detail.button?.text?.textsettings?.fields?.normal?.button_size?.value, {fallback: 'm'});
		const style = MMX.coerceString(detail.button?.text?.textsettings?.fields?.normal?.button_style?.value, {fallback: 'display-link'});
		const text = MMX.coerceString(detail.button?.text?.value, {fallback: 'Shop Now'});
		const theme_available = detail.button?.text?.textsettings?.fields?.normal?.button_theme?.theme_available ?? false;
		const width = MMX.coerceString(detail.button?.text?.textsettings?.fields?.normal?.button_width?.value, {fallback: 'auto'});

		return /*html*/`
			<mmx-button
				slot="main"
				part="detail button ${MMX.encodeEntities(detail?.type?.value)}"
				exportparts="button: button-wrapper"
				href="${MMX.encodeEntities(link)}"
				data-style="${MMX.encodeEntities(style)}"
				data-size="${MMX.encodeEntities(size)}"
				data-theme="${MMX.encodeEntities(theme_available)}"
				data-theme-class="${MMX.encodeEntities(className)}"
				data-width="${!theme_available ? 'full' : MMX.encodeEntities(width)}"
			>
				${this.renderThemeStylesheetTemplate(theme_available)}
				${MMX.encodeEntities(text)}
			</mmx-button>`;
	}

	// Render: Core Detail
	#renderCoreDetail(detail = {}) {
		const type = detail?.type?.value;
		const value = this.#category?.[type];

		return this.#renderTextDetail({value, detail});
	}

	// Render: Custom Field
	#renderCustomField(detail = {}) {
		return this.#renderTextDetail({
			value: this.getCustomFieldValueFromRecord(detail?.customfield?.value, this.#category),
			detail
		});
	}

	// Render: Empty Detail (keeps index-based preview_property_selectors working)
	#renderEmptyDetail() {
		return /*html*/`
			<div slot="main" part="detail empty"></div>
		`;
	}

	// Render: Fragment
	#renderFragmentDetail(detail = {}) {
		const fragmentCode = detail?.fragment?.value;
		const fragmentContent = this.renderProductFragment({
			product: this.#category,
			fragmentCode
		});

		if (MMX.valueIsEmpty(fragmentContent)) {
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
				data-align="${MMX.encodeEntities(detail?.text_styles?.text_align?.value)}"
			>
				${this.renderThemeStylesheetTemplate(theme_available)}
				${fragmentContent}
			</mmx-text>
		`;
	}

	// Render: Image
	#renderImage(detail) {
		const imageType = detail?.image_settings?.type?.value ?? 'cattree';
		const imageFit = detail?.image_settings?.fit?.value ?? 'cover';

		let image = '';

		if (imageType === 'cattree') {
			image = this.#category?.CustomField_Values?.['cmp-cssui-cattree'].category_tree_image;
		} else if (imageType === 'cattitle') {
			image = this.#category?.CustomField_Values?.['cmp-cssui-cattitle'].category_title_image;
		}

		if (MMX.valueIsEmpty(image)) {
			image = this.getPropValue('fallback-image');
		}

		const content = /*html*/`
			<img
				slot="main"
				part="detail ${MMX.encodeEntities(detail?.type?.value)}"
				src="${MMX.encodeEntitiesURI(image)}"
				alt=""
				style="
					object-fit: ${MMX.encodeEntities(imageFit)};
				"
			>
		`;

		return content;
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
				data-align="${MMX.encodeEntities(detail?.text_styles?.text_align?.value)}"
			>
				${this.renderThemeStylesheetTemplate(theme_available)}
				${this.#renderTextDetailSpan('prefix', prefix)}
				${value}
				${this.#renderTextDetailSpan('suffix', suffix)}
			</mmx-text>
		`;
	}

	#renderTextDetailSpan(type, value) {
		if (MMX.valueIsEmpty(value)) {
			return '';
		}

		return /*html*/`
			<span part="detail-${MMX.encodeEntities(type)}">
				${MMX.encodeEntities(value)}
			</span>
		`;
	}

	// Styles
	#getStyles() {
		return MMX.objectToInlineStyles(this.#getStylesObject());
	}

	#getStylesObject() {
		const borderWidth = MMX.objectToCssShorthand(this.#styles?.border_width, {key: 'border_%side%_width'});

		return {
			margin: MMX.objectToCssShorthand(this.#styles?.margin),
			padding: MMX.objectToCssShorthand(this.#styles?.padding),
			backgroundColor: MMX.coerceString(this.#styles?.background_color?.value),
			borderRadius: MMX.objectToCssShorthand(this.#styles?.border_radius, {key: 'border_%corner%_radius'}),
			borderColor: MMX.coerceString(this.#styles?.border_color?.value),
			boxShadow: MMX.boxShadowObjectToCssValue(this.#styles?.box_shadow),
			borderStyle: borderWidth ? 'solid' : undefined,
			borderWidth
		};
	}
}

if (!customElements.get('mmx-category-card')) {
	customElements.define('mmx-category-card', MMX_CategoryCard);
}