/**
 * MMX / PRODUCT FITMENT LIST
 */
class MMX_ProductFitmentList extends MMX_Element {

	static get props() {
		return {};
	}

	styleResourceCodes = ['mmx-base', 'mmx-text', 'mmx-messages', 'mmx-product-fitment-list'];
	renderUniquely = true;

	#productCode = '';
	#facet = {};
	#facetCode = '';
	#fitmentData = [];
	#fitmentDataLoaded = false;
	#displayEmpty = true;
	#breakpoint = null;
	#tableStyles = null;
	#errorMessage;

	constructor() {
		super();
		this.makeShadow();
	}

	// MMX_Element Render Life Cycle
	render() {
		if (!this.#shouldRender()) {
			return '';
		}

		return /*html*/`
			<div part="wrapper" class="mmx-product-fitment-list">
				<div part="title" class="mmx-product-fitment-list__title">
					<slot name="title"></slot>
				</div>
				${this.#renderMain()}
			</div>
		`;
	}

	styles() {
		return /*css*/`
			:host {
				--mmx-product-fitment-list__list-column-count: ${this.#facet?.fields?.length};
				--mmx-product-fitment-list__list-header-divider-color: ${MMX.valueIsEmpty(this.#tableStyles?.header_divider_color?.value) ? 'transparent' : this.#tableStyles.header_divider_color.value};
				--mmx-product-fitment-list__list-background-color: ${MMX.valueIsEmpty(this.#tableStyles?.striped_background_color?.value) ? 'transparent' : this.#tableStyles.striped_background_color.value};
			}

			@media ${MMX.buildMediaQuery(this.#breakpoint)} {
				.mmx-product-fitment-list__list-header {
					display: none;
				}

				.mmx-product-fitment-list__list-content {
					row-gap: 3px;
				}

				.mmx-product-fitment-list__list-content-column {
					display: grid;
					grid-template-columns: subgrid;
					grid-column: 1 / 4;
					align-items: center;
					column-gap: 26px;
				}

				.mmx-product-fitment-list__list-content-column-header {
					display: block;
					grid-column: 1 / 2;
				}

				.mmx-product-fitment-list__list-content-column-value {
					grid-column: 2 / calc(var(--mmx-product-fitment-list__list-column-count, 0) + 1);
				}
			}
		`;
	}

	// Data Methods
	onDataChange() {
		this.#productCode = this.data?.product?.product_code;
		this.#facetCode = this.data?.settings?.facet_code?.value;
		this.#fitmentData = this.data?.fitment_data;
		this.#fitmentDataLoaded = typeof this.#fitmentData !== 'undefined';
		this.#displayEmpty = this.data?.advanced?.show_empty_results?.value ?? true;
		this.#breakpoint = this.data?.settings?.breakpoint;
		this.#tableStyles = this.data?.table_styles;

		this.#loadFacet();
	}

