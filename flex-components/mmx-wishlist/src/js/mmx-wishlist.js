class MMX_AtwlButton extends MMX_Element {
	static get props() {
		return {
			'product-code': {
				allowAny: true,
				default: null
			},
			'icon-set': {
				options: [
					'heart',
					'flag',
					'star'
				],
				default: 'heart'
			},
			color: {
				allowAny: true,
				default: 'currentColor'
			},
			added: {
				isBoolean: true,
				default: false
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-wishlist'];
	renderUniquely = true;

	constructor() {
		super();
		this.makeShadow();
	}

	// Render
	render() {
		if (this.#slottedTrigger()) {
			return /*html*/`
				<slot name="trigger"></slot>
			`;
		}

		return /*html*/`
			<button
				class="mmx-atwl-button"
				part="trigger"
				type="button"
				title="Add to Wishlist"
				style="--mmx-wishlist__icon-color: ${MMX.encodeEntities(this.getPropValue('color'))};"
			>
				<mmx-icon class="mmx-atwl-button__icon" data-name="${MMX.encodeEntities(this.#getIconName())}"></mmx-icon>
			</button>
		`;
	}

	#getIconName() {
		const iconSet = this.getPropValue('icon-set');
		const modifier = this.getPropValue('added') ? 'full' : 'empty';
		return `${iconSet}-${modifier}`;
	}

	afterRender() {
		this.#trigger().addEventListener('click', this.#onTriggerClick.bind(this));
	}

	// Trigger
	#trigger() {
		return this.#slottedTrigger() ?? this.#shadowTrigger();
	}

	#slottedTrigger() {
		return this.querySelector('[slot="trigger"]');
	}

	#shadowTrigger() {
		return this.shadowRoot.querySelector('[part~="trigger"]');
	}

	#onTriggerClick(e) {
		e.preventDefault();
		this.#createDialog();
	}

	// Dialog
	#createDialog() {
		MMX_AtwlDialog.create({
			productCode: this.getPropValue('product-code'),
			button: this,
			settings: this.#getAddToWishlistSettings()
		});
	}

	#getAddToWishlistSettings() {
		const provider = MMX.closestElement('[data-add-to-wishlist-settings-provider]', this);
		return provider?.getAddToWishlistSettings?.() ?? null;
	}

	// Public Methods
	setAdded(added = true) {
		this.setAttribute('data-added', MMX.isTruthy(added) ? true : false);
	}
}

if (!customElements.get('mmx-atwl-button')) {
	customElements.define('mmx-atwl-button', MMX_AtwlButton);
}

class MMX_AtwlDialog extends MMX_Element {
	#productCode = null;
	#settings = null;
	#button = null;
	#buttonThemes = null;
	#wishlistId = null;

	static get props() {
		return {};
	}

	styleResourceCodes = ['mmx-base', 'mmx-forms', 'mmx-wishlist'];
	renderUniquely = true;

	constructor() {
		super();
		this.makeShadow();
	}

	render() {
		return /*html*/`
			<mmx-dialog class="mmx-atwl-dialog"></mmx-dialog>
		`;
	}

	afterRender() {
		this.#bindEvents();
	}

