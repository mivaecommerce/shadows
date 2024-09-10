class MMX_QuickOrder extends MMX_Element {

	static get props() {
		return {
			'bask-url': {
				allowAny: true,
				default: MMX.longMerchantUrl({Screen: 'BASK'})
			},
			'add-row-style': {
				allowAny: true,
				default: 'primary-link'
			},
			'add-row-size': {
				allowAny: true,
				default: 'm'
			},
			'add-row-text': {
				allowAny: true,
				default: 'Add Row'
			},
			'add-to-cart-style': {
				allowAny: true,
				default: 'primary'
			},
			'add-to-cart-size': {
				allowAny: true,
				default: 'm'
			},
			'add-to-cart-text': {
				allowAny: true,
				default: 'Add to Cart'
			},
			'image-dimensions': {
				allowAny: true,
				default: '50x50'
			},
			'image-type': {
				allowAny: true,
				default: 'main'
			},
			'image-fit': {
				allowAny: true,
				default: 'contain'
			},
			'initial-row-count': {
				allowAny: true,
				isNumeric: true,
				default: 5
			},
			'message-inv-in': {
				allowAny: true,
				default: 'In Stock'
			},
			'message-attributes-required': {
				allowAny: true,
				default: 'Missing required attributes'
			},
			'message-product-available': {
				allowAny: true,
				default: 'Product ready'
			},
			'message-product-missing-short': {
				allowAny: true,
				default: 'Product not found'
			},
			'message-product-missing-long': {
				allowAny: true,
				default: 'This item was not found. Be sure that you have entered a valid product code or try a different value.'
			},
			'message-product-unavailable-short': {
				allowAny: true,
				default: 'Product unavailable'
			},
			'message-product-unavailable-long': {
				allowAny: true,
				default: `This item is unable to be purchased. It is likely out-of-stock or it has an invalid attribute selection.${String.fromCharCode(10)}${String.fromCharCode(10)}Remove the row or try a different attribute combination.`
			},
			'search-method': {
				allowAny: true,
				default: 'runtime'
			},
			'search-sort': {
				allowAny: true,
				default: 'disp_order'
			},
			'search-placeholder-code': {
				allowAny: true,
				default: 'Enter a product code...'
			},
			'search-placeholder-runtime': {
				allowAny: true,
				default: 'Search for a product...'
			},
			'search-results-title': {
				allowAny: true,
				default: ''
			},
			'enable-bulk': {
				isBoolean: true,
				default: true
			},
			'enable-csv': {
				isBoolean: true,
				default: true
			},
			'show-code' : {
				isBoolean: true,
				default: true
			},
			'show-discount' : {
				isBoolean: true,
				default: true
			},
			'show-link' : {
				isBoolean: true,
				default: true
			},
			'show-image': {
				isBoolean: true,
				default: true
			},
			'show-inv-message' : {
				isBoolean: true,
				default: true
			},
			'show-inv-available' : {
				isBoolean: true,
				default: true
			},
			'show-sku' : {
				isBoolean: true,
				default: true
			},
			'fallback-product-image': {
				allowAny: true,
				default: 'graphics/en-US/cssui/blank.gif'
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-button', 'mmx-text', 'mmx-quick-order'];
	renderUniquely = true;

	loadedProducts = new Map();
	maxCountForLoadQuery = 30;
	maxAdpmCount = 100;
	#selectingSearchResult = false;

	constructor() {
		super();
		this.makeShadow();
	}

	styles() {
		const dimensions = this.getPropValue('image-dimensions');
		const imageWidth = MMX.coerceNumber(dimensions?.split?.('x').at(0));
		const imageHeight = MMX.coerceNumber(dimensions?.split?.('x').at(1));

		return /*css*/`
			:host {
				--mmx-quick-order__image-width: ${imageWidth}px;
				--mmx-quick-order__image-height: ${imageHeight}px;
				--mmx-quick-order__image-fit: ${this.getPropValue('image-fit')};
				--mmx-quick-order__image-aspect-ratio: ${imageWidth} / ${imageHeight};
			}

			${this.stylesForShowImage()}
			${this.stylesForShowInvMessage()}
		`;
	}

	stylesForShowImage() {
		if (this.getPropValue('show-image')) {
			return '';
		}

		return /*css*/`
			mmx-featured-product::part(image-slider) {
				display: none;
			}
		`;
	}

	stylesForShowInvMessage() {
		if (this.getPropValue('show-inv-message')) {
			return '';
		}

		return /*css*/`
			mmx-featured-product::part(inventory-message) {
				display: none;
			}
		`;
	}

	render() {
		return /*html*/`
			<div part="wrapper" class="mmx-quick-order">
				<div part="title" class="mmx-quick-order__title">
					<slot name="title"></slot>
				</div>
				<div class="mmx-quick-order__form" part="form">
					${this.renderActions()}
					<div class="mmx-quick-order__row-container" part="row-container"></div>
					${this.renderAddRowButton()}
					${this.renderAddToCartButton()}
					<dialog class="mmx-quick-order__dialog" part="dialog">
						${this.renderBulkDialog()}
						${this.renderCsvDialog()}
					<div>
				</div>
			</div>
		`;
	}

	renderActions() {
		const enableBulkImport = this.getPropValue('enable-bulk');
		const enableCsvImport = this.getPropValue('enable-csv');

		if (!enableBulkImport && !enableCsvImport) {
			return '';
		}

		return /*html*/`
			<div class="mmx-quick-order__actions">
				${enableBulkImport ? /*html*/`<mmx-button class="mmx-quick-order__show-bulk" part="show-bulk" exportparts="button: show-bulk__inner" data-style="display-link">${this?.data?.bulk?.heading?.value ?? 'Bulk Import'}</mmx-button>` : ''}
				${enableCsvImport ? /*html*/`<mmx-button class="mmx-quick-order__show-csv" part="show-csv" exportparts="button: show-csv__inner"  data-style="display-link">${this?.data?.csv?.heading?.value ?? 'CSV Import'}</mmx-button>` : ''}
			</div>
		`;
	}

	renderAddRowButton() {
		return /*html*/`
			<mmx-button
				class="mmx-quick-order__add-row"
				part="add-row"
				exportparts="button: add-row__inner"
				data-style="${MMX.encodeEntities(this.getPropValue('add-row-style'))}"
				data-size="${MMX.encodeEntities(this.getPropValue('add-row-size'))}"
			>
				<mmx-icon class="mmx-quick-order__add-row-icon" part="add-row-icon">add-circle</mmx-icon>
				${this.getPropValue('add-row-text')}
			</mmx-button>
		`;
	}

	renderAddToCartButton() {
		return /*html*/`
			<mmx-button
				class="mmx-quick-order__add-to-cart"
				part="add-to-cart"
				exportparts="button: add-to-cart__inner"
				data-style="${MMX.encodeEntities(this.getPropValue('add-to-cart-style'))}"
				data-size="${MMX.encodeEntities(this.getPropValue('add-to-cart-size'))}"
			>
				${this.getPropValue('add-to-cart-text')}
			</mmx-button>
		`;
	}

	renderBulkDialog() {
		const enableBulkImport = this.getPropValue('enable-bulk');

		if (!enableBulkImport) {
			return '';
		}

		return /*html*/`
			<div class="mmx-quick-order__bulk-container" hidden>
				${this.renderTextProperty(this?.data?.bulk?.subheading, {
					prefix: 'subheading_',
					className: 'mmx-quick-order__dialog-subheading',
					defaultStyle: 'subheading-s'
				})}
				${this.renderTextProperty(this?.data?.bulk?.heading, {
					prefix: 'heading_',
					className: 'mmx-quick-order__dialog-heading',
					defaultStyle: 'title-3'
				})}
				${this.renderTextProperty(this?.data?.bulk?.body, {
					prefix: 'body_',
					className: 'mmx-quick-order__dialog-body',
					defaultStyle: ''
				})}
				<textarea class="mmx-quick-order__bulk-textarea" part="bulk-textarea" placeholder="${MMX.encodeEntities(this.csvArrayToString(this.exampleRows))}" required></textarea>
				${this.renderButtonProperty(this?.data?.bulk?.button, {
					className: 'mmx-quick-order__load-bulk'
				})}
				<button
					type="button"
					class="mmx-quick-order__dialog-close mmx-quick-order__cancel-bulk"
					part="dialog-close cancel-bulk"
					title="Close"
				>
					<mmx-icon class="mmx-quick-order__dialog-close-icon" part="dialog-close-icon">exit-circle</mmx-icon>
				</button>
			</div>
		`;
	}

	exampleRows = [
		['simple-product', '1'],
		['another-product', '10'],
		['with-attributes', '1', 'size', 'small', 'color', 'green', 'terms', true],
		['with-subscription', '1', 'subscription_term_descrip', 'Reorder annually'],
		['with-both', '1', 'color', 'green', 'subscription_term_descrip', 'Reorder annually']
	];

	renderCsvDialog() {
		const enableCsvImport = this.getPropValue('enable-csv');

		if (!enableCsvImport) {
			return '';
		}

		return /*html*/`
			<div class="mmx-quick-order__csv-container" hidden>
				${this.renderTextProperty(this?.data?.csv?.subheading, {
					prefix: 'subheading_',
					className: 'mmx-quick-order__dialog-subheading',
					defaultStyle: 'subheading-s'
				})}
				${this.renderTextProperty(this?.data?.csv?.heading, {
					prefix: 'heading_',
					className: 'mmx-quick-order__dialog-heading',
					defaultStyle: 'title-3'
				})}
				${this.renderTextProperty(this?.data?.csv?.body, {
					prefix: 'body_',
					className: 'mmx-quick-order__dialog-body',
					defaultStyle: ''
				})}
				<input class="mmx-quick-order__csv-file" part="csv-file" type="file" accept=".csv, .tsv, .txt" multiple required>
				${this.renderCsvExampleLink()}
				${this.renderButtonProperty(this?.data?.csv?.button, {
					className: 'mmx-quick-order__load-csv'
				})}
				<button
					type="button"
					class="mmx-quick-order__dialog-close mmx-quick-order__cancel-csv"
					part="dialog-close cancel-csv"
					title="Close"
				>
					<mmx-icon class="mmx-quick-order__dialog-close-icon" part="dialog-close-icon">exit-circle</mmx-icon>
				</button>
			</div>
		`;
	}

	renderCsvExampleLink() {
		return /*html*/`
			<mmx-button
				part="csv-example"
				data-style="primary-link"
				href="${MMX.encodeEntities(this.renderCsvExampleHref())}"
				download="quick-order-import.csv"
			>
				Download an example CSV file
			</mmx-button>
		`;
	}

	renderCsvExampleHref() {
		return encodeURI(`data:text/csv;charset=utf-8,${this.csvArrayToString(this.exampleRows)}`);
	}

	csvArrayToString(rows = [[]]) {
		const newline = String.fromCharCode(10);
		return rows.map(row => row.join(', ')).join(newline);
	}

	afterRender() {
		this.addRows(this.getPropValue('initial-row-count'));
		this.bindEvents();
	}

	onDataChange() {
		this.setSpacing(this.data?.advanced?.spacing);
		MMX.setElementAttributes(this, {
			'data-add-row-text': this?.data?.add_row_text?.value,
			'data-add-row-style': this.data?.add_row_text?.textsettings?.fields?.normal?.button_style?.value,
			'data-add-row-size': this.data?.add_row_text?.textsettings?.fields?.normal?.button_size?.value,
			'data-add-to-cart-text': this?.data?.add_to_cart_text?.value,
			'data-add-to-cart-style': this.data?.add_to_cart_text?.textsettings?.fields?.normal?.button_style?.value,
			'data-add-to-cart-size': this.data?.add_to_cart_text?.textsettings?.fields?.normal?.button_size?.value,
			'data-enable-bulk': this?.data?.bulk?.settings?.enabled,
			'data-enable-csv': this?.data?.csv?.settings?.enabled,
			'data-fallback-product-image': this.data?.fallback_product_image,
			'data-image-dimensions': this?.data?.advanced?.settings?.product?.image_group?.image_dimensions?.value,
			'data-image-fit': this?.data?.advanced?.settings?.product?.image_group?.image_fit?.value,
			'data-image-type': this?.data?.advanced?.settings?.product?.image_group?.image_type?.value,
			'data-initial-row-count': this?.data?.advanced?.settings?.initial_row_count?.value,
			'data-message-attributes-required': this?.data?.advanced?.settings?.messages?.attributes_required.value,
			'data-message-product-available': this?.data?.advanced?.settings?.messages?.product_available.value,
			'data-message-product-missing-short': this?.data?.advanced?.settings?.messages?.product_missing_short.value,
			'data-message-product-missing-long': this?.data?.advanced?.settings?.messages?.product_missing_long.value,
			'data-message-product-unavailable-short': this?.data?.advanced?.settings?.messages?.product_unavailable_short.value,
			'data-message-product-unavailable-long': this?.data?.advanced?.settings?.messages?.product_unavailable_long.value,
			'data-search-method': this?.data?.advanced?.settings?.search_method?.value,
			'data-search-sort': this?.data?.advanced?.settings?.search_sort?.value,
			'data-search-placeholder-code': this?.data?.advanced?.settings?.search_placeholder_code?.value,
			'data-search-placeholder-runtime': this?.data?.advanced?.settings?.search_placeholder_runtime?.value,
			'data-search-results-title': this?.data?.advanced?.settings?.search_results_title?.value,
			'data-show-code': this?.data?.advanced?.settings?.product?.show_code?.value,
			'data-show-discount': this?.data?.advanced?.settings?.product?.show_discount?.value,
			'data-show-image': this?.data?.advanced?.settings?.product?.image_group?.settings?.enabled,
			'data-show-inv-available': this?.data?.advanced?.settings?.product?.show_inv_available?.value,
			'data-show-inv-message': this?.data?.advanced?.settings?.product?.show_inv_message?.value,
			'data-show-link': this?.data?.advanced?.settings?.product?.show_link?.value,
			'data-show-sku': this?.data?.advanced?.settings?.product?.show_sku?.value
		});
	}

	bindEvents() {
		this.addRowButton().addEventListener('click', (e) => {
			this.onAddRowButtonClick(e);
		});

		this.addToCartButton().addEventListener('click', () => {
			this.onAddToCartButtonClick();
		});

		this.dialog().addEventListener('close', () => {
			this.onDialogClose();
		});

		this.bindBulkEvents();
		this.bindCsvEvents();
	}

	// Utilities
	first(array = []){
		return Array.from(array ?? []).at(0);
	}

	isKeyboardEvent(e) {
		if (typeof e === 'undefined') {
			return false;
		}

		if (typeof e?.pointerType === 'string') {
			return e.pointerType === '';
		}

		return MMX.coerceNumber(e?.offsetX) === 0 && MMX.coerceNumber(e?.offsetY) === 0;
	}

	scrollIntoView(element) {
		element?.scrollIntoView({
			behavior: 'smooth',
			block: 'center'
		});
	}

	setElementHidden(element, hidden = false) {
		if (element) {
			element.hidden = hidden;
		}
	}

	// Dialog Elements
	dialog() {
		return this.shadowRoot.querySelector('.mmx-quick-order__dialog');
	}

	// Dialog Events
	onDialogClose() {
		this.hideCsv();
		this.hideBulk();
	}

	// Dialog Methods
	showDialog() {
		this.dialog().showModal();
	}

	hideDialog() {
		this.dialog().close();
		this.setElementHidden(this.csvContainer(), true);
		this.setElementHidden(this.bulkContainer(), true);
	}

	// Bulk Elements
	bulkContainer() {
		return this.shadowRoot.querySelector('.mmx-quick-order__bulk-container');
	}

	showBulkButton() {
		return this.shadowRoot.querySelector('.mmx-quick-order__show-bulk');
	}

	loadBulkButton() {
		return this.shadowRoot.querySelector('.mmx-quick-order__load-bulk');
	}

	cancelBulkButton() {
		return this.shadowRoot.querySelector('.mmx-quick-order__cancel-bulk');
	}

	bulkTextarea() {
		return this.shadowRoot.querySelector('.mmx-quick-order__bulk-textarea');
	}

	// Bulk Events
	bindBulkEvents() {
		if (!this.getPropValue('enable-bulk')) {
			return;
		}

		this.showBulkButton()?.addEventListener('click', () => {
			this.onShowBulkButtonClick();
		});

		this.loadBulkButton()?.addEventListener('click', () => {
			this.onLoadBulkButtonClick();
		});

		this.cancelBulkButton()?.addEventListener('click', () => {
			this.onCancelBulkButtonClick();
		});
	}

	onShowBulkButtonClick() {
		this.showBulk();
	}

	onLoadBulkButtonClick() {
		this.importBulk();
	}

	onCancelBulkButtonClick() {
		this.hideBulk();
	}

	// Bulk Methods
	showBulk() {
		this.setElementHidden(this.bulkContainer(), false);
		this.showDialog();
	}

	hideBulk() {
		this.hideDialog();
	}

	importBulk() {
		const textarea = this.bulkTextarea();

		if (!textarea.reportValidity()) {
			return;
		}

		this.hideBulk();
		this.parseImportAndLoadProducts(textarea.value);
		textarea.value = '';
	}

	// CSV Elements
	csvContainer() {
		return this.shadowRoot.querySelector('.mmx-quick-order__csv-container');
	}

	showCsvButton() {
		return this.shadowRoot.querySelector('.mmx-quick-order__show-csv');
	}

	loadCsvButton() {
		return this.shadowRoot.querySelector('.mmx-quick-order__load-csv');
	}

	cancelCsvButton() {
		return this.shadowRoot.querySelector('.mmx-quick-order__cancel-csv');
	}

	csvFile() {
		return this.shadowRoot.querySelector('.mmx-quick-order__csv-file');
	}

	// CSV Events
	bindCsvEvents() {
		if (!this.getPropValue('enable-csv')) {
			return;
		}

		this.showCsvButton()?.addEventListener('click', () => {
			this.onShowCsvButtonClick();
		});

		this.loadCsvButton()?.addEventListener('click', () => {
			this.onLoadCsvButtonClick();
		});

		this.cancelCsvButton()?.addEventListener('click', () => {
			this.onCancelCsvButtonClick();
		});
	}

	onShowCsvButtonClick() {
		this.showCsv();
	}

	onLoadCsvButtonClick() {
		this.importCsv();
	}

	onCancelCsvButtonClick() {
		this.hideCsv();
	}

	// CSV Methods
	showCsv() {
		this.setElementHidden(this.csvContainer(), false);
		this.showDialog();
	}

	hideCsv() {
		this.hideDialog();
	}

	importCsv() {
		const csvFile = this.csvFile();
		const importFiles = [...csvFile.files];
		const fileContents = [];

		if (!csvFile.reportValidity()) {
			return;
		}

		importFiles.forEach(importFile => {
			const fileReader = new FileReader();

			fileReader.addEventListener('error', () => {
				alert(`An error occurred reading file "${importFile.name}". Please confirm the file exists and is readable, then try again.`);
			});

			fileReader.addEventListener('load', () => {
				fileContents.push(fileReader.result);
				if (fileContents.length === importFiles.length) {
					this.importedCsv(fileContents);
				}
			});

			fileReader.readAsText(importFile);
		});

		csvFile.value = null;
	}

	importedCsv(fileContents = []) {
		this.hideCsv();
		fileContents.forEach(fileContent => {
			this.parseImportAndLoadProducts(fileContent);
		});
	}

	// Form Elements
	rowContainer() {
		return this.shadowRoot.querySelector('.mmx-quick-order__row-container');
	}

	rows() {
		return this.shadowRoot.querySelectorAll('.mmx-quick-order__row');
	}

	addRowButton() {
		return this.shadowRoot.querySelector('.mmx-quick-order__add-row');
	}

	addToCartButton() {
		return this.shadowRoot.querySelector('.mmx-quick-order__add-to-cart');
	}

	// Form Events
	onAddRowButtonClick(e) {
		this.addRow();

		if (this.isKeyboardEvent(e)) {
			this.focusLastSearchInput();
		}
	}

	onAddToCartButtonClick() {
		this.addSelectedProductsToCart();
	}

	enableAddToCartButton() {
		this.addToCartButton().disabled = false;
	}

	disableAddToCartButton() {
		this.addToCartButton().disabled = true;
	}

	// Form Methods
	getBaskUrl() {
		return this.getPropValue('bask-url');
	}

	addRows(count = 1) {
		for(let i = 0; i < count; i++) {
			this.addRow();
		}
	}

	addRow(values = {}, method = 'append') {
		const row = this.createRow(values);

		if (method === 'prepend') {
			this.rowContainer().prepend(row);
		} else {
			this.rowContainer().append(row);
		}

		this.bindRowEvents(row);
		return row;
	}

	addSelectedProductsToCart() {
		if (this.addToCartButton().disabled) {
			return;
		}

		this.disableAddToCartButton();
		const results = this.validateRows();

		if (results.invalid.length) {
			this.reportInvalidResults(results.invalid);
			this.enableAddToCartButton();
			return;
		}

		if (results.unavailable.length) {
			this.reportUnavailableResults(results.unavailable);
			this.enableAddToCartButton();
			return;
		}

		if (results.unselected.length) {
			this.reportUnselectedResults(results.unselected);
			this.enableAddToCartButton();
			return;
		}

		if (results.unselected.length) {
			this.reportUnselectedResults(results.unselected);
			return;
		}

		if (results.valid.length) {
			this.adpmValidResults(results.valid)
				.finally(() => {
					this.enableAddToCartButton();
					this.visitBASK();
				});
			return;
		}

		this.enableAddToCartButton();
	}

	visitBASK() {
		window.location = this.getBaskUrl();
	}

	validateRows() {
		const results = {
			empty: [],
			unavailable: [],
			unselected: [],
			invalid: [],
			valid: []
		};

		[...this.rows()].forEach(row => {
			const result = this.validateRow(row);

			if (!result.hasSearchQuery) {
				results.empty.push(result);
			}
			else if (!result.hasSelection) {
				results.unselected.push(result);
			}
			else if (!result.hasValidAttributes) {
				results.invalid.push(result);
			}
			else if (!result.hasAvailableProduct) {
				results.unavailable.push(result);
			}
			else {
				results.valid.push(result);
			}
		});

		return results;
	}

	validateRow(row) {
		const featuredProduct = this.rowFeaturedProduct(row);
		const searchInput = this.rowSearchInput(row);

		const result = {
			row,
			searchInput,
			featuredProduct,
			hasSearchQuery: searchInput?.value?.length > 0,
			hasSelection: featuredProduct ? true : false,
			hasValidAttributes: featuredProduct?.formValidity?.hasValidAttributes ?? false,
			hasAvailableProduct: featuredProduct?.formValidity?.canPurchase ?? false
		};

		return result;
	}

	reportInvalidResults([invalidResult] = []) {
		invalidResult.featuredProduct.reportFormValidity();
	}

	reportUnavailableResults([disabledResult] = []) {
		const searchInput = this.rowSearchInput(disabledResult.row);
		this.scrollIntoView(searchInput);
		searchInput.focus();
		alert(this.getPropValue('message-product-unavailable-long'));
	}

	reportUnselectedResults([unselectedResult] = []) {
		this.scrollIntoView(unselectedResult.searchInput);
		unselectedResult.searchInput.focus();
		alert(this.getPropValue('message-product-missing-long'));
	}

	adpmValidResults(validResults = []) {
		if (!Array.isArray(validResults) || !validResults.length) {
			return Promise.resolve();
		}

		const adpmChunk = validResults.splice(0, this.maxAdpmCount);
		const adpmForm = this.createAdpmFormFromValidResults(adpmChunk);

		return MMX.fetchForm(adpmForm)
			.catch(response => {})
			.finally(() => {
				if (validResults.length) {
					return this.adpmValidResults(validResults);
				}
			});
	}

	createAdpmFormFromValidResults(validResults = []) {
		const adpmForm = MMX.createElement({
			type: 'form',
			attributes: {
				method: 'POST',
				action: this.getBaskUrl()
			},
			content: /*html*/`
				<input type="hidden" name="Action" value="ADPM">
				<input type="hidden" name="Attributes" value="Yes">
			`
		});

		validResults.forEach((result, i) => {
			const adprFormData = result.featuredProduct?.formData ?? new FormData();
			const nameRoot = `Products[${i+1}]`;

			for (const [adprName, adprValue] of adprFormData.entries()) {
				const adpmField = document.createElement('input');
				adpmField.setAttribute('type', 'hidden');

				if (adprName === 'Product_Code') {
					adpmField.setAttribute('name', `${nameRoot}:code`);
					adpmField.value = adprValue;
				}
				else if (adprName === 'Quantity') {
					adpmField.setAttribute('name', `${nameRoot}:quantity`);
					adpmField.value = this.rowQuantityInput(result.row).value;
				}
				else if (adprName === 'Product_Subscription_Term_ID') {
					adpmField.setAttribute('name', `${nameRoot}:subterm_id`);
					adpmField.value = adprValue;
				}
				else if (adprName.indexOf('Product_Attributes') > -1) {
					adpmField.setAttribute('name', `${nameRoot}:${adprName.replace('Product_Attributes', 'attributes')}`);
					adpmField.value = adprValue;
				}

				if (adpmField.name) {
					adpmForm.appendChild(adpmField);
				}
			}
		});

		return adpmForm;
	}

	// Row Elements
	removeRowButtons(parent = this.shadowRoot) {
		return parent.querySelectorAll('.mmx-quick-order__remove');
	}

	rowRemoveButton(row) {
		return this.first(this.removeRowButtons(row));
	}

	searchInputs(parent = this.shadowRoot) {
		return parent.querySelectorAll('.mmx-quick-order__search-input');
	}

	rowSearchInput(row) {
		return this.first(this.searchInputs(row));
	}

	quantityInputs(parent = this.shadowRoot) {
		return parent.querySelectorAll('.mmx-quick-order__quantity');
	}

	rowQuantityInput(row) {
		return this.first(this.quantityInputs(row));
	}

	searchResultsContainers(parent = this.shadowRoot) {
		return parent.querySelectorAll('.mmx-quick-order__search-results-container');
	}

	rowSearchResultsContainer(row) {
		return this.first(this.searchResultsContainers(row));
	}

	searchResults(parent = this.shadowRoot) {
		return parent.querySelectorAll('.mmx-quick-order__search-result');
	}

	isSearchResult(element) {
		return element?.classList?.contains('mmx-quick-order__search-result') === true;
	}

	selectedProductContainers(parent = this.shadowRoot) {
		return parent.querySelectorAll('.mmx-quick-order__selected-product');
	}

	rowSelectedProductContainer(row) {
		return this.first(this.selectedProductContainers(row));
	}

	featuredProducts(parent = this.shadowRoot) {
		return parent.querySelectorAll('mmx-featured-product');
	}

	rowFeaturedProduct(row) {
		return this.first(this.featuredProducts(row));
	}

	statusMessage(parent = this.shadowRoot) {
		return parent.querySelectorAll('.mmx-quick-order__status-message');
	}

	rowStatusMessage(row) {
		return this.first(this.statusMessage(row));
	}

	// Row Methods
	createRow({search = '', quantity = 1} = {}) {
		const placeholder = this.getPropValue('search-method') === 'code' ? this.getPropValue('search-placeholder-code') : this.getPropValue('search-placeholder-runtime');
		return MMX.createElement({
			type: 'div',
			attributes: {
				class: 'mmx-quick-order__row',
				part: 'row'
			},
			content: /*html*/`
				<input class="mmx-quick-order__search-input" part="search-input" type="search" placeholder="${MMX.encodeEntities(placeholder)}" value="${MMX.encodeEntities(search)}">
				<div class="mmx-quick-order__search-results-container" part="search-results-container"></div>
				<input class="mmx-quick-order__quantity" part="quantity" type="number" value="${MMX.coerceNumber(quantity, 1)}" min="1" step="1" placeholder="1" required>
				<mmx-button class="mmx-quick-order__remove" part="remove" data-width="full" data-style="secondary" title="Remove">
					<mmx-icon class="mmx-quick-order__remove-icon" part="remove-icon">remove</mmx-icon>
				</mmx-button>
				<div class="mmx-quick-order__selected-product" part="selected-product"></div>
				<div class="mmx-quick-order__status-message" part="status-message"></div>
			`
		});
	}

	closestRow(element) {
		return element.closest('.mmx-quick-order__row');
	}

	resetRows(rows = []) {
		rows.forEach(row => this.resetRow(row));
	}

	resetRow(row) {
		this.clearRowSearchInput(row);
		this.clearRowSearchResultsContainer(row);
		this.clearRowSelectedProductContainer(row);
		this.clearRowStatusMessage(row);
		this.resetRowQuantity(row);
	}

	setRowSearchInput(row, value) {
		this.rowSearchInput(row).value = value;
	}

	clearRowSearchInput(row) {
		this.setRowSearchInput(row, '');
	}

	setRowQuantity(row, quantity) {
		this.rowQuantityInput(row).value = quantity;
	}

	resetRowQuantity(row) {
		this.setRowQuantity(row, 1);
	}

	coerceQuantityValidity(row) {
		const quantity = this.rowQuantityInput(row);

		if (quantity.checkValidity()) {
			return;
		}

		quantity.stepUp();
		quantity.stepDown();

		if (isNaN(quantity.value)) {
			quantity.value = quantity.min;
		}
	}

	focusLastSearchInput() {
		const lastRow = Array.from(this.rows()).at(-1);
		const lastSearchInputs = this.searchInputs(lastRow);
		lastSearchInputs[0].focus();
	}

	// Row Events
	bindRowEvents(row) {
		row.addEventListener('focusout', (e) => {
			this.onRowFocusout(row, e);
		});

		row.addEventListener('keydown', (e) => {
			this.onRowKeydown(row, e);
		});

		const removeButton = this.rowRemoveButton(row);
		removeButton.addEventListener('click', (e) => {
			this.onRemoveButtonClick(e);
		});

		const quantityInput = this.rowQuantityInput(row);
		quantityInput.addEventListener('blur', () => {
			this.onQuantityBlur(row);
		});

		const searchInput = this.rowSearchInput(row);
		searchInput.addEventListener('focus', (e) => {
			this.onSearchFocus(row, e);
		});

		searchInput.addEventListener('input', (e) => {
			this.onSearchInput(e);
		});
	}

	onRowFocusout(row, e) {
		if (e.relatedTarget?.classList.contains('mmx-quick-order__search-input') || e.relatedTarget?.classList.contains('mmx-quick-order__search-result')) {
			return;
		}

		if(!this.#selectingSearchResult) {
			this.hideRowSearchResultsContainer(row);
			this.updateRowStatusMessage(row);
		}
	}

	onRowKeydown(row, e) {
		if (e.key === 'ArrowUp') {
			this.focusNextResult(row, 'prev', e);
		}
		else if (e.key === 'ArrowDown') {
			this.focusNextResult(row, 'next', e);
		}
		else if (e.key === 'Escape') {
			this.onEscapeKeydown(row, e);
		}
	}

	focusNextResult(row, direction = 'next', e) {
		const activeElement = this.shadowRoot.activeElement;
		const searchResults = [...this.searchResults(row)];
		const defaultIndex = direction === 'prev' ? -1 : 0;

		if (!searchResults.length) {
			return;
		}

		if (this.isSearchResult(activeElement)) {
			e.preventDefault?.();
			if (direction === 'next' && this.isSearchResult(activeElement.nextElementSibling)) {
				activeElement.nextElementSibling.focus();
			}
			else if (direction === 'prev' && this.isSearchResult(activeElement.previousElementSibling)) {
				activeElement.previousElementSibling.focus();
			}
			else {
				searchResults.at(defaultIndex).focus();
			}
		}
		else if (activeElement === this.rowSearchInput(row)) {
			e.preventDefault?.();
			searchResults.at(defaultIndex).focus();
		}
	}

	onEscapeKeydown(row, e) {
		const searchInput = this.rowSearchInput(row);
		if (e.target === searchInput) {
			this.resetRow(row);
			return;
		}
		else if (this.isSearchResult(e.target)) {
			searchInput.focus();
		}
	}

	onRemoveButtonClick(e) {
		const button = e.target;
		const row = this.closestRow(button);
		const nextRow = row.nextElementSibling;
		const nextSearchInputs = nextRow ? this.searchInputs(nextRow) : null;
		const previousRow = row.previousElementSibling;
		const previousSearchInputs = previousRow ? this.searchInputs(previousRow) : null;
		const siblingRowExists = nextRow || previousRow;

		row.remove();

		if (!siblingRowExists) {
			this.addRow();
		}

		if (!this.isKeyboardEvent(e)) {
			return;
		}

		if (nextSearchInputs) {
			nextSearchInputs[0].focus();
		}
		else if (previousSearchInputs) {
			previousSearchInputs[0].focus();
		}
	}

	onQuantityBlur(row) {
		this.coerceQuantityValidity(row);
	}

	// Status Methods
	updateRowStatusMessage(row) {
		const result = this.validateRow(row);

		if (!result.hasSearchQuery) {
			return this.clearRowStatusMessage(row);
		}

		if (!result.hasSelection) {
			return this.setRowStatusInfo(row, this.getPropValue('message-product-missing-short'));
		}

		if (!result.hasValidAttributes) {
			return this.setRowStatusWarning(row, this.getPropValue('message-attributes-required'));
		}

		if (!result.hasAvailableProduct) {
			return this.setRowStatusError(row, this.getPropValue('message-product-unavailable-short'));
		}

		return this.setRowStatusSuccess(row, this.getPropValue('message-product-available'));
	}

	clearRowStatusMessage(row) {
		this.setRowStatus(row, '', '');
	}

	setRowStatusError(row, message, icon = 'error') {
		this.setRowStatus(row, 'error', message, icon);
	}

	setRowStatusInfo(row, message, icon = 'warning') {
		this.setRowStatus(row, 'info', message, icon);
	}

	setRowStatusWarning(row, message, icon = 'warning') {
		this.setRowStatus(row, 'warning', message, icon);
	}

	setRowStatusSuccess(row, message, icon = 'check') {
		this.setRowStatus(row, 'success', message, icon);
	}

	setRowStatus(row, type = '', message = '', icon = '') {
		if (!(row instanceof HTMLElement)) {
			return;
		}

		row.setAttribute('data-status', type);

		if (typeof message !== 'string') {
			return;
		}

		row.title = message;

		const statusMessage = this.rowStatusMessage(row);
		statusMessage.innerHTML = /*html*/`
			${typeof icon === 'string' && icon.length > 0 ? /*html*/`<mmx-icon data-name="${MMX.encodeEntities(icon)}"></mmx-icon>` : ''}
			${message}
		`;
	}

	// Search
	onSearchFocus(row, e) {
		this.showRowSearchResultsContainer(this.closestRow(e.target));
		this.clearRowStatusMessage(row);
	}

	onSearchInput(e) {
		const searchInput = e.target;
		if (!searchInput.value.trim().length) {
			this.resetRow(this.closestRow(searchInput));
			return;
		}

		this.debouncedSearch(searchInput);
	}

	debouncedSearch = MMX.debounce((input) => {
		this.runtimeSearch(input);
	}, 500);

	runtimeSearch(input) {
		const query = input.value;

		MMX.Runtime_JSON_API_Call({
			params: {
				function: 'Runtime_ProductList_Load_Query',
				count: this.maxCountForLoadQuery,
				sort: this.getPropValue('search-sort'),
				filter: [
					this.getSearchFilter(query),
					...this.getProductListFilters()
				]
			}
		})
		.then(response => {
			const row = this.closestRow(input);
			this.handleSearchResponse(row, response);
		})
		.catch(response => {});
	}

	getSearchFilter(query) {
		if (this.getPropValue('search-method') === 'code') {
			return {
				name: 'search',
				value: [
					{
						field: 'code',
						operator: 'EQ',
						value: query
					}
				]
			};
		} else {
			return {
				name: 'runtime_search',
				value: query
			};
		}
	}

	getProductListFilters() {
		const featuredProduct = this.createFeaturedProduct();
		return featuredProduct.getDefaultFilters();
	}

	getOnDemandColumns() {
		const columns = ['sale_price'];

		if (this?.data?.advanced?.settings?.product?.show_inv_message?.value || this?.data?.advanced?.settings?.product?.show_inv_available?.value) {
			columns.push('inventory');
		}

		return columns;
	}

	handleSearchResponse(row, response) {
		const products = response?.data?.data;

		if (!Array.isArray(products)) {
			return;
		}

		this.saveProducts(products);
		this.renderSearchResultContainer(row, products);
	}

	saveProducts(products = []) {
		if (!Array.isArray(products)) {
			return;
		}

		products.forEach(product => {
			this.loadedProducts.set(String(product?.code), product);
		});
	}

	renderSearchResultContainer(row, products) {
		if (!products.length) {
			this.setRowNoSearchResults(row);
			return;
		}

		if (this.getPropValue('search-method') === 'code' && products.length === 1) {
			this.setRowSelectedProductContainer(row, products[0].code);
			return;
		}

		this.renderRowSearchResults(row, products);
	}

	showRowSearchResultsContainer(row) {
		this.rowSearchResultsContainer(row).style.display = '';
	}

	hideRowSearchResultsContainer(row) {
		this.rowSearchResultsContainer(row).style.display = 'none';
	}

	clearRowSearchResultsContainer(row) {
		this.rowSearchResultsContainer(row).innerHTML = '';
	}

	setRowNoSearchResults(row) {
		this.clearRowSelectedProductContainer(row);
		this.clearRowSearchResultsContainer(row);
		this.updateRowStatusMessage(row);
	}

	renderRowSearchResults(row, products) {
		this.showRowSearchResultsContainer(row);

		if (!Array.isArray(products)) {
			return;
		}

		const searchResultsTitle = this.getPropValue('search-results-title');

		this.rowSearchResultsContainer(row).innerHTML = /*html*/`
			${searchResultsTitle?.length ? /*html*/`<mmx-text part="search-results-title" data-style="title-4">${searchResultsTitle}</mmx-text>` : ''}
			${products.map(product => this.renderSearchResult(product)).join('')}
		`;
		this.bindRowSearchResultsEvents(row);
	}

	bindRowSearchResultsEvents(row) {
		this.searchResults(row).forEach(searchResult => {
			searchResult.addEventListener('mousedown', () => {
				this.#selectingSearchResult = true;
			});

			searchResult.addEventListener('mouseup', () => {
				this.onSearchResultSelected(searchResult);
				this.#selectingSearchResult = false;
			});

			searchResult.addEventListener('keyup', (e) => {
				if (['Enter', ' '].includes(e.key)){
					this.onSearchResultSelected(searchResult);
				}
			});
		});
	}

	// Product
	renderSearchResult(product = {}) {
		const hasImage = this.getPropValue('show-image') ? 'has-image' : '';

		return /*html*/`
			<button part="search-result" class="mmx-quick-order__search-result ${hasImage}" type="button" data-product-code="${MMX.encodeEntities(product.code)}">
				${this.renderImage(product)}
				<div part="search-result-content" class="mmx-quick-order__search-result-content">
					<div part="search-result-name" class="type-product-name">${product.name}</div>
					${this.getPropValue('show-code') ? /*html*/`<div part="search-result-code" class="type-paragraph-xs">Code: ${product.code}</div>` : ''}
					${this.getPropValue('show-sku') && product.sku.length ? /*html*/`<div part="search-result-sku" class="type-paragraph-xs">SKU: ${product.sku}</div>` : ''}
					${this.renderInventory(product)}
					${this.getPropValue('show-inv-available') && product.inv_active ? /*html*/`<div part="search-result-inv-available" class="type-paragraph-xs">Available: ${product.inv_available ?? '&infin;'}</div>` : ''}
					${this.renderPrice(product)}
					${this.getPropValue('show-link') ? /*html*/`<a part="search-result-link" exportparts="button: search-result-link__inner" class="mmx-button mmx-button__link mmx-button__size--s mmx-button__link mmx-button__primary-link" href="${MMX.encodeEntities(product.url)}" target="_blank">View Product</a>` : ''}
				</div>
			</button>
		`;
	}

	renderImage(product = {}) {
		const showImage = this.getPropValue('show-image');

		if (!showImage) {
			return '';
		}

		product.image = this.getProductImage(product, showImage);

		return /*html*/`
			<img
				part="search-result-image"
				class="mmx-quick-order__search-result-image"
				src="${MMX.encodeEntities(product.image.url)}"
				width="${MMX.encodeEntities(product.image.width)}"
				height="${MMX.encodeEntities(product.image.height)}"
				loading="lazy"
				alt=""
			>
		`;
	}

	getProductImage(product = {}, showImage = true) {
		const defaultImage = {
			url: this.getPropValue('fallback-product-image'),
			height: '',
			width: ''
		};

		if (!showImage) {
			return defaultImage;
		}

		const imageType = this.getPropValue('image-type');
		const image = product?.images?.find(image => image.code === imageType) ?? product?.images?.at(0);

		if (!image) {
			return defaultImage;
		}

		const imageDimensions = this.getPropValue('image-dimensions');
		return image?.sizes?.[imageDimensions] ?? image?.sizes?.original ?? defaultImage;
	}

	renderInventory(product = {}) {
		if (!this.getPropValue('show-inv-message')) {
			return '';
		}

		return /*html*/`
			<div
				part="search-result-inv-message search-result-inv-message--${MMX.encodeEntities(product.inv_level)}"
				class="type-paragraph-xs mmx-quick-order__search-result-inv-level--${MMX.encodeEntities(product.inv_level)}"
			>
				${product.inv_active ? product.inv_short : this.getPropValue('message-inv-in')}
			</div>
		`;
	}

	renderPrice(product = {}) {
		const showDiscount = this.getPropValue('show-discount');
		product.additional_price_display = showDiscount ? product.formatted_base_price : '';

		return /*html*/`
			<div part="search-result-prices" class="type-product-prices">
				<span part="search-result-price" class="type-product-price">${product.formatted_sale_price}</span>
				${product.additional_price_display.length && product.additional_price_display !== product.formatted_sale_price ? /*html*/`<span part="search-result-additional-price" class="type-product-additional-price">${product.additional_price_display}</span>` : ''}
			</div>
		`;
	}

	// Selected Product
	onSearchResultSelected(searchResult) {
		this.setRowSelectedProductContainer(this.closestRow(searchResult), searchResult.dataset.productCode);
	}

	setRowSelectedProductContainer(row, productCode = '', attributeValues = {}) {
		const product = this.loadedProducts.get(String(productCode));

		if (!product) {
			return;
		}

		this.hideRowSearchResultsContainer(row);
		this.renderRowSelectedProductContainer(row, product, attributeValues);
		this.focusRowQuantityAfterSelection(row);
		this.updateRowStatusMessage(row);
	}

	focusRowQuantityAfterSelection(row) {
		const input = this.rowQuantityInput(row);

		if (document.activeElement?.shadowRoot?.activeElement?.part?.value === 'quantity') {
			return;
		}

		if (this.getPropValue('search-method') === 'runtime') {
			input.focus();
		}
	}

	clearRowSelectedProductContainer(row) {
		this.rowSelectedProductContainer(row).innerHTML = '';
	}

	renderRowSelectedProductContainer(row, product = {}, attributeValues = {}) {
		const selectedProductContainer = this.rowSelectedProductContainer(row);
		selectedProductContainer.innerHTML = '';
		const featuredProduct = this.createFeaturedProduct(product);
		featuredProduct.product = this.selectProductAttributeValues(product, attributeValues);
		selectedProductContainer.append(featuredProduct);
		this.bindRowSelectedProductContainerEvents(row);
	}

	selectProductAttributeValues(product = {}, attributeValues = {}) {
		const updatedProduct = MMX.copy(product);

		updatedProduct?.attributes?.map(attribute => {
			attribute.value = attributeValues?.[attribute.code];
			return attribute;
		});

		updatedProduct?.subscriptionterms?.map(term => {
			term.selected = attributeValues?.subscription_term_descrip === term.descrip || attributeValues?.subscription_term_id === term.id;
			return term;
		});

		return updatedProduct;
	}

	createFeaturedProduct(product) {
		const imageDimensions = this.getPropValue('image-dimensions');
		return MMX.createElement({
			type: 'mmx-featured-product',
			attributes: {
				'data-bask-url': this.getBaskUrl(),
				'data-init': 'script',
				'data-desktop-image-size': imageDimensions,
				'data-mobile-image-size': imageDimensions
			},
			content: /*html*/`
				<script type="application/json">
					${JSON.stringify(this.getFeaturedProductConfig(product))}
				</script>
			`
		});
	}

	bindRowSelectedProductContainerEvents(row) {
		const featuredProduct = this.rowFeaturedProduct(row);

		featuredProduct.addEventListener('product:load', () => {
			this.onRowFeaturedProductLoaded(row);
		});

		featuredProduct.addEventListener('variant_changed', () => {
			this.onRowFeaturedProductVariantChanged(row);
		});

		featuredProduct.addEventListener('price_changed', () => {
			this.onRowFeaturedProductPriceChanged(row);
		});

		featuredProduct.shadowRoot.addEventListener('submit', (e) => {
			e.preventDefault();
		});
	}

	onRowFeaturedProductLoaded(row) {
		this.updateRowStatusMessage(row);
	}

	onRowFeaturedProductVariantChanged(row) {
		this.updateRowStatusMessage(row);
	}

	onRowFeaturedProductPriceChanged(row) {
		this.updateRowStatusMessage(row);
	}

	getFeaturedProductConfig(product = {}) {
		return {
			advanced: {
				product: {
					button: {
						settings: { enabled: true },
						button_text: { value: this.getPropValue('add-to-cart-text') }
					},
					code: { value: this.getPropValue('show-code') },
					sku: { value: this.getPropValue('show-sku') },
					discount: { value: this.getPropValue('show-discount') },
					image_fit: { value: this.getPropValue('image-fit') },
					image_type: { value: this.getPropValue('image-type') },
					multiple_images: { value: false },
					product_name_tag: { value: 'div' }
				},
			},
			product: {
				product: { product, product_code: product?.code }
			},
			text: {
				product_name: {
					product_name_style: { value: 'product-name' }
				},
				description: {
					overwritten_description: {
						settings: { enabled: true },
						text: { value: '' }
					}
				}
			},
			fallback_product_image_default: this.getPropValue('fallback-product-image')
		};
	}

	// Import Methods
	parseImportAndLoadProducts(text = '') {
		const importResults = this.parseCSV(text);
		this.disableAddToCartButton();
		this.loadProductsFromImport(importResults);
	}

	parseCSV(text = '') {
		const csvParser = new MMX_CSVParser({trim: true});
		const rows = csvParser.autoParse(text);
		const results = rows.reduce((results, columns) => {
			const result = {
				productCode: String(columns?.at(0)).trim() ?? '',
				quantity: Math.round(MMX.coerceNumber(columns?.at(1), 1)),
				attributeValues: this.columnsToObject(columns.slice(2))
			};

			if (result.productCode.length) {
				results.push(result);
			}

			return results;
		}, []);

		return results;
	}

	columnsToObject(columns = []) {
		const result = {};

		if (!Array.isArray(columns)) {
			return result;
		}

		for(var i = 0, len = columns.length; i < (len - 1); i += 2) {
			const key = columns.at(i);
			const value = columns.at(i+1);

			if (typeof key === 'string' && key.length) {
				result[key] = value;
			}
		}

		return result;
	}

	loadProductsFromImport(importResults = []) {
		if (!Array.isArray(importResults) || !importResults.length) {
			this.handleRemainingImportResults();
			return;
		}

		const remainingImportResults = structuredClone(importResults);
		const importResultsChunk = remainingImportResults.splice(0, this.maxCountForLoadQuery);
		const productCodes = this.productCodesToLoadFromImport(importResultsChunk);

		if (!productCodes.length) {
			this.updateRowsFromImport(importResultsChunk);
			this.handleRemainingImportResults(remainingImportResults);
			return;
		}

		MMX.Runtime_JSON_API_Call({
			params: {
				function: 'Runtime_ProductList_Load_Query',
				count: 0,
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
					...this.getProductListFilters()
				]
			}
		})
		.then(response => {
			this.handleLoadedProductsFromImport(importResultsChunk, response.data.data);
		})
		.catch(response => {})
		.finally(() => {
			this.handleRemainingImportResults(remainingImportResults);
		});
	}

	handleRemainingImportResults(importResults = []) {
		if (Array.isArray(importResults) && importResults.length) {
			this.loadProductsFromImport(importResults);
			return;
		}

		this.importCompleted();
	}

	productCodesToLoadFromImport(importResults = []) {
		return Array.from(
			importResults.reduce((codes, result) => {
				const productCode = String(result.productCode);
				const hasLoadedProduct = this.loadedProducts.has(productCode);
				if (hasLoadedProduct) {
					return codes;
				}

				return codes.add(productCode);
			}, new Set())
		);
	}

	handleLoadedProductsFromImport(importResults = [], products = []) {
		this.saveProducts(products);
		this.updateRowsFromImport(importResults);
		this.dispatchEvent(new CustomEvent('import:chunk', {
			detail: {
				importResults,
				products
			}
		}));
	}

	importCompleted() {
		this.enableAddToCartButton();
		this.dispatchEvent(new CustomEvent('import:load'));
	}

	updateRowsFromImport(importResults = []) {
		if (!Array.isArray(importResults)) {
			return;
		}

		importResults.forEach(importResult => {
			const row = this.addRow({
				search: importResult.productCode,
				quantity: importResult.quantity
			});

			const importedProduct = this.loadedProducts.get(String(importResult.productCode));
			if (importedProduct?.id > 0) {
				this.setRowSelectedProductContainer(row, importedProduct.code, importResult.attributeValues);
			} else {
				this.updateRowStatusMessage(row);
			}
		});
	}
}

if (!customElements.get('mmx-quick-order')) {
	customElements.define('mmx-quick-order', MMX_QuickOrder);
}