	// Facet and Fitment Loading
	#shouldLoadFitmentData() {
		return !this.#fitmentDataLoaded && !MMX.valueIsEmpty(this.#productCode);
	}

	#loadFacet() {
		this.#facet = {};
		this.#errorMessage = undefined;

		if (MMX.valueIsEmpty(this.#facetCode)) {
			return;
		}

		MMX.Runtime_JSON_API_Call({
			params: {
				function: 'Module',
				module_code: 'combofacets',
				module_function: 'Runtime_CombinationFacetAndFieldList_Load_All',
				combinationfacet_code: this.#facetCode
			}
		})
		.then(response => {
			this.#facetLoaded(response);
		})
		.catch(response => {
			this.#facetFailedToLoad(response);
		});
	}

	#facetLoaded(response) {
		this.#facet = response.data;

		if (!this.#shouldLoadFitmentData()) {
			this.forceUpdate();
			return;
		}

		this.#loadFitmentList();
	}

	#facetFailedToLoad(response) {
		this.#errorMessage = MMX.coerceString(response?.error_message, {fallback: 'There was a problem loading the fitment data'});
		this.forceUpdate();
	}

	#loadFitmentList() {
		this.#fitmentData = [];

		MMX.Runtime_JSON_API_Call({
			params: {
				function: 'Runtime_ProductList_Load_Query',
				count: 1,
				filter:
				[
					{
						name: 'search',
						value: [
							{
								field: 'code',
								operator: 'EQ',
								value: this.#productCode
							}
						]
					},
					{
						name: 'ondemandcolumns',
						value: [`CustomField_Values:combofacets:${this.#facetCode}_fitment_list`]
					}
				]
			}
		})
		.then(response => {
			this.#fitmentsLoaded(response);
		})
		.catch(response => {
			this.#fitmentsFailedToLoad(response);
		});
	}

	#fitmentsLoaded(response) {
		this.#fitmentDataLoaded = true;
		this.#fitmentData = response?.data?.data?.[ 0 ]?.CustomField_Values?.combofacets?.[`${this.#facetCode}_fitment_list`] ?? [];

		this.forceUpdate();
	}

	#fitmentsFailedToLoad(response) {
		this.#errorMessage = MMX.coerceString(response?.error_message, {fallback: 'There was a problem loading the fitment data'});
		this.forceUpdate();
	}

	// Rendering Functions
	#shouldRender() {
		if (!MMX.valueIsEmpty(this.#errorMessage)) {
			return true;
		} else if (MMX.valueIsEmpty(this.#facet) || !this.#fitmentDataLoaded) {
			return false;
		} else if (MMX.arrayIsEmpty(this.#fitmentData) && !this.#displayEmpty) {
			return false;
		}

		return true;
	}

	#renderMain() {
		if (!MMX.valueIsEmpty(this.#errorMessage)) {
			return this.#renderMainError();
		} else if (!this.#fitmentData?.length) {
			return this.#renderEmpty();
		}

		return /*html*/`
			<div part="main" class="mmx-product-fitment-list__list">
				${this.#renderFitmentListHeader()}
				${this.#renderFitmentListContent()}
			</div>
		`;
	}

	#renderMainError() {
		return /*html*/`
			<div part="error" class="mmx-product-fitment-list__error">
				<mmx-message data-style="warning">We're unable to display fitment data: ${MMX.encodeEntities(this.#errorMessage ?? 'There was a problem loading fitment data')}</mmx-message>
			</div>
		`;
	}

	#renderEmpty() {
		return /*html*/`
			<div class="mmx-product-fitment-list__empty">
				<mmx-message data-style="info">No Fitment Data Available</mmx-message>
			</div>
		`;
	}

	#renderFitmentListHeader() {
		return /*html*/`
			<div part="list-header" class="mmx-product-fitment-list__list-header">
				${this.#facet.fields.map(field => this.#renderFitmentListHeaderColumn(field)).join('')}
			</div>
		`;
	}

	#renderFitmentListHeaderColumn(field) {
		const theme_available = this.#tableStyles?.header_typography?.theme_available ?? false;

		return /*html*/`
			<mmx-text
				class="mmx-product-fitment-list__list-header-column"
				data-theme="${MMX.encodeEntities(theme_available)}"
				data-theme-class="${MMX.encodeEntities(this.#tableStyles?.header_typography?.classname ?? '')}"
				data-chars-per-line="none"
			>
				${this.renderThemeStylesheetTemplate(theme_available)}
				${field.name}
			</mmx-text>
		`;
	}

	#renderFitmentListContent() {
		return this.#fitmentData.map(fitment => this.#renderFitmentListContentEntry(fitment)).join('');
	}

	#renderFitmentListContentEntry(fitment) {
		return /*html*/`
			<div class="mmx-product-fitment-list__list-content">
				${fitment.split('>').map((value, index) => this.#renderFitmentListContentEntryColumn(this.#facet.fields[index], value)).join('')}
			</div>
		`;
	}

	#renderFitmentListContentEntryColumn(field, fitment_value) {
		const header_theme_available = this.#tableStyles?.header_typography?.theme_available ?? false;
		const content_theme_available = this.#tableStyles?.content_typography?.theme_available ?? false;

		return /*html*/`
			<div class="mmx-product-fitment-list__list-content-column">
				<mmx-text
					class="mmx-product-fitment-list__list-content-column-header"
					data-theme="${MMX.encodeEntities(header_theme_available)}"
					data-theme-class="${MMX.encodeEntities(this.#tableStyles?.header_typography?.classname ?? '')}"
					data-chars-per-line="none"
				>
					${this.renderThemeStylesheetTemplate(header_theme_available)}
					${field.name}
				</mmx-text>

				<mmx-text
					class="mmx-product-fitment-list__list-content-column-value"
					data-theme="${MMX.encodeEntities(content_theme_available)}"
					data-theme-class="${MMX.encodeEntities(this.#tableStyles?.content_typography?.classname ?? '')}"
					data-chars-per-line="none"
				>
					${this.renderThemeStylesheetTemplate(content_theme_available)}
					${fitment_value}
				</mmx-text>
			</div>
		`;
	}
}

if (!customElements.get('mmx-product-fitment-list')) {
	customElements.define('mmx-product-fitment-list', MMX_ProductFitmentList);
}