	#bindEvents() {
		this.#dialog().addEventListener('close', this.#onDialogClose.bind(this));
	}

	static create({productCode, button, settings} = {}) {
		MMX.createElement({
			type: 'mmx-atwl-dialog',
			parent: document.body,
			data: {
				productCode,
				button,
				settings
			}
		});
	}

	// Data
	onDataChange() {
		this.#productCode = this.data?.productCode ?? null;
		this.#settings = this.data?.settings ?? null;
		this.#button = this.data?.button ?? null;
		this.#buttonThemes = {
			primary: {
				available: this.#settings?.dialog?.primary_button_theme?.theme_available ?? false,
				classname: this.#settings?.dialog?.primary_button_theme?.classname ?? 'primary'
			},
			secondary: {
				available: this.#settings?.dialog?.secondary_button_theme?.theme_available ?? false,
				classname: this.#settings?.dialog?.secondary_button_theme?.classname ?? 'secondary'
			},
			tertiary: {
				available: this.#settings?.dialog?.tertiary_button_theme?.theme_available ?? false,
				classname: this.#settings?.dialog?.tertiary_button_theme?.classname ?? 'display-link'
			}
		};

		this.#loadWishlists();
	};

	// Dialog
	#dialog() {
		return this.shadowRoot.querySelector('.mmx-atwl-dialog');
	}

	#renderDialog({content = '', heading = ''} = {}) {
		this.#dialog().innerHTML = /*html*/`
			<div slot="header">
				${this.#renderDialogHeading(heading)}
			</div>
			<div slot="content">
				${content}
			</div>
		`;
	}

	#renderDialogHeading(text = '') {
		return /*html*/`
			<mmx-text
				data-theme="${MMX.encodeEntities(this.#settings?.dialog?.heading_typography_theme?.theme_available)}"
				data-theme-class="${MMX.encodeEntities(this.#settings?.dialog?.heading_typography_theme?.classname)}"
				data-style="title-4"
			>
				${MMX.encodeEntities(text)}
			</mmx-text>
		`;
	}

	#showDialog({heading = '', content = ''} = {}) {
		this.#renderDialog({
			heading,
			content
		});
		this.#dialog().showModal();
	}

	#showDialogError({heading = 'Error', content = ''} = {}) {
		this.#showDialog({
			heading,
			content: /*html*/`
				<mmx-message data-style="error">
					${MMX.encodeEntities(content)}
				</mmx-message>
			`
		});
	}

	#onDialogClose() {
		this.remove();
	}

	// Wishlists
	#loadWishlists() {
		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Runtime_WishListList_Load_Query'
			}
		})
			.then(response => {
				this.#handleWishlistsLoaded(response?.data?.data);
			})
			.catch(response => {
				if (response?.error_code === 'wishlist_customer_login') {
					this.#handleWishlistsLoadedWithoutCustomer();
				}
				else {
					this.#handleWishlistsLoadedError(response);
				}
			});
	}

	#handleWishlistsLoaded(wishlists = []) {
		this.#showWishlistsDialog(wishlists);
	}

	#handleWishlistsLoadedWithoutCustomer() {
		this.#showLoginDialog();
	}

	#handleWishlistsLoadedError(response) {
		this.#showDialogError({
			heading: 'Error loading wishlists',
			content: response?.error_message ?? 'There was a problem loading your wishlists.'
		});
	}

	#showWishlistsDialog(wishlists = []) {
		if (MMX.arrayIsEmpty(wishlists)) {
			this.#showEmptyWishlistsDialog();
		}
		else {
			this.#showFullWishlistsDialog(wishlists);
		}
	}

	// Wishlists
	#showFullWishlistsDialog(wishlists = []) {
		this.#showDialog({
			heading: MMX.coerceString(this.#settings?.select_wishlist?.heading?.value, {fallback: 'Select a Wishlist'}),
			content: this.#renderWishlists(wishlists)
		});

		this.#bindWishlistsEvents();
	}

	#renderWishlists(wishlists = []) {
		if (MMX.arrayIsEmpty(wishlists)) {
			return '';
		}

		return /*html*/`
			<div class="mmx-atwl-dialog__wishlists" part="wishlist-list">
				${wishlists.map(wishlist => {
					return this.#renderWishlist(wishlist);
				}).join('')}
			</div>
			${this.#renderShowAddWishlistButton({
				text: MMX.coerceString(this.#settings?.select_wishlist?.button?.value, {fallback: 'Add Wishlist'}),
				theme: 'secondary'
			})}
		`;
	}

	#renderWishlist(wishlist = {}) {
		return /*html*/`
			<button class="mmx-atwl-dialog__wishlist" type="button" data-wishlist-id="${MMX.encodeEntities(wishlist.id)}">
				<mmx-text
					data-theme="${MMX.encodeEntities(this.#settings?.dialog?.wishlist_typography_theme?.theme_available)}"
					data-theme-class="${MMX.encodeEntities(this.#settings?.dialog?.wishlist_typography_theme?.classname)}"
					data-style="subheading-xs"
				>
					${MMX.encodeEntities(wishlist.title)}
					<span class="mmx-atwl-dialog__wishlist-visibility">${wishlist.shared ? 'Public' : 'Private'}</span>
				</mmx-text>
			</button>
		`;
	}

	#bindWishlistsEvents() {
		this.#wishlistItems()?.forEach?.(wishlistItem => {
			wishlistItem.addEventListener('click', this.#onWishlistClick.bind(this, wishlistItem.dataset.wishlistId));
		});
		this.#bindShowAddWishlistButtonEvent();
	}

	#wishlistItems() {
		return this.shadowRoot.querySelectorAll('.mmx-atwl-dialog__wishlist');
	}

	#onWishlistClick(wishlistId, e) {
		e.preventDefault();
		this.#addItemToWishlist(wishlistId);
	}

	// Empty Wishlists
	#showEmptyWishlistsDialog() {
		this.#showDialog({
			heading: MMX.coerceString(this.#settings?.empty_wishlists?.heading?.value, {fallback: 'Start Your Wishlist'}),
			content: this.#renderEmptyWishlists()
		});

		this.#bindShowAddWishlistButtonEvent();
	}

	#renderEmptyWishlists() {
		const message = MMX.coerceString(this.#settings?.empty_wishlists?.message?.value, {fallback: "You don't have any wishlists yet."});
		const buttonText = MMX.coerceString(this.#settings?.empty_wishlists?.button?.value, {fallback: 'Add Wishlist'});

		return /*html*/`
			<mmx-message data-style="info" class="mmx-atwl-dialog__empty-message">
				${MMX.encodeEntities(message)}
			</mmx-message>
			${this.#renderShowAddWishlistButton({
				text: buttonText,
				theme: 'primary'
			})}
		`;
	}

	// Show Add Wishlists
	#renderShowAddWishlistButton({text = '', theme = 'primary'} = {}) {
		return /*html*/`
			<mmx-button
				id="show-add-wishlist"
				class="mmx-atwl-dialog__submit-button"
				data-width="full"
				data-theme="${MMX.encodeEntities(this.#buttonThemes[theme].available)}"
				data-theme-class="${MMX.encodeEntities(this.#buttonThemes[theme].classname)}"
			>
				${MMX.encodeEntities(text)}
			</mmx-button>
		`;
	}

	#bindShowAddWishlistButtonEvent() {
		this.#showAddWishlistButton()?.addEventListener?.('click', this.#onShowAddWishlistButtonClick.bind(this));
	}

	#showAddWishlistButton() {
		return this.shadowRoot.querySelector('#show-add-wishlist');
	}

	#onShowAddWishlistButtonClick(e) {
		e.preventDefault();
		this.#showAddWishlistDialog();
	}

	// Wishlist Item Insert
	#addItemToWishlist(wishlistId) {
		this.#wishlistId = wishlistId;
		this.#insertWishlistItem();
	}

	#insertWishlistItem({WishList_ID = this.#wishlistId, Product_Code = this.#productCode, Quantity = 1, Attributes = []} = {}) {
		return MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Runtime_WishListItemList_Insert',
				WishList_ID,
				Products: [
					{
						Product_Code,
						Quantity,
						Attributes
					}
				]
			}
		})
			.then((response) => {
				if (Array.isArray(response.data.skipped_products)) {
					this.#handleWishlistItemInsertErrorSkippedProducts(response.data.skipped_products);
				}
				else {
					this.#handleWishlistItemInserted();
				}
			})
			.catch(response => {
				if (response?.error_code === 'wishlist_customer_login') {
					this.#handleWishlistItemInsertLoginError();
				}
				else {
					this.#handleWishlistItemInsertError(response);
				}
			});
	}

	#handleWishlistItemInserted() {
		this.#dialog().close();
		this.#button?.setAdded?.(true);
	}

	#handleWishlistItemInsertLoginError() {
		this.#showLoginDialog();
	}

	#handleWishlistItemInsertErrorSkippedProducts(skippedProducts = []) {
		if (skippedProducts.length === 1 && skippedProducts[0].error_code === 'product_attributes') {
			this.#showAttributeSelectionDialog();
		}
		else {
			this.#handleWishlistItemInsertError({
				error_message: skippedProducts.map(product => product.error_message).join('. ')
			});
		}
	}

	#handleWishlistItemInsertError(response) {
		this.#showDialogError({
			heading: 'Error adding item to wishlist',
			content: response?.error_message ?? 'There was a problem adding the item to your wishlist.'
		});
	}

	// Customer Login
	#showLoginDialog() {
		this.#showDialog({
			heading: MMX.coerceString(this.#settings?.login?.heading.value, {fallback: 'Sign In to Save to Wishlist'}),
			content: this.#renderLogin()
		});

		this.#bindLoginFormEvents();
	}

	#renderLogin() {
		if (this.#settings?.login?.method?.value === 'link') {
			return this.#renderLoginLink();
		} else {
			return this.#renderLoginForm();
		}
	}

	#renderLoginLink() {
		const loginRegisterLinkUrl = MMX.coerceString(this.#settings?.login?.login_register_url?.url, {fallback: MMX.longMerchantUrl({Screen: 'LOGN'})});
		const loginRegisterLinkText = MMX.coerceString(this.#settings?.login?.login_register_text?.value, {fallback: 'Log in or Register'});

		return /*html*/`
			<mmx-button
				class="mmx-atwl-dialog__submit-button"
				href="${MMX.encodeEntities(loginRegisterLinkUrl)}"
				data-width="full"
				data-theme="${MMX.encodeEntities(this.#buttonThemes.primary.available)}"
				data-theme-class="${MMX.encodeEntities(this.#buttonThemes.primary.classname)}"
			>
				${MMX.encodeEntities(loginRegisterLinkText)}
			</mmx-button>
		`;
	}

	#renderLoginForm() {
		const loginButton = MMX.coerceString(this.#settings?.login?.button?.value, {fallback: 'Log In'});
		const forgotPasswordUrl = MMX.coerceString(this.#settings?.login?.forgot_password_url?.url, {fallback: MMX.longMerchantUrl({Screen: 'FPWD'})});
		const forgotPasswordText = MMX.coerceString(this.#settings?.login?.forgot_password_text?.value, {fallback: 'Forgot Password?'});
		const registerUrl = MMX.coerceString(this.#settings?.login?.register_url?.url, {fallback: MMX.longMerchantUrl({Screen: 'LOGN'})});
		const registerText = MMX.coerceString(this.#settings?.login?.register_text?.value, {fallback: 'Register'});

		return /*html*/`
			<form class="mmx-form" id="login-form">
				<div id="login-form-message"></div>
				<div class="mmx-form-fields">
					<div class="mmx-form-field">
						<label class="mmx-form-label" for="Customer_LoginEmail">
							Email Address
						</label>
						<input type="text" inputmode="email" name="Customer_LoginEmail" id="Customer_LoginEmail" class="mmx-form-input" required autocomplete="email"/>
					</div>
					<div class="mmx-form-field">
						<label class="mmx-form-label" for="Customer_Password">
							Password
						</label>
						<input type="password" name="Customer_Password" id="Customer_Password" class="mmx-form-input" required autocomplete="current-password"/>
						<small class="mmx-form-field-description">
							<mmx-button data-style="secondary-link" href="${MMX.encodeEntities(forgotPasswordUrl)}">
								${MMX.encodeEntities(forgotPasswordText)}
							</mmx-button>
						</small>
					</div>
				</div>
				<div class="mmx-form-footer">
					<mmx-button
						id="login-form-submit"
						data-type="submit"
						data-width="full"
						data-theme="${MMX.encodeEntities(this.#buttonThemes.primary.available)}"
						data-theme-class="${MMX.encodeEntities(this.#buttonThemes.primary.classname)}"
					>
						${MMX.encodeEntities(loginButton)}
					</mmx-button>
					<mmx-button
						class="mmx-atwl-dialog__submit-button"
						href="${MMX.encodeEntities(registerUrl)}"
						data-width="full"
						data-theme="${MMX.encodeEntities(this.#buttonThemes.tertiary.available)}"
						data-theme-class="${MMX.encodeEntities(this.#buttonThemes.tertiary.classname)}"
						data-style="display-link"
					>
						${MMX.encodeEntities(registerText)}
					</mmx-button>
				</div>
			</form>
		`;
	}

	#bindLoginFormEvents() {
		this.#loginForm()?.addEventListener?.('submit', this.#onLoginFormSubmit.bind(this));
	}

	#loginForm() {
		return this.shadowRoot.querySelector('#login-form');
	}

	#loginFormMessage() {
		return this.shadowRoot.querySelector('#login-form-message');
	}

	#loginFormSubmit() {
		return this.shadowRoot.querySelector('#login-form-submit');
	}

	#onLoginFormSubmit(e) {
		e.preventDefault();

		this.#setLoginFormMessage();
		this.#setLoadingButton({
			button: this.#loginFormSubmit()
		});

		const formData = new FormData(this.#loginForm());

		this.#customerLogin({
			loginEmail: formData.get('Customer_LoginEmail'),
			password: formData.get('Customer_Password')
		})

			.finally(() => {
				this.#restoreLoadingButton(this.#loginFormSubmit());
			});
	}

	#customerLogin({loginEmail = '', password = ''} = {}) {
		return MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Runtime_Customer_Login',
				Customer_LoginEmail: loginEmail,
				Customer_Password: password
			}
		})
			.then(() => {
				this.#handleCustomerLoginSuccess();
			})
			.catch(response => {
				if (response?.error_code === 'customer_invalid_login') {
					this.#handleCustomerLoginInvalid(response?.error_message);
				}
				else {
					this.#handleCustomerLoginError(response);
				}
			});
	}

	#handleCustomerLoginSuccess() {
		this.#loadWishlists();
	}

	#handleCustomerLoginInvalid(errorMessage = '') {
		this.#setLoginFormMessage({
			style: 'error',
			message: errorMessage || 'Invalid email or password.'
		});
	}

	#setLoginFormMessage({message = '', style = 'info'} = {}) {
		if (MMX.valueIsEmpty(message)) {
			this.#loginFormMessage().innerHTML = '';
			return;
		}

		this.#loginFormMessage().innerHTML = /*html*/`
			<mmx-message data-style="${MMX.encodeEntities(style)}">
				${MMX.encodeEntities(message)}
			</mmx-message>
		`;
	}

	#handleCustomerLoginError(response) {
		this.#showDialogError({
			heading: 'Error logging in',
			content: response?.error_message ?? 'There was a problem logging you in.'
		});
	}

	// Add Wishlist
	#showAddWishlistDialog() {
		this.#showDialog({
			heading: MMX.coerceString(this.#settings?.add_wishlist?.heading?.value, {fallback: 'Create A Wishlist'}),
			content: this.#renderAddWishlistForm()
		});

		this.#bindAddWishlistEvents();
	}

	#renderAddWishlistForm() {
		const buttonText = MMX.coerceString(this.#settings?.add_wishlist?.button?.value, {fallback: 'Create Wishlist'});

		return /*html*/`
			<form class="mmx-form" id="add-wishlist-form">
				<div id="add-wishlist-form-message"></div>
				<div class="mmx-form-fields">
					<div class="mmx-form-field">
						<label class="mmx-form-label" for="WishList_Title">
							Title
						</label>
						<input type="text" name="WishList_Title" id="WishList_Title" class="mmx-form-input" required />
					</div>
					<div class="mmx-form-field">
						<label class="mmx-form-label" for="WishList_Notes">
							Notes
						</label>
						<textarea name="WishList_Notes" id="WishList_Notes" class="mmx-form-textarea"></textarea>
					</div>
					<div class="mmx-form-field">
						<label class="mmx-form-checkbox">
							<input type="checkbox" name="WishList_Shared" class="mmx-form-checkbox__input" value="yes">
							<span class="mmx-form-caption mmx-form-checkbox__caption">Make This Wishlist Public</span>
						</label>
					</div>
				</div>
				<div class="mmx-form-footer">
					<mmx-button
						id="add-wishlist-submit"
						data-type="submit"
						data-width="full"
						data-theme="${MMX.encodeEntities(this.#buttonThemes.primary.available)}"
						data-theme-class="${MMX.encodeEntities(this.#buttonThemes.primary.classname)}"
					>
						${MMX.encodeEntities(buttonText)}
					</mmx-button>
				</div>
			</form>
		`;
	}

	#bindAddWishlistEvents() {
		this.#addWishlistForm().addEventListener('submit', this.#onAddWishlistFormSubmit.bind(this));
	}

	#addWishlistForm() {
		return this.shadowRoot.querySelector('#add-wishlist-form');
	}

	#addWishlistSubmit() {
		return this.shadowRoot.querySelector('#add-wishlist-submit');
	}

	#addWishlistFormMessage() {
		return this.shadowRoot.querySelector('#add-wishlist-form-message');
	}

	#setAddWishlistFormMessage({message = '', style = 'info'} = {}) {
		if (MMX.valueIsEmpty(message)) {
			this.#addWishlistFormMessage().innerHTML = '';
			return;
		}

		this.#addWishlistFormMessage().innerHTML = /*html*/`
			<mmx-message data-style="${MMX.encodeEntities(style)}">
				${MMX.encodeEntities(message)}
			</mmx-message>
		`;
	}

	#onAddWishlistFormSubmit(e) {
		e.preventDefault();

		this.#setAddWishlistFormMessage();
		this.#setLoadingButton({
			button: this.#addWishlistSubmit()
		});

		const formData = new FormData(this.#addWishlistForm());

		this.#wishlistInsert({
			title: formData.get('WishList_Title'),
			notes: formData.get('WishList_Notes'),
			shared: formData.get('WishList_Shared')
		})
			.finally(() => {
				this.#restoreLoadingButton(this.#addWishlistSubmit());
			});
	}

	#wishlistInsert({title = '', notes = '', shared = false} = {}) {
		return MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Runtime_WishList_Insert',
				WishList_Title: title,
				WishList_Notes: notes,
				WishList_Shared: MMX.isTruthy(shared) ? true : false
			}
		})
			.then((response) => {
				this.#handleWishlistInsertSuccess(response?.data);
			})
			.catch(response => {
				if (response?.error_code === 'wishlist_customer_login') {
					this.#handleWishlistInsertLoginError();
				}
				else {
					this.#handleWishlistInsertError(response);
				}
			});
	}

	#handleWishlistInsertSuccess(wishlist = {}) {
		this.#addItemToWishlist(wishlist.id);
	}

	#handleWishlistInsertLoginError() {
		this.#showLoginDialog();
	}

	#handleWishlistInsertError(response) {
		this.#setAddWishlistFormMessage({
			style: 'error',
			message: response?.error_message ?? 'Error adding wishlist.'
		});
	}

	// Attribute Selection
	#showAttributeSelectionDialog() {
		this.#showDialog({
			heading: MMX.coerceString(this.#settings?.select_product_options?.heading?.value, {fallback: 'Select Product Options'}),
			content: this.#renderFeaturedProduct()
		});

		this.#bindAttributeSelectionEvents();
	}

	#renderFeaturedProduct() {
		const buttonText = MMX.coerceString(this.#settings?.select_product_options?.button?.value, {fallback: 'Add To Wishlist'});

		return /*html*/`
			<mmx-featured-product
				id="featured-product"
				class="mmx-atwl-dialog__featured-product"
				data-init="script"
			>
				<script type="application/json">
					${MMX.scriptSafeJSONStringify(this.#getFeaturedProductConfig())}
				</script>
			</mmx-featured-product>
			<mmx-button
				id="featured-product-submit"
				data-width="full"
				data-theme="${MMX.encodeEntities(this.#buttonThemes.primary.available)}"
				data-theme-class="${MMX.encodeEntities(this.#buttonThemes.primary.classname)}"
			>
				${MMX.encodeEntities(buttonText)}
			</mmx-button>
		`;
	}

	#getFeaturedProductConfig() {
		return {
			advanced: {
				product: {
					button: {
						settings: { enabled: false }
					},
					code: { value: false },
					sku: { value: false },
					discount: { value: false },
					multiple_images: { value: false },
					product_name_tag: { value: 'div' }
				},
			},
			product: {
				product: {
					product_code: this.#productCode
				}
			},
			text: {
				product_name: {
					product_name_style: { value: 'product-name' }
				}
			}
		};
	}

	#featuredProduct() {
		return this.shadowRoot.querySelector('#featured-product');
	}

	#featuredProductSubmit() {
		return this.shadowRoot.querySelector('#featured-product-submit');
	}

	#bindAttributeSelectionEvents() {
		this.#featuredProductSubmit().addEventListener('click', this.#onFeaturedProductSubmit.bind(this));
	}

	#onFeaturedProductSubmit(e) {
		e.preventDefault();

		if (this.#featuredProduct().reportFormValidity()) {
			this.#insertWishlistItemFromFeaturedProduct();
		}
	}

	#insertWishlistItemFromFeaturedProduct() {
		this.#insertWishlistItem({
			Attributes: this.#formDataToAttributes(this.#featuredProduct().formData)
		});
	}

	#formDataToAttributes(formData) {
		if (!formData || !(formData instanceof FormData)) {
			return [];
		}

		const attributes = [];
		let attribute = {};
		let index = 0;

		while (attribute !== null) {
			index += 1;

			attribute = {
				code: formData.get(`Product_Attributes[${index}]:code`) ?? undefined,
				template_code: formData.get(`Product_Attributes[${index}]:template_code`) ?? undefined,
				value: formData.get(`Product_Attributes[${index}]:value`) ?? undefined
			};

			if (MMX.valueIsEmpty(attribute.code)) {
				attribute = null;
				break;
			}

			attributes.push(attribute);
		}

		return attributes;
	}

	// Buttons
	#setLoadingButton({button, text = 'Processing...'} = {}) {
		if (!button) {
			return;
		}

		button.disabled = true;
		button.dataset.originalText = button.textContent;
		button.textContent = text;
	}

	#restoreLoadingButton(button) {
		button.disabled = false;
		button.textContent = button.dataset.originalText;
	}
}

if (!customElements.get('mmx-atwl-dialog')) {
	customElements.define('mmx-atwl-dialog', MMX_AtwlDialog);
}