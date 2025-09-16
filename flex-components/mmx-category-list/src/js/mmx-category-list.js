/**
 * MMX / CATEGORY LIST
 */
class MMX_CategoryList extends MMX_Element {

	static get props() {
		return {
			'category-fallback-image': {
				allowAny: true
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-category-list'];
	#categories = [];
	#card = {};
	#errorMessage = '';

	constructor() {
		super();
		this.makeShadow();
		this.bindRevealElement();
	}

	// Rendering
	render() {
		return /*html*/`
			<div part="wrapper">
				<div part="title">
					<slot name="title"></slot>
				</div>
				${this.#renderMain()}
			</div>
		`;
	}

	afterRender() {
		this.#replaceCategories();
	}

	onDataChange() {
		MMX.setElementAttributes(this, {
			'data-category-fallback-image': this.data?.fallback_category_image,
		});

		this.#card = this.data.card;
		this.#loadCategories();
	}

	#renderMain() {
		if (this.#errorMessage) {
			return this.#renderMainError();
		}
		else {
			return this.#renderCategories();
		}
	}

	#renderMainError() {
		return /*html*/`
			<div part="error" class="mmx-category-list__error">
				<mmx-message data-style="warning">We're unable to display the categories: ${MMX.encodeEntities(this.#errorMessage ?? 'There was a problem loading the categories')}</mmx-message>
			</div>
		`;
	}

	// Styles
	styles() {
		return this.renderResponsiveSettingStyles();
	}

	renderResponsiveSettingStyles() {
		let breakpointStyles = this.#renderBreakpointRule(this.data?.list?.responsive_settings?.breakpoints?.default);

		MMX.getBreakpoints().map(breakpoint => {
			const settings = this.data?.list?.responsive_settings?.breakpoints?.[breakpoint?.code] ?? {};
			breakpointStyles += '\n\n' + this.#renderBreakpointMedia({breakpoint, settings});
		});

		return breakpointStyles;
	}

	#renderBreakpointMedia({breakpoint = {}, settings = {}} = {}) {
		if (MMX.variableType(breakpoint) !== 'object' || MMX.variableType(settings) !== 'object') {
			return '';
		}

		return /*css*/`
			@media ${MMX.buildMediaQuery({breakpoint})} {
				${this.#renderBreakpointRule(settings)}
			}
		`;
	}

	#renderBreakpointRule(settings = {}) {
		if (MMX.variableType(settings) !== 'object') {
			return '';
		}

		const columns = MMX.coerceNumber(settings?.columns?.value, 1);
		const gap = MMX.composeUnitValue(settings?.gap, {
			fallbackUnit: 'vw'
		}) ?? '1vw';

		return /*css*/`
			.mmx-category-list__categories {
				--mmx-category-list__columns: ${columns};
				--mmx-category-list__gap: ${gap};
			}
		`;
	}

	// Runtime_CategoryList_Load_Query
	#loadCategories() {
		this.#categories = [];
		this.#errorMessage = '';

		MMX.Runtime_JSON_API_Call({
			params: this.#getListLoadQueryParams()
		})
		.then(response => {
			this.#categoriesLoaded(response);
		})
		.catch(response => {
			this.#categoriesFailedToLoad(response);
		});
	}

	#categoriesLoaded(response) {
		this.#categories = response.data.data;
		this.forceUpdate();
	}

	#categoriesFailedToLoad(response) {
		this.#errorMessage = response.error_message;
		this.forceUpdate();
	}

	#getListLoadQueryParams() {
		const Parent_Id = MMX.coerceNumber(this.data?.list?.parent_category?.specific?.category?.id, 0);

		return {
			Function: 'Runtime_CategoryList_Load_Query',
			Filter: this.#getFilters(),
			Parent_Id
		};
	}

	#getFilters() {
		const details = this.#getCardDetails();
		const filters = details.reduce((filters, detail) => {
			const type = detail?.type?.value;

			if (type === 'customfield' && !MMX.valueIsEmpty(detail?.customfield?.value)) {
				filters.push({
					name: 'ondemandcolumns',
					value: [`CustomField_Values:${detail.customfield.value}`]
				});
			}
			else if (type === 'fragment' && !MMX.valueIsEmpty(detail?.fragment?.value)) {
				filters.push({
					name: 'fragments',
					value: [detail.fragment.value]
				});
			}
			else if (type === 'image') {
				const imageType = detail?.image_settings?.type?.value;

				if (imageType === 'cattitle') {
					filters.push({
						name: 'ondemandcolumns',
						value: ['CustomField_Values:cmp-cssui-cattitle:category_title_image']
					});
				}
				else if (imageType === 'cattree') {
					filters.push({
						name: 'ondemandcolumns',
						value: ['CustomField_Values:cmp-cssui-cattree:category_tree_image']
					});
				}
			}

			return filters;
		}, []);

		return filters;
	}

	// Categories
	#renderCategories() {
		return /*html*/`
			<div
				class="mmx-category-list__categories"
				part="categories"
			>
				<slot name="categories"></slot>
			</div>
		`;
	}

	#categoriesContainer() {
		return this.querySelector('[slot="categories"]');
	}

	#replaceCategories() {
		this.renderContentIntoLightDomSlot({slotName: 'categories', content: ''});
		this.#categoriesContainer()?.replaceChildren?.(this.#createCategories());
	}

	#createCategories() {
		if (!Array.isArray(this.#categories)){
			return '';
		}

		const parent = new DocumentFragment();
		const details = this.#getCardDetails();
		const styles = this.#card?.styles ?? {};
		const attributes = {
			'data-fallback-image': this.getPropValue('category-fallback-image'),
			'data-image-fit': this.getPropValue('category-image-fit'),
			'data-image-type': this.getPropValue('category-image-type')
		};

		const content = /*html*/`
			${this.renderThemeStylesheetTemplate(true)}
		`;

		this.#categories.forEach(category => {
			attributes['data-category-code'] = category.code;
			MMX_CategoryCard.create({category, details, styles, parent, attributes, content});
		});

		return parent;
	}

	#getCardDetails() {
		const details = this.#card?.details?.children;
		return Array.isArray(details) ? details : [];
	}
}

if (!customElements.get('mmx-category-list')) {
	customElements.define('mmx-category-list', MMX_CategoryList);
}