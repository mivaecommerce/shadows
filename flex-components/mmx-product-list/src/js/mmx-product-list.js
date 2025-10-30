/**
 * MMX / PRODUCT LIST
 */
class MMX_ProductList extends MMX_Element {

	static get props() {
		return {
			'product-set': {
				options: [
					'auto',
					'all',
					'category',
					'merchandising',
					'related',
					'search'
				],
				default: 'auto'
			},
			'category-code': {
				allowAny: true
			},
			'product-code': {
				allowAny: true
			},
			'merchandisingprompt-code': {
				allowAny: true
			},
			'merchandisingprompt-context-product-id': {
				allowAny: true
			},
			'merchandisingprompt-context-category-id': {
				allowAny: true
			},
			'search': {
				allowAny: true
			},
			'per-page': {
				allowAny: true,
				isNumeric: true,
				default: 24
			},
			'show-pagination': {
				isBoolean: true,
				default: true
			},
			'pagination-page-numbers': {
				options: [
					'dropdown',
					'links',
					'none'
				],
				default: 'links'
			},
			'pagination-page-link-count': {
				allowAny: true,
				isNumeric: true,
				default: 7
			},
			'pagination-next-previous': {
				options: [
					'arrows',
					'text',
					'none'
				],
				default: 'arrows'
			},
			'pagination-previous-text': {
				allowAny: true,
				default: 'Previous'
			},
			'pagination-next-text': {
				allowAny: true,
				default: 'Next'
			},
			'sort-by': {
				allowAny: true,
				default: 'disp_order',
			},
			'offset': {
				allowAny: true,
				isNumeric: true,
				default: 0
			},
			'submit-method': {
				options: [
					'replace',
					'reload'
				],
				default: 'replace'
			},
			'columns': {
				allowAny: true,
				default: '2,3,4'
			},
			'product-fallback-image': {
				allowAny: true
			},
			'adpr-url': {
				allowAny: true,
				default:  MMX.longMerchantUrl({Screen: 'BASK'})
			},
			'atwl-url': {
				allowAny: true,
				default:  MMX.longMerchantUrl({Screen: 'WISH'})
			},
			'show-facets': {
				isBoolean: true,
				default: true
			},
			'show-per-page': {
				isBoolean: true,
				default: true
			},
			'show-sort-by': {
				isBoolean: true,
				default: true
			},
			'show-facet-value-counts': {
				isBoolean: true,
				default: true
			},
			'facets-title': {
				allowAny: true,
				default: 'Filters'
			},
			'facets-title-theme': {
				allowAny: true,
				isBoolean: true,
				default: false
			},
			'facets-title-theme-class': {
				allowAny: true,
				default: ''
			},
			'facets-title-style': {
				allowAny: true,
				default: 'title-4'
			},
			'facets-title-styles': {
				allowAny: true,
				default: ''
			},
			'facets-width': {
				allowAny: true,
				isNumeric: true,
				default: 20
			},
			'facet-theme': {
				allowAny: true,
				isBoolean: true,
				default: false
			},
			'facet-theme-class': {
				allowAny: true,
				default: ''
			},
			'facet-style': {
				allowAny: true,
				default: 'subheading-s'
			},
			'facet-styles': {
				allowAny: true,
				default: ''
			},
			'show-details': {
				isBoolean: true,
				default: true
			},
			'show-detail-products' : {
				isBoolean: true,
				default: true
			},
			'show-detail-page' : {
				isBoolean: true,
				default: false
			},
			'show-detail-search' : {
				isBoolean: true,
				default: true
			},
			'product-show-image': {
				isBoolean: true,
				default: true
			},
			'product-image-type': {
				allowAny: true,
				default: 'main'
			},
			'product-image-dimensions': {
				allowAny: true,
				default: '350x350'
			},
			'product-image-fit': {
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
			'param-prefix': {
				allowAny: true
			},
			'empty-results-message': {
				allowAny: true
			},
			'empty-results-message-source': {
				allowAny: true
			},
			'show-empty-results' : {
				isBoolean: true,
				default: true
			},
			'show-category-tree': {
				isBoolean: true,
				default: false
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-text', 'mmx-accordion', 'mmx-forms', 'mmx-product-list'];
	renderUniquely = true;

	#products = [];
	#facets = [];
	#appliedFacetValueCount = 0;
	#card = {};
	#pagination = {};
	#sortByOptions = [];
	#perPageOptions = [];
	#searchOrigin = 'Runtime API';
	#searchType = 'system';
	#searchIndex = '';
	#commonParamsToExclude = ['Screen', 'Action', 'Per_Page', 'Sort_By', 'Offset', 'Search'];
	#paramPrefix;
	#desktopBreakpoint = window.matchMedia('(min-width: 60em)');
	#errorMessage;
	#debounceDelay = 500;

	constructor() {
		super();
		this.makeShadow();
		this.#bindComponentEvents();
	}

	// MMX_Element Render Life Cycle
	render() {
		if (!this.#shouldRender()) {
			return '';
		}

		return /*html*/`
			<div
				part="wrapper"
				class="
					mmx-product-list
					has-facets--${MMX.encodeEntities(this.getPropValue('show-facets'))}
					has-per-page--${MMX.encodeEntities(this.getPropValue('show-per-page'))}
					has-sort-by--${MMX.encodeEntities(this.getPropValue('show-sort-by'))}
					has-details--${MMX.encodeEntities(this.getPropValue('show-details'))}
				"
			>
				<div part="title" class="mmx-product-list__title">
					<slot name="title"></slot>
				</div>
				${this.#renderMain()}
				<div part="loading-overlay" class="mmx-product-list__loading-overlay"></div>
			</div>
		`;
	}

	#shouldRender() {
		if (this.#products.length) {
			return true;
		}

		return this.getPropValue('show-empty-results');
	}

	styles() {
		const columns = this.#getColumns();
		const facetsWidth = this.getPropValue('facets-width');
		const productsWidth = 100 - facetsWidth;
		return /*css*/`
			:host {
				--mmx-product-list__columns--mobile: ${columns.mobile};
				--mmx-product-list__columns--tablet: ${columns.tablet};
				--mmx-product-list__columns--desktop: ${columns.desktop};
				--mmx-product-list__facets-width: ${facetsWidth}fr ${productsWidth}fr;
			}
		`;
	}

	// Data Methods
	onDataChange() {
		this.#card = this.data.card;
		this.#sortByOptions = Array.from(this.data?.list?.sort_by?.options?.children ?? []);
		this.#perPageOptions = Array.from(this.data?.list?.per_page?.options?.children ?? []);
		this.#searchOrigin = this.data?.advanced?.search?.origin?.value ?? 'Runtime API';
		this.#searchType = this.data?.advanced?.search?.type?.value ?? 'system';
		this.#searchIndex = this.data?.advanced?.search?.index?.value ?? '';

		MMX.setElementAttributes(this, {
			'data-product-set': this.data?.list?.products?.product_set?.value,
			'data-category-code': this.data?.list?.products?.category?.category_code,
			'data-product-code': this.data?.list?.products?.product?.product_code,
			'data-merchandisingprompt-code': this.data?.list?.products?.prompt?.code,
			'data-merchandisingprompt-context-product-id': this.data?.list?.products?.prompt?.context?.product_id,
			'data-merchandisingprompt-context-category-id': this.data?.list?.products?.prompt?.context?.category_id,
			'data-search': this.data?.server?.search,
			'data-show-sort-by': this.#sortByOptions.length > 0,
			'data-sort-by': this.data?.list?.sort_by?.default?.value,
			'data-show-per-page': this.#perPageOptions.length > 0,
			'data-per-page': this.data?.list?.per_page?.default?.value,
			'data-submit-method': this.data?.advanced?.submit_method?.value,
			'data-show-facets': this.data?.list?.facets?.settings?.enabled ?? false,
			'data-show-facet-value-counts': this.data?.list?.facets?.show_value_counts?.value,
			'data-show-pagination': this.data?.list?.pagination?.settings?.enabled ?? false,
			'data-pagination-page-numbers': this.data?.list?.pagination?.page_numbers?.value,
			'data-pagination-page-link-count': this.data?.list?.pagination?.page_link_count?.value,
			'data-pagination-next-previous': this.data?.list?.pagination?.next_previous?.value,
			'data-pagination-next-text': this.data?.list?.pagination?.next_text?.value,
			'data-pagination-previous-text': this.data?.list?.pagination?.previous_text?.value,
			'data-facets-title': this.data?.list?.facets?.title?.value,
			'data-facets-title-theme': this.data?.list?.facets?.title?.textsettings?.fields?.normal?.typography_theme?.theme_available,
			'data-facets-title-theme-class': this.data?.list?.facets?.title?.textsettings?.fields?.normal?.typography_theme?.classname,
			'data-facets-title-style': this.data?.list?.facets?.title?.textsettings?.fields?.normal?.title_style?.value,
			'data-facets-title-styles': this.data?.list?.facets?.title?.textsettings?.styles?.normal,
			'data-facets-width': this.data?.list?.facets?.width?.value,
			'data-facet-theme': this.data?.list?.facets?.facet_styles?.typography_theme?.theme_available,
			'data-facet-theme-class': this.data?.list?.facets?.facet_styles?.typography_theme?.classname,
			'data-facet-style': this.data?.list?.facets?.facet_styles?.facet_style?.value,
			'data-facet-styles': this.getStylesFromGroup(this.data?.list?.facets?.facet_styles),
			'data-columns': [
				MMX.coerceNumber(this.data?.list?.columns?.mobile?.value, 2),
				MMX.coerceNumber(this.data?.list?.columns?.tablet?.value, 3),
				MMX.coerceNumber(this.data?.list?.columns?.desktop?.value, 4)
			].join(','),
			'data-show-details': this.data?.list?.details?.settings?.enabled ?? false,
			'data-show-detail-products': this.data?.list?.details?.show_total_products?.value,
			'data-show-detail-page': this.data?.list?.details?.show_current_page?.value,
			'data-show-detail-search': this.data?.list?.details?.show_search_term?.value,
			'data-product-show-image': this.data?.card?.image?.settings?.enabled ?? false,
			'data-product-image-type': this.data?.card?.image?.type?.value,
			'data-product-image-dimensions': this.data?.card?.image?.dimensions?.value,
			'data-product-image-fit': this.data?.card?.image?.fit?.value,
			'data-product-fallback-image': this.data?.fallback_product_image,
			'data-param-prefix': this.data?.advanced?.param_prefix?.value,
			'data-empty-results-message': this.data?.advanced?.empty_results_message?.value,
			'data-empty-results-message-source': this.data?.advanced?.empty_results_message?.source,
			'data-show-empty-results': this.data?.advanced?.show_empty_results?.value,
			'data-show-category-tree': this.data?.list?.facets?.show_category_tree?.value
		});

		this.#setParamPrefix();
		this.#loadProducts();
	}

	// Events
	afterRender() {
		this.#replaceProducts();
		this.#bindEvents();
		this.#debouncedAfterRender();
	}

	#debouncedAfterRender = MMX.debounce(() => {
		this.#notifyProductsRendered();
	}, 100);

	#bindComponentEvents() {
		this.#desktopBreakpoint.addEventListener('change', () => this.#onDesktopBreakpointChange());

		history.scrollRestoration = 'manual';
		addEventListener('popstate', (e) => this.#onPopState(e));
	}

	#onDesktopBreakpointChange() {
		this.#handleOpenMobileFacet();
		this.#handleFacetDetails();
	}

