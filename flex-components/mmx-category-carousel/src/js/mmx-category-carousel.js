/**
 * MMX / CATEGORY CAROUSEL
 */
class MMX_CategoryCarousel extends MMX_Element {

	static get props() {
		let props = MMX.assign(MMX_CategoryCarousel.carouselProps, MMX_HeroSlider.props);
		props['gap'].default = 32;
		props['per-page'].default = '1,3,5';
		props['arrow-style'].default = 'button';
		props['nav-position'].default = 'none';
		props['wrap'].default = false;
		props['autoplay'].default = false;
		return props;
	}

	static carouselProps = {
		'fallback-image': {
			allowAny: true
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

	styleResourceCodes = ['mmx-base', 'mmx-button', 'mmx-hero', 'mmx-hero-slider'];
	loadedCategories = {};
	categories = [];

	constructor() {
		super();
		this.makeShadow();
		this.bindRevealElement();
	}

	render() {
		return /*html*/`
			<div part="wrapper" class="mmx-category-carousel">
				<div part="title" class="mmx-category-carousel__title">
					<slot name="title"></slot>
				</div>
				${this.renderCategories()}
			</div>
		`;
	}

	styles() {
		return /*css*/`
			slot[name="title"]::slotted(*) {
				margin: 0 auto 3%;
			}
		`;
	}

	onDataChange() {
		MMX.setElementAttributes(this, {
			'data-per-page': this.data?.advanced?.slide_controls?.per_page?.value,
			'data-per-move': this.data?.advanced?.slide_controls?.per_move?.value,
			'data-peek': this.data?.advanced?.slide_controls?.peek?.value,
			'data-size': this.data?.category_group?.image_size?.value,
			'data-image-fit': this.data?.category_group?.image_fit?.value
		});

		this.displayCategories();
	}

	displayCategories() {
		if ( this.data?.category_group?.source?.value == 'manual' )	this.loadCategories();
		else														this.loadChildCategories();
	}

	getCategoryCodesToLoad() {
		const children = this?.data?.category_group?.categories?.children;

		if (!children?.length) {
			return;
		}

		return children.reduce((codes, child) => {
			const code = child?.category?.category?.code;
			if (!MMX.valueIsEmpty(code) && codes.indexOf(code) === -1 && MMX.isTruthy(child?.image?.category_image?.settings?.enabled)) {
				codes.push(code);
			}
			return codes;
		}, []);
	}

	loadCategories() {
		const categoryCodes = this.getCategoryCodesToLoad();

		if (!categoryCodes?.length) {
			return;
		}

		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Runtime_CategoryList_Load_Query',
				Filter: [
					{
						name: 'search',
						value: [
							{
								field: 'code',
								operator: 'IN',
								value: categoryCodes
							}
						]
					},
					{
						name: 'ondemandcolumns',
						value: [
							'CustomField_Values:cmp-cssui-cattitle:category_title_image',
							'CustomField_Values:cmp-cssui-cattree:category_tree_image'
						]
					}
				]
			}
		})
		.then(response => {
			if(!response?.data?.data?.length) {
				return;
			}

			response.data.data.forEach(category => {
				this.loadedCategories[category.id] = category;
			});

			this.forceUpdate();
		})
		.catch(response => {});
	}

	loadChildCategories() {
		if (MMX.valueIsEmpty(this?.data?.category_id)) {
			return;
		}

		var filters = [];

		if (this.data?.category_group?.category_image?.settings?.enabled) {
			filters = [
				{
					name: 'ondemandcolumns',
					value: [
						'CustomField_Values:cmp-cssui-cattitle:category_title_image',
						'CustomField_Values:cmp-cssui-cattree:category_tree_image'
					]
				}
			];
		}

		this.categories = [];

		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Runtime_CategoryList_Load_Query',
				Parent_ID: this.data.category_id,
				Filter: filters
			}
		})
		.then(response => {
			if(!response?.data?.data?.length) {
				return;
			}

			response.data.data.forEach(category => {
				this.loadedCategories[category.id] = category;
				this.categories.push({
					category: {
						category: {
							link: category.url,
							...category,
						},
						category_code: category.code
					},
					image: {
						category_image: {
							image: {
								value: this.data?.category_group?.category_image?.image?.value
							},
							settings: {
								enabled: this.data?.category_group?.category_image?.settings?.enabled
							}
						}
					}
				});
			});

			this.forceUpdate();
		})
		.catch(response => {});
	}

	renderCategories() {
		var children;

		if (this.data?.category_group?.source?.value == 'auto' )
		{
			children = this.categories;
		}
		else
		{
			children = MMX.copy(this?.data?.category_group?.categories?.children || []);
		}

		if (!children?.length){
			return '';
		}

		return /*html*/`
			<mmx-hero-slider
				part="slider"
				data-per-page="${this.getPropValue('per-page')}"
				data-per-move="${this.getPropValue('per-move')}"
				data-peek="${this.getPropValue('peek')}"
				data-gap="${this.getPropValue('gap')}"
				data-size="${this.getPropValue('size')}"
				data-autoplay="${this.getPropValue('autoplay')}"
				data-delay="${this.getPropValue('delay')}"
				data-pause-on-hover="${this.getPropValue('pause-on-hover')}"
				data-arrow-style="${this.getPropValue('arrow-style')}"
				data-nav-position="${this.getPropValue('nav-position')}"
				data-nav-button-size="${this.getPropValue('nav-button-size')}"
				data-wrap="${this.getPropValue('wrap')}"
			>
				${children.map(child => this.renderCategory(child)).join('')}
			</mmx-hero-slider>
		`;
	}

	renderCategory(child) {
		// Skip unavailable/inactive categories
		if(!child?.category?.category?.id) {
			return '';
		}

		const theme_available = this.data?.text_styles?.category_name?.typography_theme?.theme_available;

		return /*html*/`
			<mmx-hero
				slot="hero_slide"
				part="hero_slide"
				data-fit="${MMX.encodeEntities(this.getPropValue('image-fit'))}"
				data-href="${MMX.encodeEntities(child.category.category.link)}"
			>
				${this.renderCategoryImage(child)}
				<mmx-text
					slot="heading"
					part="hero_slide__heading"
					data-theme="${MMX.encodeEntities(theme_available)}"
					data-theme-class="${MMX.encodeEntities(this.data?.text_styles?.category_name?.typography_theme?.classname ?? '')}"
					data-style="${this.data?.text_styles?.category_name?.style?.value ?? ''}"
					data-align="${this.data?.text_styles?.align?.value ?? ''}"
				>
					${this.renderLegacyStylesTemplate(theme_available, this.getStylesFromGroup(this.data?.text_styles?.category_name))}
					${this.renderThemeStylesheetTemplate(theme_available)}
					${child.category.category.name}
				</mmx-text>
			</mmx-hero>
		`;
	}

	renderCategoryImage(child) {
		let mobileSource = '';
		let tabletSource = '';

		child.image.url = this.getPropValue('fallback-image');

		// Custom Images
		if (MMX.isTruthy(child?.image?.custom_image?.settings?.enabled) && child?.image?.custom_image?.image?.image?.length ) {
			child.image.url = child.image.custom_image.image.image;

			const mobileImage = this.#getResponsiveImageData('mobile', child?.image?.custom_image?.image);

			if (mobileImage) {
				mobileSource = /*html*/`<source
					class="source__mobile"
					media="(max-width: 39.999em)"
					srcset="${MMX.encodeEntities(MMX.encodeSrcset(mobileImage.image))}"
					width="${MMX.encodeEntities(mobileImage.width)}"
					height="${MMX.encodeEntities(mobileImage.height)}"
				>`;
			}

			const tabletImage = this.#getResponsiveImageData('tablet', child?.image?.custom_image?.image);

			if (tabletImage) {
				tabletSource = /*html*/`<source
					class="source__tablet"
					media="(max-width: 59.999em)"
					srcset="${MMX.encodeEntities(MMX.encodeSrcset(tabletImage.image))}"
					width="${MMX.encodeEntities(tabletImage.width)}"
					height="${MMX.encodeEntities(tabletImage.height)}"
				>`;
			}
		}
		// Category Image (tree or title)
		else if (MMX.isTruthy(child?.image?.category_image?.settings?.enabled)) {
			const loadedCategory = this.loadedCategories[child.category.category.id];
			if (child?.image?.category_image?.image?.value === 'cattitle' && loadedCategory?.CustomField_Values?.['cmp-cssui-cattitle']?.category_title_image?.length) {
				child.image.url = loadedCategory.CustomField_Values['cmp-cssui-cattitle'].category_title_image;
			}
			else if (child?.image?.category_image?.image?.value === 'cattree' && loadedCategory?.CustomField_Values?.['cmp-cssui-cattree']?.category_tree_image?.length) {
				child.image.url = loadedCategory.CustomField_Values['cmp-cssui-cattree'].category_tree_image;
			}
		}

		if(!child.image.url?.length) {
			return '';
		}

		return /*html*/`
			<picture
				slot="image"
				part="hero_slide__image"
			>
				${mobileSource}
				${tabletSource}
				<img
					src="${MMX.encodeEntities(child.image.url)}"
					alt="${MMX.encodeEntities(child.image.custom_image?.image?.alt)}"
					width="${MMX.encodeEntities(child.image.custom_image?.image?.width)}"
					height="${MMX.encodeEntities(child.image.custom_image?.image?.height)}"
					${this.getLoadingAttributeString()}
				>
			</picture>
		`;
	}

	#getResponsiveImageData(device, image) {
		const responsiveImageData = image?.responsive_image_data?.[device];
		const responsiveImage = image?.responsive_images?.[device];

		if (!MMX.valueIsEmpty(responsiveImageData?.image)) {
			return responsiveImageData;
		}
		else if (!MMX.valueIsEmpty(responsiveImage)) {
			return {
				image: responsiveImage
			};
		}
		else {
			return undefined;
		}
	}

	slider() {
		return this.shadowRoot.querySelector('[part~="slider"]');
	}

	revealElement(element) {
		this.slider()?.revealElement(element);
	}
}

if (!customElements.get('mmx-category-carousel')) {
	customElements.define('mmx-category-carousel', MMX_CategoryCarousel);
}