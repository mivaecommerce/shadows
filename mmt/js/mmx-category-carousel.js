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

	themeResourcePattern = /mmx-(base|button|hero|hero-slider)\/styles.css|family=Inter/i;

	loadedCategories = {};

	constructor() {
		super();
		this.makeShadow();
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
		this.loadCategories();

		MMX.setElementAttributes(this, {
			'data-per-page': this.data?.advanced?.slide_controls?.per_page?.value,
			'data-per-move': this.data?.advanced?.slide_controls?.per_move?.value,
			'data-size': this.data?.category_group?.image_size?.value,
			'data-image-fit': this.data?.category_group?.image_fit?.value
		});
	}

	getCategoryCodesToLoad() {
		const children = this?.data?.category_group?.categories?.children;

		if (!children?.length) {
			return;
		}

		return children.reduce((codes, child) => {
			const code = child?.category?.category?.code;
			if (code?.length && codes.indexOf(code) === -1 && MMX.isTruthy(child?.image?.category_image?.settings?.enabled)) {
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
				function: 'Runtime_CategoryList_Load_Query',
				filter: [
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
			},
			callback: (response) => {
				if(!response?.data?.data?.length) {
					return;
				}

				response.data.data.forEach(category => {
					this.loadedCategories[category.id] = category;
				});

				this.forceUpdate();
			}
		});
	}

	renderCategories() {
		const chilren = MMX.copy(this?.data?.category_group?.categories?.children || []);

		if (!chilren?.length){
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
				data-wrap="${this.getPropValue('wrap')}"
			>
				${chilren.map(child => this.renderCategory(child)).join('')}
			</mmx-hero-slider>
		`;
	}

	renderCategory(child) {
		// Skip unavailable/inactive categories
		if(!child?.category?.category?.id) {
			return '';
		}

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
					data-style="${this.data?.text_styles?.category_name?.style?.value ?? ''}"
					data-align="${this.data?.text_styles?.align?.value ?? ''}"
					style="
						font-family: ${MMX.encodeEntities(this.data?.text_styles?.category_name?.font_family?.value ?? '')};
						font-size: ${this.data?.text_styles?.category_name?.font_size?.value ?? ''}px;
						font-weight: ${this.data?.text_styles?.category_name?.font_weight?.value ?? ''};
						color: ${this.data?.text_styles?.category_name?.font_color?.value ?? ''};
					"
				>
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

			if (child?.image?.custom_image?.image?.responsive_images?.mobile) {
				mobileSource = /*html*/`<source class="source__mobile" media="(max-width: 640px)" srcset="${child.image.custom_image.image.responsive_images.mobile}">`;
			}

			if (child?.image?.custom_image?.image?.responsive_images?.tablet) {
				tabletSource = /*html*/`<source class="source__tablet" media="(max-width: 960px)" srcset="${child.image.custom_image.image.responsive_images.tablet}">`;
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
				<img src="${child.image.url}" alt="${child.image?.custom_image?.image?.alt ?? ''}" ${this.getLoadingAttributeString()}>
			</picture>
		`;
	}
}

if (!customElements.get('mmx-category-carousel')) {
	customElements.define('mmx-category-carousel', MMX_CategoryCarousel);
}
