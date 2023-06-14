/**
 * MMX / PRODUCT CAROUSEL
 */
class MMX_ProductCarousel extends MMX_Element {

	static get props() {
		let props = MMX.assign(MMX_ProductCarousel.carouselProps, MMX_HeroSlider.props);
		props['per-page'].default = '1,3,5';
		props['arrow-style'].default = 'button';
		props['nav-position'].default = 'none';
		props['sync-heights'].default = '.type-product-name';
		props['wrap'].default = false;
		props['autoplay'].default = false;
		return props;
	}

	static carouselProps = {
		'image-dimensions': {
			options: [
				'100x100',
				'300x300',
				'500x500'
			],
			allowAny: true,
			default: '300x300'
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
		'bask-url': {
			allowAny: true
		},
		'sync-heights': {
			allowAny: true,
			default: '.type-product-name'
		}
	};

	themeResourcePattern = /mmx-(base|button|hero|hero-slider)\/styles.css|family=Inter/i;

	products = [];

	constructor() {
		super();
		this.makeShadow();
	}

	render() {
		return /*html*/`
			<div part="wrapper" class="mmx-product-carousel">
				<div part="title" class="mmx-product-carousel__title">
					<slot name="title"></slot>
				</div>
				${this.renderProducts()}
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
		this.products = [];

		if (MMX.isTruthy(this.data.products.from_individual.settings.enabled)) {
			this.loadIndividualProducts();
		}

		if (MMX.isTruthy(this.data.products.from_category.settings.enabled)) {
			this.loadProductsFromCategory();
		}

		MMX.setElementAttributes(this, {
			'data-size': this.data?.products?.image_size?.value,
			'data-image-fit': this.data?.products?.image_fit?.value
		});
	}

	getDefaultFilters() {
		return [
			{
				name: 'imagetypes',
				value: {
					types: [this.getImageType()],
					sizes: ['original', this.getPropValue('image-dimensions')]
				}
			},
			{
				name: 'ondemandcolumns',
				value: [
					'sale_price',
					'attributes'
				]
			}
		];
	}

	loadProductsFromCategory({category_code, count, sort, filter} = {} ) {
		category_code = category_code ?? this?.data?.products?.from_category?.category?.category_code;
		count = count ?? this?.data?.products?.from_category?.count?.value;
		sort = sort ?? this?.data?.products?.from_category?.sort?.value;
		filter = filter ?? this.getDefaultFilters();

		if (!category_code?.length) {
			return;
		}

		MMX.Runtime_JSON_API_Call({
			params: {
				function: 'Runtime_CategoryProductList_Load_Query',
				category_code,
				count,
				sort,
				filter
			},
			callback: (response) => {
				this.products.push(...response.data.data);
				this.forceUpdate();
			}
		});
	}

	loadIndividualProducts(products) {
		const productCodes = this.getProductCodesToLoad(products);

		if (!productCodes?.length) {
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
								operator: 'IN',
								value: productCodes
							}
						]
					},
					...this.getDefaultFilters()
				]
			},
			callback: (response) => {
				// Sort products by manual sort order
				response.data.data.sort((a, b) => {
					return productCodes.indexOf(a?.code) - productCodes.indexOf(b?.code);
				});

				this.products.unshift(...response.data.data);
				this.forceUpdate();
			}
		});
	}

	getProductCodesToLoad(products) {
		products = products ?? this?.data?.products?.from_individual?.products?.children;

		if (!products?.length) {
			return;
		}

		return products.reduce((codes, product) => {
			const code = product?.product?.code;
			if (code?.length && codes.indexOf(code) === -1) {
				codes.push(code);
			}
			return codes;
		}, []);
	}

	renderProducts() {
		if (!this.products?.length){
			return '';
		}

		return /*html*/`
			<mmx-hero-slider
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
				data-sync-heights="${this.getPropValue('sync-heights')}"
				data-wrap="${this.getPropValue('wrap')}"
			>
				${this.products.map(product => this.renderProduct(product)).join('')}
			</mmx-hero-slider>
		`;
	}

	getImageType() {
		return this?.data?.advanced?.settings?.image_type?.value ?? 'main';
	}

	renderProduct(product) {
		const imageType = this.getImageType();
		product.imgSrc = product.imagetypes?.[imageType]?.sizes?.[this.getPropValue('image-dimensions')]?.url ?? product?.imagetypes?.[imageType]?.sizes?.original?.url ?? '';

		return /*html*/`
			<mmx-hero
				slot="hero_slide"
				data-fit="${MMX.encodeEntities(this.getPropValue('image-fit'))}"
				data-href="${MMX.encodeEntities(product.url)}"
				data-img-src="${MMX.encodeEntities(product.imgSrc)}"
			>
				<div slot="content">
					<div class="type-product-name">${product.name}</div>
					${this.renderPrice(product)}
					${this.renderButton(product)}
				</div>
			</mmx-hero>
		`;
	}

	renderPrice(product) {
		// Price Display
		product.price_display = product.formatted_sale_price;
		if (this?.data?.advanced?.settings?.displayed_price?.value === 'base'){
			product.price_display = product.formatted_base_price;
		}
		else if (this?.data?.advanced?.settings?.displayed_price?.value === 'retail'){
			product.price_display = product.formatted_retail;
		}

		// Additional Price Display
		product.additional_price_display = '';
		if (this?.data?.advanced?.settings?.additional_price?.value === 'base'){
			product.additional_price_display = product.formatted_base_price;
		}
		else if (this?.data?.advanced?.settings?.additional_price?.value === 'retail'){
			product.additional_price_display = product.formatted_retail;
		}

		return /*html*/`
			<div class="type-product-prices">
				<span class="type-product-price">${product.price_display}</span>
				${product.additional_price_display.length && product.additional_price_display !== product.price_display ? /*html*/`<span class="type-product-additional-price">${product.additional_price_display}</span>` : ''}
			</div>
		`;
	}

	renderButton(product) {
		if (MMX.isFalsy(this?.data?.advanced?.settings?.button?.settings?.enabled)) {
			return '';
		}

		return /*html*/`
			<mmx-button
				href="${MMX.encodeEntities(this.buttonUrl(product))}"
				data-style="${this?.data?.advanced?.settings?.button?.adpr_text?.textsettings?.fields?.normal?.button_style?.value}"
				data-size="${this?.data?.advanced?.settings?.button?.adpr_text?.textsettings?.fields?.normal?.button_size?.value}"
				data-width="full"
			>
				${product?.attributes?.length ? this?.data?.advanced?.settings?.button?.prod_text?.value : this?.data?.advanced?.settings?.button?.adpr_text?.value}
			</mmx-button>`;
	}

	getBaskUrl() {
		return this.getPropValue('bask-url') ?? `/mm5/merchant.mvc?${window?.Store_Code?.length ? 'Store_Code=' + window.Store_Code + '&' : ''}Screen=BASK`;
	}

	buttonUrl(product, quantity = 1) {
		// Link to PROD page when the product has attributes
		if(product?.attributes?.length) {
			return product.url;
		}

		// Otherwise, link to BASK with the ADPR action
		let adprUrl = new URL(this.getBaskUrl(), document.baseURI);
		adprUrl.searchParams.append('Action', 'ADPR');
		adprUrl.searchParams.append('Product_Code', product.code);
		adprUrl.searchParams.append('Quantity', quantity);
		return adprUrl.toString();
	}
}

if (!customElements.get('mmx-product-carousel')) {
	customElements.define('mmx-product-carousel', MMX_ProductCarousel);
}
