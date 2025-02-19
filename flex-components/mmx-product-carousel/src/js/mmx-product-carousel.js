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

	styleResourceCodes = ['mmx-base', 'mmx-text', 'mmx-button', 'mmx-hero', 'mmx-hero-slider'];

	products = [];

	constructor() {
		super();
		this.makeShadow();
		this.bindRevealElement();
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

	afterRender() {
		this.#debouncedAfterRender();
	}

	#debouncedAfterRender = MMX.debounce(() => {
		this.notifyOfProductPriceChanges();
	}, 100);

	notifyOfProductPriceChanges() {
		this.products?.forEach?.(product => {
			window?.MivaEvents?.ThrowEvent?.('price_changed', {
				product_code: product.code,
				price: product.price,
				additional_price: product.base_price
			});
		});
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
			},
			{
				name: 'fragments',
				value: [
					this.getFragmentCode()
				]
			}
		];
	}

	loadProductsFromCategory({category_code, count, sort, filter} = {} ) {
		category_code = category_code ?? this?.data?.products?.from_category?.category?.category_code;
		count = count ?? this?.data?.products?.from_category?.count?.value;
		sort = sort ?? this?.data?.products?.from_category?.sort?.value;
		filter = filter ?? this.getDefaultFilters();

		if (MMX.valueIsEmpty(category_code)) {
			return;
		}

		MMX.Runtime_JSON_API_Call({
			params: {
				function: 'Runtime_CategoryProductList_Load_Query',
				category_code,
				count,
				sort,
				filter
			}
		})
		.then(response => {
			this.products.push(...response.data.data);
			this.forceUpdate();
		})
		.catch(response => {});
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
			}
		})
		.then(response => {
			// Sort products by manual sort order
			response.data.data.sort((a, b) => {
				return productCodes.indexOf(MMX.normalizeCode(a?.code)) - productCodes.indexOf(MMX.normalizeCode(b?.code));
			});

			response.data.data.map(product => {
				product.isIndividual = true;
				return product;
			});

			this.products.unshift(...response.data.data);
			this.forceUpdate();
		})
		.catch(response => {});
	}

	getProductCodesToLoad(products) {
		products = products ?? this?.data?.products?.from_individual?.products?.children;

		if (!products?.length) {
			return;
		}

		return products.reduce((codes, product) => {
			const code = MMX.normalizeCode(product?.product?.code);
			if (!MMX.valueIsEmpty(code) && codes.indexOf(code) === -1) {
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

	getFragmentCode() {
		return this?.data?.advanced?.settings?.fragment_code?.value;
	}

	renderProduct(product) {
		const imageType = this.getImageType();
		product.imgSrc = product.imagetypes?.[imageType]?.sizes?.[this.getPropValue('image-dimensions')]?.url ?? product?.imagetypes?.[imageType]?.sizes?.original?.url ?? '';

		return /*html*/`
			<mmx-hero
				slot="hero_slide"
				part="hero_slide product ${product.isIndividual ? 'product--individual' : 'product--category'}"
				data-fit="${MMX.encodeEntities(this.getPropValue('image-fit'))}"
				data-href="${MMX.encodeEntities(product.url)}"
				data-img-src="${MMX.encodeEntities(product.imgSrc)}"
			>
				<div slot="content">
					<div part="product-name" class="type-product-name">${product.name}</div>
					${this.renderPrice(product)}
					${this.renderProductFragmentPart(product)}
					${this.renderButton(product)}
				</div>
			</mmx-hero>
		`;
	}

	renderPrice(product) {
		if (this?.data?.advanced?.settings?.displayed_price?.value === 'none') {
			return '';
		}

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
			<div part="product-prices" class="type-product-prices">
				<span part="product-price" class="type-product-price">${product.price_display}</span>
				${product.additional_price_display.length && product.additional_price_display !== product.price_display ? /*html*/`<span part="product-additional-price" class="type-product-additional-price">${product.additional_price_display}</span>` : ''}
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
				part="button"
				exportparts="button: button__inner"
			>
				${product?.attributes?.length ? this?.data?.advanced?.settings?.button?.prod_text?.value : this?.data?.advanced?.settings?.button?.adpr_text?.value}
			</mmx-button>`;
	}

	renderProductFragmentPart(product) {
		const fragmentCode		= this.getFragmentCode();
		const fragmentContent = this.renderProductFragment({product, fragmentCode});

		if (MMX.valueIsEmpty(fragmentContent)){
			return '';
		}

		return /*html*/`
			<div part="product-fragment product-fragment__${MMX.encodeEntities(fragmentCode)}">
				${fragmentContent}
			</div>`;
	}

	getBaskUrl() {
		return this.getPropValue('bask-url') ?? MMX.longMerchantUrl({Screen: 'BASK'});
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

	slider() {
		return this.shadowRoot.querySelector('[part~="slider"]');
	}

	revealElement(element) {
		this.slider()?.revealElement(element);
	}
}

if (!customElements.get('mmx-product-carousel')) {
	customElements.define('mmx-product-carousel', MMX_ProductCarousel);
}