	#handleOpenMobileFacet() {
		if (this.#desktopBreakpoint.matches) {
			this.#closeFacetsDialog();
		}
	}

	#handleFacetDetails() {
		if (this.#desktopBreakpoint.matches) {
			this.#openFacetDetails();
		} else {
			this.#closeFacetDetails();
		}
	}

	#bindEvents() {
		this.#facetList()?.querySelectorAll('input, select')?.forEach(element => {
			element.addEventListener('input', () => this.#onManagedFacetInput());
		});

		this.#facetList()?.querySelectorAll('mmx-form-input-range')?.forEach(element => {
			element.addEventListener('input', () => this.#debouncedManagedFacetInput());
		});

		this.#managedDropdowns()?.forEach(dropdown => {
			dropdown.addEventListener('input', () => this.#onManagedDropdownInput(dropdown));
		});

		this.#managedLinks()?.forEach(link => {
			link.addEventListener('click', (e) => this.#onManagedLinkClick(e));
		});

		this.#facetValues()?.forEach(facetValue => {
			facetValue.addEventListener('click', (e) => this.#onFacetValueClick(e));
		});

		this.#facetsDialogOpen()?.addEventListener('click', () => {
			this.#onFacetsDialogOpenClick();
		});

		this.#facetsDialogClose()?.addEventListener('click', () => {
			this.#onFacetsDialogCloseClick();
		});

		this.#productCards()?.forEach((product, index) => {
			product.addEventListener('click', () => this.#onProductClicked({
				product: this.#products[index],
				index
			}));
		});
	}

	#debouncedManagedFacetInput = MMX.debounce(() => {
		this.#onManagedFacetInput();
	}, this.#debounceDelay);

	#onManagedFacetInput(){
		this.#submit();
	}

	#managedDropdowns() {
		return this.shadowRoot.querySelectorAll('[part~="pagination-select-dropdown"], [part~="per-page-select-dropdown"], [part~="sort-by-select-dropdown"]');
	}

	#onManagedDropdownInput(dropdown) {
		const urlOptions = {};
		urlOptions[dropdown.name] = dropdown.value;

		const url = this.#getDestinationUrl(urlOptions);
		this.#submit(url);
	}

	#managedLinks() {
		return this.shadowRoot.querySelectorAll('[part~="pagination"] mmx-button, [part~="facet-applied-values"] mmx-button, [part~="clear-all"]');
	}

	#onManagedLinkClick(e) {
		e.preventDefault();
		this.#submit(e.currentTarget.getAttribute('href'));
	}

	// Details
	#getDataCardDetails() {
		const details = this.#card?.details?.children;
		return Array.isArray(details) ? details : [];
	}

	// Prop Methods
	#getColumns() {
		const columns = this.getPropValue('columns');

		let [mobile, tablet, desktop] = columns.split(',').map(column => {
			return MMX.coerceNumber(column, 1);
		});

		mobile = MMX.coerceNumber(mobile, 1);
		tablet = MMX.coerceNumber(tablet, mobile);
		desktop = MMX.coerceNumber(desktop, mobile);

		return {
			mobile,
			tablet,
			desktop
		};
	}

	#getProductSet() {
		const productSet = this.getPropValue('product-set');

		if (productSet === 'merchandising') {
			return 'merchandising';
		}

		if (productSet === 'related' || (productSet === 'auto' && this.getPropValue('product-code'))) {
			return 'related';
		}

		if (productSet === 'category' || (productSet === 'auto' && this.getPropValue('category-code'))) {
			return 'category';
		}

		if (productSet === 'search' || (productSet === 'auto' && !MMX.valueIsEmpty(this.#getSearch()))) {
			return 'search';
		}

		return 'all';
	}

	// Product List Load Query Methods
	#setLoading() {
		this.#container()?.classList?.add?.('is-loading');
	}

	#clearLoading() {
		this.#container()?.classList?.remove?.('is-loading');
	}

	#container() {
		return this.shadowRoot.querySelector('.mmx-product-list');
	}

	#loadProducts() {
		this.#products = [];
		this.#facets = [];
		this.#errorMessage = undefined;
		this.#clearPagination();
		this.#setLoading();

		MMX.Runtime_JSON_API_Call({
			params: this.#getListLoadQueryParams()
		})
		.then(response => {
			this.#productsLoaded(response);
		})
		.catch(response => {
			this.#productsFailedToLoad(response);
		})
		.finally(() => {
			this.#clearLoading();
		});
	}

	#productsLoaded(response) {
		this.#products = response.data.data;
		this.#initializeFacets(response.data.facets);
		this.#setPagination(response);
		this.forceUpdate();
		this.#notifyProductsLoaded();
	}

	#productsFailedToLoad(response) {
		this.#errorMessage = response.error_message;
		this.forceUpdate();
	}

	#notifyProductsRendered() {
		if (!this.#products?.length) {
			return;
		}

		this.#products.forEach(product => {
			window?.MivaEvents?.ThrowEvent?.('price_changed', {
				product_code: product.code,
				price: product.price,
				additional_price: product.base_price
			});
		});
	}

	#notifyProductsLoaded() {
		this.dispatchEvent(new CustomEvent('view_item_list', {
			bubbles: true,
			composed: true,
			detail: {
				item_list_id: this.id,
				item_list_name: this.data?.heading?.heading_text?.value,
				products: this.#products,
				element: this
			}
		}));
	}

	#onProductClicked({product, index} = {}) {
		this.#notifyProductClicked({product, index});
	}

	#notifyProductClicked({product, index} = {}) {
		product.index = index + 1;
		this.dispatchEvent(new CustomEvent('select_item', {
			bubbles: true,
			composed: true,
			detail: {
				item_list_id: this.id,
				item_list_name: this.data?.heading?.heading_text?.value,
				products: [product],
				element: this
			}
		}));
	}

	#getListLoadQueryParams() {
		return {
			function: this.#getListLoadQueryFunction(),
			count: this.#getPerPage(),
			sort: this.#getSortBy(),
			offset: this.#getOffset(),
			filter: this.#getListLoadQueryFilters(),
			product_code: this.getPropValue('product-code'),
			category_code: this.getPropValue('category-code'),
			...this.#getMerchandisingParams()
		};
	}

	#getListLoadQueryFunction() {
		const productSet = this.#getProductSet();

		if (productSet === 'category') {
			return 'Runtime_CategoryProductList_Load_Query';
		}

		if (productSet === 'related') {
			return 'Runtime_RelatedProductList_Load_Query';
		}

		if (productSet === 'merchandising') {
			return 'Runtime_MerchandisingProductList_Load_Query';
		}

		return 'Runtime_ProductList_Load_Query';
	}

	#getListLoadQueryFilters() {
		return [
			...this.#getDetailsFilters(),
			...this.#getImageFilters(),
			...this.#getSearchFilters(),
			...this.#getFacetFilters()
		];
	}

	#getDetailsFilters() {
		const details = this.#getDataCardDetails();
		const filters = details.reduce((filters, detail) => {
			const type = detail?.type?.value;

			if (typeof type !== 'string'){
				return filters;
			}

			if (type === 'descrip') {
				filters.push({
					name: 'ondemandcolumns',
					value: ['descrip']
				});
			}

			if (type === 'customfield' && !MMX.valueIsEmpty(detail?.customfield?.value)) {
				filters.push({
					name: 'ondemandcolumns',
					value: [`CustomField_Values:${detail.customfield.value}`]
				});
			}

			if (type === 'fragment' && !MMX.valueIsEmpty(detail?.fragment?.value)) {
				filters.push({
					name: 'fragments',
					value: [detail.fragment.value]
				});
			}

			if (type === 'discounts') {
				filters.push({
					name: 'ondemandcolumns',
					value: ['discounts']
				});
			}

			if (type === 'price') {
				filters.push({
					name: 'ondemandcolumns',
					value: ['sale_price']
				});
			}

			if (['inv_short', 'inv_long', 'inv_available'].includes(type)) {
				filters.push({
					name: 'ondemandcolumns',
					value: ['inventory']
				});
			}

			return filters;
		}, []);

		return filters;
	}

	#getImageFilters() {
		if (!this.getPropValue('product-show-image')) {
			return '';
		}

		return [{
			name: 'imagetypes',
			value: {
				types: [this.getPropValue('product-image-type')],
				sizes: ['original', this.getPropValue('product-image-dimensions')]
			}
		}];
	}

	#getSearchFilters() {
		const search = this.#getSearch();
		if (this.#getProductSet() === 'merchandising' || MMX.valueIsEmpty(search)) {
			return [];
		}

		return [{
			name: 'runtime_search',
			value: {
				search: search,
				origin: this.#searchOrigin,
				type: this.#searchType,
				index: this.#searchIndex
			}
		}];
	}

	#getFacetFilters() {
		if (!this.getPropValue('show-facets')) {
			return [];
		}

		return [
			{
				name: 'ondemandcolumns',
				value: ['facets']
			},
			{
				name: 'facets',
				value: this.#getAppliedValuesFromUrl()
			}
		];
	}

	#getMerchandisingParams()
	{
		if (this.#getProductSet() !== 'merchandising') {
			return {};
		}

		const params = {
			MerchandisingPrompt_Code: this.getPropValue('merchandisingprompt-code'),
			MerchandisingPrompt_Context: {
				product_id: this.getPropValue('merchandisingprompt-context-product-id'),
				category_id: this.getPropValue('merchandisingprompt-context-category-id')
			}
		};

		return params;
	}

	#getAppliedValuesFromUrl() {
		const values = {};
		const url = this.#getUrlFromLocation();

		url.searchParams.forEach((value, name) => {
			const unScopedName = this.#unScopeParam(name);

			if (this.#commonParamsToExclude.includes(unScopedName)){
				return;
			}

			if (!this.#isScopedParam(name)) {
				return;
			}

			if (Array.isArray(values[unScopedName])) {
				values[unScopedName].push(value);
			} else {
				values[unScopedName] = [value];
			}
		});

		return values;
	}

	// Main
	#renderMain() {
		const totalProducts = this.#pagination?.totals?.products;
		const totalFacets = this.#facets?.length;

		if (this.#errorMessage) {
			return this.#renderMainError();
		}
		else if (totalProducts > 0 || totalFacets > 0) {
			return this.#renderMainValid();
		}
		else if (totalProducts === 0 && totalFacets === 0) {
			return this.#renderMainEmpty();
		}
		else {
			return this.#renderMainLoading();
		}
	}

	#renderMainValid() {
		return /*html*/`
			<div part="main" class="mmx-product-list__main">
				${this.#renderHeader()}
				${this.#renderProducts()}
				${this.#renderFooter()}
				${this.#renderFacets()}
			</div>
		`;
	}

	#renderMainError() {
		return /*html*/`
			<div part="error" class="mmx-product-list__error">
				<mmx-message data-style="warning">We're unable to display the products: ${MMX.encodeEntities(this.#errorMessage ?? 'There was a problem loading the products')}</mmx-message>
			</div>
		`;
	}

	#renderMainEmpty() {
		const message = this.getPropValue('empty-results-message');
		const source = this.getPropValue('empty-results-message-source');

		if (MMX.valueIsEmpty(message)) {
			return '';
		}

		return /*html*/`
			<div part="empty" class="mmx-product-list__empty">
				<mmx-message data-style="info">${source === 'markdown' ? message : MMX.encodeEntities(message)}</mmx-message>
			</div>
		`;
	}

	#renderMainLoading() {
		return /*html*/`
			<div part="loading" class="mmx-product-list__loading"></div>
		`;
	}

	// Header
	#renderHeader() {
		if (!this.getPropValue('show-facets') && !this.getPropValue('show-details') && !this.getPropValue('show-per-page') && !this.getPropValue('show-sort-by')) {
			return '';
		}

		return /*html*/`
			<div
				class="mmx-product-list__header"
				part="header"
			>
				${this.#renderFacetsDialogOpen()}
				${this.#renderDetails()}
				${this.#renderPerPageSortBy()}
			</div>
		`;
	}

	// List Details
	#renderDetails() {
		if (!this.getPropValue('show-details') || typeof this.#pagination?.totals === 'undefined') {
			return '';
		}

		const search = this.#getSearch();

		return /*html*/`
			<div part="details" class="mmx-product-list__details">
				${this.getPropValue('show-detail-search') && search?.length ? /*html*/`
					<div part="detail detail-search-term" class="mmx-product-list__detail">
						Search: "${MMX.encodeEntities(search)}"
					</div>
				` : ''}
				${this.getPropValue('show-detail-products') ? /*html*/`<div part="detail detail-total-products" class="mmx-product-list__detail">
					${MMX.encodeEntities(this.#pagination.totals.products)} ${MMX.pluralize('Item', this.#pagination.totals.products)}
				</div>` : ''}
				${this.getPropValue('show-detail-page') ? /*html*/`<div part="detail detail-current-page" class="mmx-product-list__detail">
					Page ${MMX.encodeEntities(this.#pagination.pages.current)} of ${MMX.encodeEntities(this.#pagination.pages.last)}
				</div>` : ''}
			</div>
		`;
	}

	#renderPerPageSortBy() {
		if (!this.getPropValue('show-per-page') && !this.getPropValue('show-sort-by')) {
			return '';
		}

		return /*html*/`
			<div
				class="mmx-product-list__per-page-sort-by"
				part="per-page-sort-by"
			>
				${this.#renderPerPage()}
				${this.#renderSortBy()}
			</div>
		`;
	}

	// Per Page
	#renderPerPage() {
		if (!this.getPropValue('show-per-page')) {
			return '';
		}

		return /*html*/`
			<div
				class="mmx-product-list__per-page"
				part="per-page"
			>
				<label
					class="mmx-form-label mmx-form-label--required"
					part="per-page-label"
				>
					View:
				</label>
				<div
					class="mmx-form-select mmx-form-select--minimal"
					part="per-page-select"
				>
					<select
						name="Per_Page"
						class="mmx-form-select__dropdown"
						part="per-page-select-dropdown"
						title="Products Per Page Options"
						required
					>
						${this.#perPageOptions.map(option => this.#renderPerPageOption(option)).join('')}
					</select>
				</div>
			</div>
		`;
	}

	#renderPerPageOption(option = {}) {
		const value = option?.amount?.value;
		const label = option?.label?.value;
		const selected = value == this.#getPerPage() ? 'selected' : '';
		return /*html*/`
			<option value="${MMX.encodeEntities(value)}" ${selected}>${label}</option>
		`;
	}

	// Sort By
	#sortValueLabelMap = {
		relevance: 'Relevance',
		disp_order: 'Display Order',
		disp_order_desc: 'Display Order Descending',
		newest: 'Newest',
		oldest: 'Oldest',
		updated: 'Recently Updated',
		code_asc: 'Code Ascending',
		code_desc: 'Code Descending',
		name_asc: 'Name Ascending',
		name_desc: 'Name Descending',
		price_asc: 'Price Ascending',
		price_desc: 'Price Descending',
		bestsellers: 'Best Sellers'
	};

	#renderSortBy() {
		if (!this.getPropValue('show-sort-by')) {
			return '';
		}

		return /*html*/`
			<div
				class="mmx-product-list__sort-by"
				part="sort-by"
			>
				<label
					class="mmx-form-label mmx-form-label--required"
					part="sort-by-label"
				>
					Sort By:
				</label>
				<div
					class="mmx-form-select mmx-form-select--minimal"
					part="sort-by-select"
				>
					<select
						name="Sort_By"
						class="mmx-form-select__dropdown"
						part="sort-by-select-dropdown"
						title="Sort By Options"
						required
					>
						${this.#sortByOptions.map(option => this.#renderSortByOption(option)).join('')}
					</select>
				</div>
			</div>
		`;
	}

	#renderSortByOption(option = {}) {
		const value = option?.code?.value;
		const label = option?.label?.value ?? this.#sortValueLabelMap[value];
		const selected = value === this.#getSortBy() ? 'selected' : '';
		return /*html*/`
			<option value="${MMX.encodeEntities(value)}" ${selected}>${label}</option>
		`;
	}

	// Products
	#renderProducts() {
		return /*html*/`
			<div
				class="mmx-product-list__products"
				part="products"
			>
				${this.#pagination?.totals?.products > 0 ? /*html*/`<slot name="products"></slot>` : this.#renderMainEmpty()}
			</div>
		`;
	}

	#productsContainer() {
		return this.querySelector('[slot="products"]');
	}

	#replaceProducts() {
		this.renderContentIntoLightDomSlot({slotName: 'products', content: ''});
		this.#productsContainer()?.replaceChildren?.(this.#createProducts());
	}

	#createProducts() {
		if (!Array.isArray(this.#products)){
			return '';
		}

		const parent = new DocumentFragment();
		const details = this.#getDataCardDetails();
		const attributes = {
			'data-adpr-url': this.getPropValue('adpr-url'),
			'data-fallback-image': this.getPropValue('product-fallback-image'),
			'data-image-dimensions': this.getPropValue('product-image-dimensions'),
			'data-image-fit': this.getPropValue('product-image-fit'),
			'data-image-type': this.getPropValue('product-image-type'),
			'data-show-image': this.getPropValue('product-show-image'),
			'data-atwl-url': this.getPropValue('atwl-url')
		};

		const content = /*html*/`
			${this.renderThemeStylesheetTemplate(true)}
		`;

		this.#products.forEach(product => {
			attributes['data-product-code'] = product.code;
			MMX_ProductCard.create({product, details, parent, attributes, content});
		});

		return parent;
	}

	#productCards() {
		return this.querySelectorAll('mmx-product-card');
	}

	// Product List Parameters
	#setParamPrefix() {
		const prefix = this.getPropValue('param-prefix');

		if (!MMX.valueIsEmpty(prefix)) {
			return this.#paramPrefix = prefix;
		}

		const productLists = document.querySelectorAll('mmx-product-list:not([data-param-prefix])');
		const myProductListIndex = Array.from(productLists).findIndex(productList => {
			return productList === this;
		});

		if (myProductListIndex <= 0) {
			return this.#paramPrefix = undefined;
		}

		return this.#paramPrefix = `ProductList${myProductListIndex}_`;
	}

	#scopeParam(param) {
		return this.#paramPrefix ? `${this.#paramPrefix}${param}` : param;
	}

	#unScopeParam(param) {
		if (!this.#paramPrefix) {
			return param;
		}

		const paramPattern = new RegExp(`^${this.#paramPrefix}`);
		return param.replace(paramPattern, '');
	}

	#isScopedParam(param) {
		return typeof this.#paramPrefix === 'undefined' || param.indexOf(this.#paramPrefix) === 0;
	}

	#getUrlFromLocation() {
		return new URL(window.location.href);
	}

	#buildUrlToSelf({Per_Page, Sort_By, Offset, omitFacets = false} = {}) {
		const url = this.#getUrlFromLocation();

		// Per Page
		const perPage = MMX.coerceNumber(Per_Page, this.#getPerPage());
		const perPageParam = this.#scopeParam('Per_Page');
		url.searchParams.delete(perPageParam);
		if (perPage !== this.getPropValue('per-page')) {
			url.searchParams.set(perPageParam, perPage);
		}

		// Sort By
		const sortBy = Sort_By ?? this.#getSortBy();
		const sortByParam = this.#scopeParam('Sort_By');
		url.searchParams.delete(sortByParam);
		if (sortBy !== this.getPropValue('sort-by')) {
			url.searchParams.set(sortByParam, sortBy);
		}

		// Offset
		const offset = MMX.coerceNumber(Offset, this.#getOffset());
		const offsetParam = this.#scopeParam('Offset');
		url.searchParams.delete(offsetParam);
		if (offset !== this.getPropValue('offset')) {
			url.searchParams.set(offsetParam, offset);
		}

		// Facets
		this.#facets.forEach(facet => {
			const facetParam = this.#scopeParam(facet.code);
			url.searchParams.delete(facetParam);

			if (omitFacets) {
				return;
			}

			facet.appliedValues.forEach(appliedValue => {
				url.searchParams.append(facetParam, appliedValue);
			});
		});

		return url;
	}

	#getDestinationUrl({Per_Page, Sort_By, Offset, omitFacets} = {}) {
		const url = this.#buildUrlToSelf({Per_Page, Sort_By, Offset, omitFacets});

		if (MMX.valueIsEmpty(Offset)) {
			url.searchParams.delete(this.#scopeParam('Offset'));
		}

		this.#facets.forEach(facet => {
			url.searchParams.delete(this.#scopeParam(facet.code));
		});

		const facetFormData = new FormData(this.#facetForm());

		for (const [facetCode, value] of facetFormData.entries()) {
			if (!this.#hasValidFacetValue({facetCode, value})) {
				continue;
			}

			url.searchParams.append(this.#scopeParam(facetCode), value);
		}

		return url;
	}

	#submit(url = this.#getDestinationUrl()) {
		if (this.getPropValue('submit-method') === 'replace') {
			this.#submitReplace(url);
			return;
		}

		this.#submitReload(url);
	}

	#submitReplace(url) {
		const state = {};

		if (this.hasAttribute('id')) {
			state[this.constructor.name] = this.id;
		}

		history.pushState(state, '', url);

		this.#scrollIntoView();
		this.#loadProducts();
	}

	#scrollIntoView() {
		this.scrollIntoView({
			behavior: 'smooth'
		});
	}

	#onPopState(e) {
		const shouldScrollIntoView = e.state?.[this.constructor.name] === this.id;

		if (shouldScrollIntoView) {
			this.#scrollIntoView();
		}

		this.#loadProducts();
	}

	#submitReload(url) {
		window.location = url;
	}

	#getParameter(name) {
		const url = this.#getUrlFromLocation();
		return url.searchParams.get(this.#scopeParam(name));
	}

	#getSortBy() {
		return this.#getParameter('Sort_By') ?? this.getPropValue('sort-by');
	}

	#getPerPage() {
		return MMX.coerceNumber(this.#getParameter('Per_Page') ?? this.getPropValue('per-page'));
	}

	#getOffset() {
		return MMX.coerceNumber(this.#getParameter('Offset') ?? this.getPropValue('offset'));
	}

	#getSearch() {
		return this.#getParameter('Search') ?? this.getPropValue('search');
	}

	// Footer
	#renderFooter() {
		if (!this.getPropValue('show-pagination')) {
			return '';
		}

		return /*html*/`
			<div
				class="mmx-product-list__footer"
				part="footer"
			>
				${this.#renderPagination()}
			</div>
		`;
	}

	// Pagination: State
	#clearPagination() {
		this.#pagination = {};
	}

	#setPagination(response) {
		const pagination = {
			perPage: this.#getPerPage(),
			pages: {},
			offsets: {},
			totals: {},
			links: []
		};

		pagination.totals.products = MMX.coerceNumber(response.data.total_count);
		pagination.totals.productsOnPage = MMX.coerceNumber(response?.data?.data?.length);
		pagination.totals.pages = Math.ceil(pagination.totals.products / pagination.perPage);

		pagination.offsets.current = MMX.coerceNumber(response.data.start_offset);

		pagination.offsets.next = pagination.offsets.current + pagination.perPage;
		pagination.offsets.next = pagination.offsets.next > pagination.totals.products ? null : pagination.offsets.next;

		pagination.offsets.previous = pagination.offsets.current - pagination.perPage;
		pagination.offsets.previous = pagination.offsets.previous < 0 ? null : pagination.offsets.previous;

		pagination.pages.first = 1;
		pagination.pages.last = pagination.totals.pages;

		pagination.pages.current = Math.floor((pagination.offsets.current / pagination.perPage) + 1);

		pagination.pages.isOnFirst = pagination.pages.current === pagination.pages.first;
		pagination.pages.isOnLast = pagination.pages.current === pagination.pages.last;

		pagination.pages.next = pagination.pages.current + 1;
		pagination.pages.next = pagination.pages.next > pagination.totals.pages ? null : pagination.pages.next;

		pagination.pages.previous = pagination.pages.current - 1;
		pagination.pages.previous = pagination.pages.previous < 1 ? null : pagination.pages.previous;

		pagination.links = {
			list: this.#buildPaginationLinks(pagination)
		};

		pagination.links.first = pagination.links.list.at(0);
		pagination.links.last = pagination.links.list.at(-1);

		pagination.links.previous = pagination.pages.previous === null ? null : pagination.links.list.at(pagination.pages.previous - 1);
		pagination.links.next = pagination.pages.next === null ? null : pagination.links.list.at(pagination.pages.next - 1);

		this.#pagination = pagination;
	}

	#buildPaginationLinks(pagination = {}) {
		const links = [];
		const linkCount = this.getPropValue('pagination-page-link-count');
		const linkCountPeek = Math.floor(linkCount / 2);
		let displayMin = Math.max(1, pagination.pages.current - linkCountPeek + 1);
		let displayMax = Math.min(pagination.pages.last, pagination.pages.current + linkCountPeek - 1);

		if (displayMin === 1) {
			displayMax = Math.min(pagination.pages.last, displayMin + linkCount - 2);
		}

		if (displayMax === pagination.pages.last) {
			displayMin = Math.max(1, displayMax - linkCount + 2);
		}

		for (let page = 1; page <= pagination.totals.pages; page++) {
			const link = {};

			link.page = page;
			link.isFirst = link.page === 1;
			link.isLast = link.page === pagination.pages.last;
			link.shouldDisplay = link.isFirst || link.isLast || (link.page >= displayMin && link.page <= displayMax);
			link.offset =  pagination.perPage * (page - 1);
			link.isCurrentPage = pagination.offsets.current === link.offset;

			link.url = this.#buildUrlToSelf();
			if (link.offset === 0) {
				link.url.searchParams.delete(this.#scopeParam('Offset'));
			} else {
				link.url.searchParams.set(this.#scopeParam('Offset'), link.offset);
			}

			link.suffix = link.isFirst && displayMin > 2 ? '...' : '';
			link.prefix = link.isLast && displayMax < (pagination.pages.last - 1) ? '...' : '';
			link.text = link.prefix + link.page + link.suffix;

			links.push(link);
		}

		return links;
	}

	#paginationSupported() {
		return this.getPropValue('show-pagination') && this.#hasMultiplePages();
	}

	#hasMultiplePages() {
		return MMX.coerceNumber(this.#pagination?.totals?.pages) > 1;
	}

	// Pagination: Dropdown
	#renderPagination() {
		if (!this.#paginationSupported()){
			return '';
		}

		return /*html*/`
			<div
				class="mmx-product-list__pagination"
				part="pagination"
			>
				${this.#renderPaginationPreviousButton()}
				${this.#renderPaginationType()}
				${this.#renderPaginationNextButton()}
			</div>
		`;
	}

	#renderPaginationType(type = this.getPropValue('pagination-page-numbers')) {
		let links = '';

		if (type === 'dropdown') {
			links = this.#renderPaginationTypeDropdown();
		}
		else if (type === 'links') {
			links = this.#renderPaginationTypeLinks();
		}
		else {
			return '';
		}

		return /*html*/`
			<div
				part="pagination-page-numbers pagination-page-numbers-${MMX.encodeEntities(type)}"
			>
				${links}
			</div>
		`;
	}

	#renderPaginationTypeDropdown() {
		return /*html*/`
			<div
				class="mmx-form-select"
				part="pagination-select"
			>
				<select
					name="Offset"
					class="mmx-form-select__dropdown"
					part="pagination-select-dropdown"
					title="Pagination Current Page"
					required
				>
					${this.#renderPaginationOptions()}
				</select>
			</div>
		`;
	}

	#renderPaginationOptions() {
		let options = '';

		for (let index = 1; index <= this.#pagination.totals.pages; index++) {
			const offset = (index - 1) * this.#pagination.perPage;
			const selected = this.#pagination.offsets.current === offset ? 'selected' : '';
			const label = `Page ${index} of ${this.#pagination.totals.pages}`;

			options += /*html*/`<option value="${offset}" ${selected}>${label}</option>`;
		}

		return options;
	}

	#renderPaginationTypeLinks() {
		return this.#pagination.links.list.map(link => {
			if (!link.shouldDisplay) {
				return '';
			}

			return /*html*/`
				<mmx-button
					data-style="display-link"
					data-shape="round"
					href="${MMX.encodeEntities(link.url)}"
					class="mmx-product-list__pagination-page ${link.isCurrentPage ? 'hover' : ''}"
					part="pagination-page ${link.isCurrentPage ? 'pagination-page-current' : ''}"
				>
					${link.text}
				</mmx-button>
			`;
		}).join('');
	}

	// Pagination: Previous Button
	#renderPaginationPreviousButton() {
		const nextPreviousType = this.getPropValue('pagination-next-previous');

		if (nextPreviousType === 'none' || !this.#pagination.links.previous) {
			return '';
		}

		const text = this.getPropValue('pagination-previous-text');

		return /*html*/`
			<mmx-button
				part="pagination-previous"
				class="mmx-product-list__pagination-previous"
				data-style="display-link"
				data-shape="${nextPreviousType === 'arrows' ? 'round' : ''}"
				title="${MMX.encodeEntities(text)} Page"
				href="${MMX.encodeEntities(this.#pagination.links.previous.url)}"
			>
				${nextPreviousType === 'arrows' ? /*html*/`<mmx-icon part="pagination-previous-icon" data-name="chevron-left">${MMX.encodeEntities(text)} Page</mmx-icon>` : MMX.encodeEntities(text)}
			</mmx-button>
		`;
	}

	// Pagination: Next Button
	#renderPaginationNextButton() {
		const nextPreviousType = this.getPropValue('pagination-next-previous');

		if (nextPreviousType === 'none' || !this.#pagination.links.next) {
			return '';
		}

		const text = this.getPropValue('pagination-next-text');

		return /*html*/`
			<mmx-button
				part="pagination-next"
				class="mmx-product-list__pagination-next"
				data-style="display-link"
				data-shape="${nextPreviousType === 'arrows' ? 'round' : ''}"
				href="${MMX.encodeEntities(this.#pagination.links.next.url)}"
				title="${MMX.encodeEntities(text)} Page"
			>
				${nextPreviousType === 'arrows' ? /*html*/`<mmx-icon part="pagination-next-icon" data-name="chevron-right">${MMX.encodeEntities(text)} Page</mmx-icon>` : MMX.encodeEntities(text)}
			</mmx-button>
		`;
	}

	// Pagination: Methods
	goToPreviousPage() {
		this.goToPage(this.#pagination?.pages?.previous);
	}

	goToNextPage() {
		this.goToPage(this.#pagination?.pages?.next);
	}

	goToPage(page = 1) {
		if (!this.#paginationSupported() || isNaN(page)) {
			return;
		}

		if (page < 1) {
			page = 1;
		}

		if (page > this.#pagination.totals.pages) {
			page = this.#pagination.totals.pages;
		}

		const url = this.#pagination.links.list.at(page - 1)?.url;

		if (!url) {
			return;
		}

		this.#submit(url);
	}

	// Render: Facets
	#initializeFacets(facetObject = {}) {
		const facetArray = [];
		const url = this.#getUrlFromLocation();
		this.#appliedFacetValueCount = 0;

		for (const facetCode in facetObject) {
			const facet = facetObject[facetCode];
			facet.code = facetCode;

			facet.appliedValues = url.searchParams.getAll(this.#scopeParam(facet.code));
			facet.appliedValuesCount = facet.appliedValues.length;
			this.#appliedFacetValueCount += facet.appliedValuesCount;

			facet.applied = facet.applied_values?.reduce((applied, value, i) => {
				applied.push({
					value,
					prompt: facet.applied_prompts[i],
					selected: true
				});

				return applied;
			}, []) ?? [];

			facet.selectedValues = this.#determineSelectedValues({facet});

			facetArray.push(facet);
		}

		facetArray.sort((left, right) => {
			if (left.priority < right.priority)			return 1;
			else if	(left.priority > right.priority)	return -1;
			else if (left.name < right.name)			return -1;
			else if	(left.name > right.name)			return 1;
			else										return 0;
		});

		this.#facets = facetArray;
	}

	#determineSelectedValues({facet}) {
		if (facet.type !== 'rangeslider') {
			return facet?.values?.filter?.(facetValue => facetValue.selected);
		}

		if (facet.selected_value_low === 0 && facet.selected_value_high === 0) {
			return [];
		}

		const value = `${facet.selected_value_low}-${facet.selected_value_high}`;
		const prompt = facet.formatting === 'currency' ? `${MMCurrencyFormatter(facet.selected_value_low, true)} - ${MMCurrencyFormatter(facet.selected_value_high, true)}` : `${facet.selected_value_low} - ${facet.selected_value_high}`;

		return [{
			value,
			prompt
		}];
	}

	#hasValidFacetValue({facetCode, value} = {}) {
		const facet = this.#getFacetByCode(facetCode);

		if (!facet) {
			return false;
		}

		if (facet.type === 'rangeslider') {
			return this.#hasValidRangeFacetValue({facet, value});
		}

		return !MMX.valueIsEmpty(value);
	}

	#hasValidRangeFacetValue({facet, value} = {}) {
		if (value === '0-0') {
			return false;
		}

		const defaultMinMaxValue = `${facet.value_low}-${facet.value_high}`;
		if (value === defaultMinMaxValue) {
			return false;
		}

		return !MMX.valueIsEmpty(value);
	}

	#getFacetByCode(code) {
		return this.#facets.find(facet => {
			return facet.code === code;
		});
	}

	#facetForm() {
		return this.shadowRoot.querySelector('[part~="facets-form"]');
	}

	#renderFacets() {
		if (!this.getPropValue('show-facets') && !this.getPropValue('show-per-page') && !this.getPropValue('show-sort-by')) {
			return '';
		}

		return /*html*/`
			<dialog
				part="facets facets-dialog"
				class="mmx-product-list__facets mmx-product-list__facets-dialog"
			>
				<form
					part="facets-form"
					class="mmx-product-list__facets-form"
				>
					${this.#renderFacetsHeader()}
					${this.#renderPerPageSortBy()}
					${this.#renderAppliedFacets()}
					${this.#renderFacetsList()}
					${this.#renderCategoryTree()}
				</form>
				<mmx-button
					part="facets-dialog-close"
					class="mmx-product-list__facets-dialog-close"
					data-style="display-link"
					data-shape="round"
					title="Close Dialog?"
				>
					<mmx-icon>cross</mmx-icon>
				</mmx-button>
			</dialog>
		`;
	}

	#facetsDialog() {
		return this.shadowRoot.querySelector('[part~="facets-dialog"]');
	}

	#renderFacetsDialogOpen() {
		if (!this.getPropValue('show-facets') && !this.getPropValue('show-per-page') && !this.getPropValue('show-sort-by')) {
			return '';
		}

		return /*html*/`
			<mmx-button
				data-style="secondary"
				data-size="xs"
				part="facets-dialog-open"
				class="mmx-product-list__facets-dialog-open"
			>
				<mmx-icon>controls</mmx-icon>
				${MMX.encodeEntities(this.getPropValue('facets-title'))}
			</mmx-button>
		`;
	}

	#facetsDialogOpen() {
		return this.shadowRoot.querySelector('[part~="facets-dialog-open"]');
	}

	#onFacetsDialogOpenClick() {
		this.#openFacetsDialog();
	}

	#openFacetsDialog() {
		this.#facetsDialog()?.showModal();
	}

	#facetsDialogClose() {
		return this.shadowRoot.querySelector('[part~="facets-dialog-close"]');
	}

	#onFacetsDialogCloseClick() {
		this.#closeFacetsDialog();
	}

	#closeFacetsDialog() {
		this.#facetsDialog()?.close();
	}

	#facetDetails() {
		return this.shadowRoot.querySelectorAll('[part~="facets"] details');
	}

	#openFacetDetails() {
		this.#facetDetails()?.forEach(detail => {
			detail.open = true;
		});
	}

	#closeFacetDetails() {
		this.#facetDetails()?.forEach(detail => {
			detail.open = false;
		});
	}

	// Render: Facets Header
	#renderFacetsHeader() {
		const theme_available = this.getPropValue('facets-title-theme');

		return /*html*/`
			<div
				class="mmx-product-list__facets-header"
				part="facets-header"
			>
				<mmx-text
					class="mmx-product-list__facets-title"
					part="facets-title"
					data-theme="${MMX.encodeEntities(theme_available)}"
					data-theme-class="${MMX.encodeEntities(this.getPropValue('facets-title-theme-class'))}"
					data-style="${MMX.encodeEntities(this.getPropValue('facets-title-style'))}"
				>
					${this.renderLegacyStylesTemplate(theme_available, this.getPropValue('facets-title-styles'))}
					${this.renderThemeStylesheetTemplate(theme_available)}
					${MMX.encodeEntities(this.getPropValue('facets-title'))}
				</mmx-text>

				${this.#renderClearAllFacetsLink()}
			</div>
		`;
	}

	#renderClearAllFacetsLink() {
		if (this.#appliedFacetValueCount === 0) {
			return '';
		}

		const url = this.#buildUrlToSelf({Offset: 0, omitFacets: true});

		return /*html*/`
			<mmx-button
				part="clear-all"
				class="mmx-product-list__clear-all"
				data-style="secondary-link"
				href="${MMX.encodeEntities(url)}"
			>
				<mmx-icon data-size="0.75em" data-name="cross"></mmx-icon> Clear All
			</mmx-button>
		`;
	}

	// Render: Applied Facets
	#renderAppliedFacets() {
		const appliedFacets = this.#facets.map(facet => this.#renderAppliedFacet(facet)).join('');

		if (MMX.valueIsEmpty(appliedFacets)) {
			return '';
		}

		return /*html*/`
			<div
				class="mmx-product-list__facet-applied-values"
				part="facet-applied-values"
			>
				${appliedFacets}
			</div>
		`;
	}

	#renderAppliedFacet(facet = {}) {
		return facet.selectedValues.map(facetValue => {
			return this.#renderAppliedFacetValue({facet, facetValue});
		}).join('');
	}

	#renderAppliedFacetValue({facet, facetValue} = {}) {
		const clearFacetUrl = this.#getUrlToClearFacet({facet, facetValue});

		return /*html*/`
			<mmx-button
				data-style="pill"
				title='Remove "${MMX.encodeEntities(facetValue.prompt)}"?'
				href="${MMX.encodeEntities(clearFacetUrl)}"
			>
				<mmx-icon data-size="0.75em" data-name="cross"></mmx-icon>
				${facetValue.prompt}
			</mmx-button>
		`;
	}

	#getUrlToClearFacet({facet, facetValue} = {}) {
		const removeUrl = this.#buildUrlToSelf({Offset: 0});
		removeUrl.searchParams.delete(this.#scopeParam(facet?.code), facetValue?.value);
		return removeUrl;
	}

	#facetList() {
		return this.shadowRoot.querySelector('[part~="facet-list"]');
	}

	#renderFacetsList() {
		return /*html*/`
			<mmx-accordion
				part="facet-list"
				class="mmx-product-list__facet-list"
				data-border-location="underline"
				data-icon-location="right"
			>
				${this.#facets.map(facet => {
					return this.#renderFacet(facet);
				}).join('')}
			</mmx-accordion>
		`;
	}

	// Render: Facet
	#renderFacet(facet = {}) {
		const theme_available = this.getPropValue('facet-theme');

		return /*html*/`
			<details
				slot="details"
				part="facet facet--${MMX.encodeEntities(facet.code)}"
				class="mmx-product-list__facet mmx-accordion__details"
				${this.#desktopBreakpoint.matches ? 'open' : ''}
			>
				<summary class="mmx-accordion__heading">
					<mmx-text
						class="mmx-product-list__facet-title mmx-accordion__heading-text"
						part="facet-title"
						data-theme="${MMX.encodeEntities(theme_available)}"
						data-theme-class="${MMX.encodeEntities(this.getPropValue('facet-theme-class'))}"
						data-style="${MMX.encodeEntities(this.getPropValue('facet-style'))}"
					>
						${this.renderLegacyStylesTemplate(theme_available, this.getPropValue('facet-styles'))}
						${this.renderThemeStylesheetTemplate(theme_available)}
						${facet?.name}
					</mmx-text>
					<mmx-icon
						class="mmx-accordion__heading-icon-open"
						data-name="subtract"
					></mmx-icon>
					<mmx-icon
						class="mmx-accordion__heading-icon-closed"
						data-name="add"
					></mmx-icon>
				</summary>
				<div class="mmx-accordion__content">
					${this.#renderFacetValuesByType(facet)}
				</div>
			</details>
		`;
	}

	#renderFacetValuesByType(facet) {
		if (facet.type === 'select') {
			return this.#renderFacetValuesSelect(facet);
		}

		if (facet.type === 'nested') {
			return this.#renderFacetValuesNested(facet);
		}

		if (facet.type === 'rangeslider') {
			return this.#renderFacetValueRange(facet);
		}

		return this.#renderFacetValuesControls(facet);
	}

	// Radio/Checkbox Facet
	#renderFacetValuesControls(facet) {
		return /*html*/`
			<fieldset
				class="mmx-product-list__facet-values mmx-form-fieldset"
				part="facet-values facet-values-list"
			>
				${facet?.values?.map(facetValue => this.#renderFacetValueControl({facet, facetValue})).join('')}
			</fieldset>
		`;
	}

	#renderFacetValueControl({facet, facetValue, depth = 0} = {}) {
		const controlType = facet.type === 'radio' ? 'radio' : 'checkbox';
		const checked = facetValue.selected ? 'checked' : '';
		depth = MMX.coerceNumber(depth);

		return /*html*/`
			<label
				class="mmx-product-list__facet-value mmx-form-${controlType}"
				part="facet-value"
				style="--mmx-product-list__facet-value-depth: ${depth};"
				data-depth="${depth}"
			>
				<input
					type="${controlType}"
					class="mmx-form-${controlType}__input"
					name="${MMX.encodeEntities(facet.code)}"
					value="${MMX.encodeEntities(facetValue.value)}"
					${checked}
				>
				<span class="mmx-form-caption mmx-form-${controlType}__caption">${facetValue.prompt}</span>
				${this.#renderFacetValueCount(facetValue)}
			</label>
		`;
	}

	#renderFacetValueCount(facetValue) {
		if (!this.getPropValue('show-facet-value-counts') || isNaN(facetValue?.count)) {
			return '';
		}

		return /*html*/`
			<span part="facet-value-count" class="mmx-product-list__facet-value-count">(${facetValue.count})</span>
		`;
	}

	#facetValues() {
		return this.shadowRoot.querySelectorAll('[part~="facet-value"]');
	}

	#onFacetValueClick(e) {
		this.#uncheckNestedFacetValues(e.currentTarget);
	}

	#uncheckNestedFacetValues(facetValue) {
		const currentDepth = MMX.coerceNumber(facetValue?.dataset?.depth);
		const nextFacetValue = facetValue?.nextElementSibling;
		const nextDepth = MMX.coerceNumber(nextFacetValue?.dataset?.depth);
		const nextCheckbox = nextFacetValue?.querySelector('[type="checkbox"]');

		if (nextDepth > currentDepth && nextCheckbox.checked) {
			nextCheckbox.checked = false;
			this.#uncheckNestedFacetValues(nextFacetValue);
		}
	}

	// Select Facet
	#renderFacetValuesSelect(facet) {
		return /*html*/`
			<div
				class="mmx-product-list__facet-values mmx-form-select"
				part="facet-values facet-values-select"
			>
				<select
					name="${MMX.encodeEntities(facet.code)}"
					class="mmx-form-select__dropdown"
					part="facet-values facet-values-select-dropdown"
					title="${MMX.encodeEntities(facet.name)} Facet Options"
				>
					<option value="">&lt;Select One&gt;</option>
					${facet?.values?.map(facetValue => this.#renderFacetValuesSelectOption({facet, facetValue})).join('')}
				</select>
			</div>
		`;
	}

	#renderFacetValuesSelectOption({facet, facetValue} = {}) {
		const selected = facetValue.selected ? 'selected' : '';

		return /*html*/`<option value="${MMX.encodeEntities(facetValue.value)}" ${selected}>${facetValue.prompt}</option>`;
	}

	// Nested Facet
	#renderFacetValuesNested(facet) {
		return /*html*/`
			<div
				class="mmx-product-list__facet-values mmx-form-fieldset"
				part="facet-values facet-values-nested"
			>
				${this.#renderFacetValuesNestedApplied({facet})}
				${this.#renderFacetValuesNestedUnapplied({facet})}
			</div>
		`;
	}

	#renderFacetValuesNestedApplied({facet}) {
		return facet.applied.map((facetValue, depth) => {
			return this.#renderFacetValueControl({
				facet,
				facetValue,
				depth
			});
		}).join('');
	}

	#renderFacetValuesNestedUnapplied({facet}) {
		return facet?.values?.map(facetValue => {
			return this.#renderFacetValueControl({
				facet,
				facetValue,
				depth: facet.appliedValuesCount
			});
		}).join('');
	}

	#renderFacetValueRange(facet) {
		const low = facet.selected_value_low || facet.value_low;
		const high = facet.selected_value_high || facet.value_high;
		const formatter = facet.formatting === 'currency' ? 'MMCurrencyFormatter' : '';

		return /*html*/`
			<div
				class="mmx-product-list__facet-values"
				part="facet-values facet-values-range"
			>
				<mmx-form-input-range
					data-name="${MMX.encodeEntities(facet.code)}"
					data-min="${MMX.encodeEntities(facet.value_low)}"
					data-max="${MMX.encodeEntities(facet.value_high)}"
					data-low="${MMX.encodeEntities(low)}"
					data-high="${MMX.encodeEntities(high)}"
					data-formatter="${formatter}"
				>
				</mmx-form-input-range>
			</div>
		`;
	}

	// Category Tree
	#renderCategoryTree() {
		if (!this.getPropValue('show-category-tree')) {
			return '';
		}

		return /*html*/`
			<slot part="category-tree" name="category-tree"></slot>
		`;
	}
}

if (!customElements.get('mmx-product-list')) {
	customElements.define('mmx-product-list', MMX_ProductList);
}