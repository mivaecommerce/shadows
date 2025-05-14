class MMX_CombinationFacet extends MMX_Element {
	static get props() {
		return {
			'auto-submit': {
				default: true,
				isBoolean: true
			},
			'content-theme': {
				options: [
					'light',
					'dark',
					'invert'
				],
				default: 'light'
			},
			'controls-background-color': {
				allowAny: true,
				default: 'none'
			},
			'controls-border-radius': {
				allowAny: true,
				default: 8,
				isNumeric: true
			},
			'count-optional': {
				allowAny: true,
				default: 0,
				isNumeric: true
			},
			'destination-url': {
				allowAny: true
			},
			'destination-target': {
				allowAny: true,
				default: null
			},
			'facet-code': {
				allowAny: true,
				default: null
			},
			'input-size': {
				default: 'm',
				options: ['s', 'm', 'l']
			},
			'label-applied-theme': {
				allowAny: true,
				isBoolean: true,
				default: false
			},
			'label-applied-theme-class': {
				allowAny: true,
				default: ''
			},
			'label-applied-style': {
				allowAny: true,
				default: 'paragraph-s'
			},
			'label-applied-styles': {
				allowAny: true,
				default: ''
			},
			'label-applied-text': {
				allowAny: true,
				default: ''
			},
			'label-inactive-theme': {
				allowAny: true,
				isBoolean: true,
				default: false
			},
			'label-inactive-theme-class': {
				allowAny: true,
				default: ''
			},
			'label-inactive-style': {
				allowAny: true,
				default: 'paragraph-s'
			},
			'label-inactive-styles': {
				allowAny: true,
				default: ''
			},
			'label-inactive-text': {
				allowAny: true,
				default: ''
			},
			'reset-text': {
				allowAny: true,
				default: 'Reset'
			},
			'reset-style': {
				allowAny: true,
				default: 'primary'
			},
			'reset-size': {
				allowAny: true,
				default: 'm'
			},
			'reset-theme': {
				allowAny: true,
				isBoolean: true,
				default: false
			},
			'reset-theme-class': {
				allowAny: true,
				default: ''
			},
			'submit-text': {
				allowAny: true,
				default: 'Submit'
			},
			'submit-style': {
				allowAny: true,
				default: 'primary'
			},
			'submit-size': {
				allowAny: true,
				default: 'm'
			},
			'submit-theme': {
				allowAny: true,
				isBoolean: true,
				default: false
			},
			'submit-theme-class': {
				allowAny: true,
				default: ''
			},
			'text-align': {
				default: 'center',
				options: ['left', 'center', 'right']
			},
			'application-select-menu-background-color': {
				allowAny: true,
				default: ''
			},
			'application-label-unapplied': {
				allowAny: true,
				default: ''
			},
			'application-select-menu-title-text': {
				allowAny: true,
				default: ''
			},
			'application-add-text': {
				allowAny: true,
				default: 'Add New'
			},
			'application-dialog-add-heading': {
				allowAny: true,
				default: 'Add'
			},
			'application-dialog-add-button-text': {
				allowAny: true,
				default: 'Add'
			},
			'application-dialog-add-button-style': {
				allowAny: true,
				default: 'primary'
			},
			'application-dialog-add-button-size': {
				allowAny: true,
				default: 'm'
			},
			'application-dialog-add-button-theme': {
				allowAny: true,
				isBoolean: true,
				default: false
			},
			'application-dialog-add-button-theme-class': {
				allowAny: true,
				default: ''
			},
			'application-dialog-add-button-theme-width': {
				allowAny: true,
				default: 'full'
			},
			'application-dialog-edit-heading': {
				allowAny: true,
				default: 'Edit'
			},
			'application-dialog-edit-button-text': {
				allowAny: true,
				default: 'Save'
			},
			'application-dialog-edit-button-style': {
				allowAny: true,
				default: 'primary'
			},
			'application-dialog-edit-button-size': {
				allowAny: true,
				default: 'm'
			},
			'application-dialog-edit-button-theme': {
				allowAny: true,
				isBoolean: true,
				default: false
			},
			'application-dialog-edit-button-theme-class': {
				allowAny: true,
				default: ''
			},
			'application-dialog-edit-button-theme-width': {
				allowAny: true,
				default: 'full'
			},
			'application-delete-confirmation-text': {
				allowAny: true,
				default: ''
			},
			'application-width': {
				default: 'auto',
				isPercentage: true,
				allowAny: true
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-button', 'mmx-text', 'mmx-icons', 'mmx-forms', 'mmx-combination-facet'];
	renderUniquely = true;

	#facet;
	#eventOnWindowResize;

	#applications = [];
	#appliedValues = [];
	#currentApplication = null;
	#applicationIsAdding = false;
	#applicationIsUpdating = false;
	#applicationSelectMenuVisible = false;

	constructor() {
		super();
		this.makeShadow();
		this.#eventOnWindowResize = (event) => { this.#repositionApplicationMenu(); }
	}

	render() {
		return /*html*/`
			<div
				part="wrapper"
				class="
					mmx-combination-facet
					mmx-combination-facet--size-${MMX.encodeEntities(this.getPropValue('input-size'))}
					${this.#renderThemeClass()}
				">
				<div part="title" class="mmx-combination-facet__title">
					<slot name="title"></slot>
				</div>
				<form
					part="form"
					class="
						mmx-combination-facet__form
						${this.#renderFormApplicationClass()}
						${this.#renderFormLoadingClass()}
					"
					method="post"
					action="${MMX.encodeEntities(this.#destinationUrl())}"
					${this.#renderDestinationTarget()}
				>
					${this.#renderControls()}
				</form>
			</div>
		`;
	}

	styles() {
		const controlsBackgroundColor = this.getPropValue('controls-background-color');
		const applicationMenuBackgroundColor = this.getPropValue('application-select-menu-background-color');

		return /*css*/`
			.mmx-combination-facet {
				--mmx-combination-facet--controls-background-color: ${controlsBackgroundColor};
				--mmx-combination-facet--controls-border-radius: ${this.getPropValue('controls-border-radius')}px;
				--mmx-combination-facet--controls-padding: ${controlsBackgroundColor === 'none' ? '0' : 'var(--mmx-combination-facet--size)'};
				--mmx-combination-facet--text-align: ${this.getPropValue('text-align')};
				--mmx-combination-facet--application-width: ${this.getPropValue('application-width')};
				--mmx-combination-facet--application-select-menu-background-color: ${applicationMenuBackgroundColor.length ? applicationMenuBackgroundColor : 'var(--mmx-color-black)'};
			}
		`;
	}

	afterRender() {
		this.#bindEvents();
	}

	#bindEvents() {
		this.#form()?.addEventListener('submit', (e) => {
			this.#onFormSubmit(e);
		});

		this.#applicationMenuOptions()?.forEach((option, index) => {
			this.#applicationMenuOptionInput(option)?.addEventListener('change', (e) => {
				this.#onApplicationChange(option, index);
			});
		});

		this.#applicationMenuOptionEditButtons()?.forEach(button => {
			button.addEventListener('click', (e) => {
				this.#onApplicationEditButtonClicked(e, button);
			});
		});

		this.#applicationMenuOptionDeleteButtons()?.forEach(button => {
			button.addEventListener('click', (e) => {
				this.#onApplicationDeleteButtonClicked(e, button);
			});
		});

		this.#applicationSelect()?.addEventListener('click', (e) => {
			this.#onApplicationSelectMenuShow(e);
		});

		this.#applicationSelectMenu()?.addEventListener('toggle', (e) => {
			this.#onApplicationSelectMenuToggle(e);
		});

		this.#applicationSelectMenuTitle()?.addEventListener('click', (e) => {
			this.#onApplicationSelectMenuHide(e);
		});

		this.#applicationMenuAddLink()?.addEventListener('click', (e) => {
			this.#onApplicationAddLinkClicked(e);
		});

		this.#applicationAddDialogSaveButton()?.addEventListener('click', (e) => {
			this.#onApplicationAddDialogSaveButtonClicked(e);
		});

		this.#applicationAddDialogCancelButton()?.addEventListener('click', (e) => {
			this.#onApplicationAddDialogCancelButtonClicked(e);
		});

		this.#applicationEditDialogSaveButton()?.addEventListener('click', (e) => {
			this.#onApplicationEditDialogSaveButtonClicked(e);
		});

		this.#applicationEditDialogCancelButton()?.addEventListener('click', (e) => {
			this.#onApplicationEditDialogCancelButtonClicked(e);
		});

		const facet_dropdown_controller = this.#facetDropdownController();

		if (facet_dropdown_controller) {
			facet_dropdown_controller.onFacetSelectionComplete = () => { this.submitForm(); };
			facet_dropdown_controller.addEventListener('contentUpdated', (e) => {
				this.debouncedDispatchContentUpdated();
			});

			if (this.#facet) {
				facet_dropdown_controller.setFacet(this.#facet, this.#appliedValues);
			}
		}
	}

	onDataChange() {
		MMX.setElementAttributes(this, {
			'data-auto-submit': this.data?.advanced?.auto_submit?.value,
			'data-content-theme': this.data?.advanced?.content_theme?.value,
			'data-controls-background-color': this.data?.controls?.background_color?.value,
			'data-controls-border-radius': this.data?.controls?.border_radius?.value,
			'data-count-optional': this.data?.advanced?.count_optional?.value,
			'data-destination-url': this.data?.controls?.submit_destination?.url,
			'data-destination-target': this.data?.controls?.submit_destination?.new_tab ? '_blank' : undefined,
			'data-facet-code': this.data?.controls?.facet_code?.value,
			'data-input-size': this.data?.controls?.input_size?.value,
			'data-label-applied-theme': this.data?.controls?.label_applied?.textsettings?.fields?.normal?.typography_theme?.theme_available,
			'data-label-applied-theme-class': this.data?.controls?.label_applied?.textsettings?.fields?.normal?.typography_theme?.classname,
			'data-label-applied-style': this.data?.controls?.label_applied?.textsettings?.fields?.normal?.label_applied_style?.value,
			'data-label-applied-styles': this.data?.controls?.label_applied?.textsettings?.styles?.normal,
			'data-label-applied-text': this?.data?.controls?.label_applied?.value,
			'data-label-inactive-theme': this.data?.controls?.label_inactive?.textsettings?.fields?.normal?.typography_theme?.theme_available,
			'data-label-inactive-theme-class': this.data?.controls?.label_inactive?.textsettings?.fields?.normal?.typography_theme?.classname,
			'data-label-inactive-style': this.data?.controls?.label_inactive?.textsettings?.fields?.normal?.label_inactive_style?.value,
			'data-label-inactive-styles': this.data?.controls?.label_inactive?.textsettings?.styles?.normal,
			'data-label-inactive-text': this?.data?.controls?.label_inactive?.value,
			'data-reset-text': this?.data?.controls?.reset_button?.value,
			'data-reset-style': this?.data?.controls?.reset_button?.textsettings?.fields?.normal?.button_style?.value,
			'data-reset-size': this?.data?.controls?.reset_button?.textsettings?.fields?.normal?.button_size?.value,
			'data-reset-theme': this?.data?.controls?.reset_button?.textsettings?.fields?.normal?.button_theme?.theme_available,
			'data-reset-theme-class': this?.data?.controls?.reset_button?.textsettings?.fields?.normal?.button_theme?.classname,
			'data-submit-text': this?.data?.controls?.submit_button?.value,
			'data-submit-style': this?.data?.controls?.submit_button?.textsettings?.fields?.normal?.button_style?.value,
			'data-submit-size': this?.data?.controls?.submit_button?.textsettings?.fields?.normal?.button_size?.value,
			'data-submit-theme': this?.data?.controls?.submit_button?.textsettings?.fields?.normal?.button_theme?.theme_available,
			'data-submit-theme-class': this?.data?.controls?.submit_button?.textsettings?.fields?.normal?.button_theme?.classname,
			'data-text-align': this.data?.content?.align?.value,
			'data-application-label-unapplied': this.data?.application?.label_unapplied?.value,
			'data-application-select-menu-title-text': this.data?.application?.menu_title_text?.value,
			'data-application-add-text': this.data?.application?.add_text?.value,
			'data-application-dialog-add-heading': this.data?.application?.dialog_add_heading?.value,
			'data-application-dialog-add-button-text': this?.data?.application?.dialog_add_button?.value,
			'data-application-dialog-add-button-style': this?.data?.application?.dialog_add_button?.textsettings?.fields?.normal?.button_style?.value,
			'data-application-dialog-add-button-size': this?.data?.application?.dialog_add_button?.textsettings?.fields?.normal?.button_size?.value,
			'data-application-dialog-add-button-theme': this?.data?.application?.dialog_add_button?.textsettings?.fields?.normal?.button_theme?.theme_available,
			'data-application-dialog-add-button-theme-class': this?.data?.application?.dialog_add_button?.textsettings?.fields?.normal?.button_theme?.classname,
			'data-application-dialog-add-button-theme-width': this?.data?.application?.dialog_add_button?.textsettings?.fields?.normal?.button_width?.value,
			'data-application-dialog-edit-heading': this.data?.application?.dialog_edit_heading?.value,
			'data-application-dialog-edit-button-text': this?.data?.application?.dialog_edit_button?.value,
			'data-application-dialog-edit-button-style': this?.data?.application?.dialog_edit_button?.textsettings?.fields?.normal?.button_style?.value,
			'data-application-dialog-edit-button-size': this?.data?.application?.dialog_edit_button?.textsettings?.fields?.normal?.button_size?.value,
			'data-application-dialog-edit-button-theme': this?.data?.application?.dialog_edit_button?.textsettings?.fields?.normal?.button_theme?.theme_available,
			'data-application-dialog-edit-button-theme-class': this?.data?.application?.dialog_edit_button?.textsettings?.fields?.normal?.button_theme?.classname,
			'data-application-dialog-edit-button-theme-width': this?.data?.application?.dialog_edit_button?.textsettings?.fields?.normal?.button_width?.value,
			'data-application-delete-confirmation-text': this.data?.application?.delete_confirmation_text?.value,
			'data-application-width': this.data?.application?.width?.value,
			'data-application-select-menu-background-color': this.data?.background?.background_color?.value
		});
	}

	attributeChanged(name, oldValue, newValue) {
		if (name === 'data-facet-code' && newValue !== oldValue) {
			this.#loadFacet();
		}
	}

	// Render

	#renderThemeClass() {
		const contentTheme = this.getPropValue('content-theme');
		let themeClass = `mmx-combination-facet__content-theme-${contentTheme}`;

		if (['dark', 'dark--l'].includes(contentTheme)) {
			themeClass += ' mmx-theme--' + contentTheme;
		}

		return themeClass;
	}

	#renderFormApplicationClass() {
		if (!this.#hasApplications()) {
			return '';
		}

		return 'mmx-combination-facet__form-application';
	}

	#renderFormLoadingClass() {
		if (this.#facetStatus() !== 'loading') {
			return '';
		}

		return 'mmx-combination-facet__form-loading';
	}

	#renderControls() {
		const facetStatus = this.#facetStatus();
		switch (facetStatus) {
			case 'missing-code':
				return this.#renderMessage({
					code: facetStatus,
					message: 'The combination facet code is required.'
				});
			case 'loading':
				return this.#renderLoadingForm();
			case 'not-found':
				return this.#renderMessage({
					code: facetStatus,
					message: `Combination facet "${MMX.encodeEntities(this.getPropValue('facet-code'))}" does not exist.`
				});
			case 'missing-fields':
				return this.#renderMessage({
					code: facetStatus,
					message: `Combination facet "${this.#facet?.name}" does not have any fields to select.`
				});
			case 'valid':
				return this.#renderDropdownForm();
			case 'load-failure':
			default:
				return this.#renderMessage({
					code: facetStatus,
					message: 'There was a problem loading the facet.'
				});
		}
	}

	#renderMessage({code = '', message = ''} = {}) {
		return /*html*/`
			<div
				part="message ${MMX.encodeEntities(code)}"
				class="mmx-combination-facet__message"
			>
				${message}
			</div>`;
	}

	#renderLoadingForm() {
		return /*html*/`
			${this.#renderLabelText()}
			<div part="loading" class="mmx-combination-facet__loading"></div>
			${this.#renderSubmitButton()}
		`;
	}

	#renderDropdownForm() {
		return /*html*/`
			${this.#renderDropdownContent()}
			${this.#renderSubmitButton()}
		`;
	}

	#renderDropdownContent() {
		if (this.#hasApplications()) {
			return this.#renderApplications();
		}

		return this.#renderDefaultSelection();
	}

	#renderDefaultSelection() {
		return /*html*/`
			${this.#renderLabelText()}
			${this.#renderDropdowns(true)}
		`;
	}

	#renderDropdowns(include_auto_submit) {
		const auto_submit = include_auto_submit ? `data-auto-submit="${MMX.encodeEntities(this.getPropValue('auto-submit'))}"` : '';

		return /*html*/`
			<mmx-combination-facet-fields
				part="mmx-combination-facet-fields"
				exportparts="dropdown, dropdown-select"
				class="mmx-combination-facet__fields"
				${auto_submit}
				data-count-optional="${MMX.encodeEntities(this.getPropValue('count-optional'))}"
			></mmx-combination-facet-fields>
		`;
	}

	#renderApplications() {
		return /*html*/`
			${this.#renderApplicationSelect()}
			${this.#renderApplicationSelectMenu()}
			${this.#renderApplicationAddDialog()}
			${this.#renderApplicationEditDialog()}
		`;
	}

	#renderApplicationSelect() {
		return /*html*/`
			<div
				part="application-select"
				class="mmx-combination-facet__application-select"
			>
				${this.#renderApplicationSelectTitle()}
				${this.#renderApplicationSelectArrow()}
			</div>
		`;
	}

	#renderApplicationSelectTitle() {
		return /*html*/`
			<div class="mmx-combination-facet__application-select-title">
				${this.#renderApplicationSelectLabel()}
				${this.#renderApplicationSelectText()}
			</div>
		`;
	}

	#renderApplicationSelectLabel() {
		return /*html*/`
			${this.renderTextProperty(this?.data?.application?.label_applied, {
				prefix: 'label_',
				className: 'mmx-combination-facet__dialog-application-select-label',
				defaultStyle: 'subheading-s'
			})}
		`;
	}

	#renderApplicationSelectText() {
		let text;

		if (this.#currentApplication)	text = this.#currentApplication.name.length ? this.#currentApplication.name : this.#currentApplication.fields.join(' ');
		else							text = this.getPropValue('application-label-unapplied');

		return /*html*/`
			<span
				part="application-select-text"
				class="mmx-combination-facet__application-select-text"
			>
				${MMX.encodeEntities(text)}
			</span>
		`;
	}

	#renderApplicationSelectArrow() {
		return /*html*/`
			<span class="mmx-combination-facet__application-select-toggle"><mmx-icon data-size="8px">chevron-down</mmx-icon></span>
		`;
	}

	#renderApplicationSelectMenu() {
		return /*html*/`
			<div
				part="application-select-menu"
				class="mmx-combination-facet__application-select-menu"
				popover
			>
				${this.#renderApplicationSelectMenuTitle()}
				${this.#renderApplicationSelectMenuOptions()}
				${this.#renderApplicationSelectMenuDivider()}
				${this.#renderApplicationSelectMenuAddLink()}
			</div>
		`;
	}

	#renderApplicationSelectMenuTitle() {
		return /*html*/`
			<a
				part="application-select-menu-title"
				class="mmx-combination-facet__application-select-menu-title"
			>
				<span class="mmx-combination-facet__application-select-menu-title-text">${MMX.encodeEntities(this.getPropValue('application-select-menu-title-text'))}</span>
				<span class="mmx-combination-facet__application-select-menu-title-toggle"><mmx-icon data-size="8px">chevron-up</mmx-icon></span>
			</a>
		`;
	}

	#renderApplicationSelectMenuOptions() {
		let options = /*html*/``;

		return this.#applications.reduce((i, application) => {
			const checked = this.#currentApplication?.id === application.id ? 'checked' : '';
			const name = application.name.length ? application.name : application.fields.join(' ');

			options += /*html*/`
				<div
					data-application-id="${MMX.encodeEntities(application.id)}"
					part="application-select-menu-option ${checked ? 'application-select-menu-option-selected' : ''}"
					class="mmx-combination-facet__application-select-menu-option ${checked ? 'selected' : ''}"
				>
					<label class="mmx-form-radio mmx-combination-facet__application-select-menu-option-radio">
 						<input type="radio" class="mmx-form-radio-input mmx-combination-facet__application-select-menu-option-input" value="${MMX.encodeEntities(application.id)}" name="CombinationFacetCustomerApplication" ${checked} />
 						<span class="mmx-form-radio-caption mmx-combination-facet__application-select-menu-option-name">${MMX.encodeEntities(name)}</span>
 					</label>
 					<mmx-button
 						part="application-select-menu-option-edit"
 						class="mmx-combination-facet__application-select-menu-option-edit-button"
 						exportparts="button: submit__inner"
 						data-style="secondary-link"
 						data-size="m"
 					>
 						Edit
 					</mmx-button>
 					<mmx-button
 						part="application-select-menu-option-delete"
 						class="mmx-combination-facet__application-select-menu-option-delete-button"
 						exportparts="button: submit__inner"
 						data-style="secondary-link"
 						data-size="s"
 					>
 						<mmx-icon data-size="16px">remove</mmx-icon></span>
 					</mmx-button>
				</div>
			`;

			return options;
		}, options);
	}

	#renderApplicationSelectMenuDivider() {
		return /*html*/`
			<div class="mmx-combination-facet__application-select-menu-divider"></div>
		`;
	}

	#renderApplicationSelectMenuAddLink() {
		return /*html*/`
			<mmx-button
				part="application-select-menu-add-link"
				class="mmx-combination-facet__application-select-menu-add-link"
				exportparts="button: submit__inner"
				data-style="secondary-link"
				data-size="m"
			>
				<mmx-icon class="mmx-combination-facet__application-select-menu-add-link-icon" data-size="16px">add-circle</mmx-icon><span class="mmx-combination-facet__application-select-menu-add-link-text">${MMX.encodeEntities(this.getPropValue('application-add-text'))}</span>
			</mmx-button>
		`;
	}

	#renderApplicationAddDialog() {
		const disabled = this.#applicationIsAdding ? 'disabled' : '';
		const theme_available = this.getPropValue('application-dialog-add-button-theme');

		return /*html*/`
			<dialog class="mmx-combination-facet__application-add-dialog" part="application-add-dialog">
				<mmx-text
					part="application-dialog-add-heading"
					class="mmx-combination-facet__application-add-dialog-heading"
					data-style="title-3"
				>
					${MMX.encodeEntities(this.getPropValue('application-dialog-add-heading'))}
				</mmx-text>

				<button
					type="button"
					class="mmx-combination-facet__application-add-dialog-close"
					part="application-add-dialog-close"
					title="Close"
				>
					<mmx-icon data-size="28px" class="mmx-combination-facet__application-add-dialog-close-icon" part="application-add-dialog-close-icon">exit-circle</mmx-icon>
				</button>

				<input type="text" placeholder="Name (Optional)" class="mmx-combination-facet__application-add-dialog-name-input mmx-form-input mmx-form--size-l" value="" />

				${this.#renderDropdowns(false)}

				<mmx-button
					part="application-dialog-add-button"
					exportparts="button: button__inner"
					class="mmx-combination-facet__application-add-dialog-save"
					data-style="${MMX.encodeEntities(this.getPropValue('application-dialog-add-button-style'))}"
					data-size="${MMX.encodeEntities(this.getPropValue('application-dialog-add-button-size'))}"
					data-theme="${MMX.encodeEntities(theme_available)}"
					data-theme-class="${MMX.encodeEntities(this.getPropValue('application-dialog-add-button-theme-class'))}"
					data-width="${!theme_available ? 'full' : MMX.encodeEntities(this.getPropValue('application-dialog-add-button-theme-width'))}"
					${disabled}
				>
					${this.renderThemeStylesheetTemplate(theme_available)}
					${this.#applicationIsAdding ? 'Saving' : MMX.encodeEntities(this.getPropValue('application-dialog-add-button-text'))}
				</mmx-button>
			</dialog>
		`;
	}

	#renderApplicationEditDialog() {
		const disabled = this.#applicationIsAdding ? 'disabled' : '';
		const theme_available = this.getPropValue('application-dialog-edit-button-theme');

		return /*html*/`
			<dialog class="mmx-combination-facet__application-edit-dialog" part="application-edit-dialog">
				<mmx-text
					part="application-dialog-edit-heading"
					class="mmx-combination-facet__application-edit-dialog-heading"
					data-style="title-3"
				>
					${MMX.encodeEntities(this.getPropValue('application-dialog-edit-heading'))}
				</mmx-text>

				<button
					type="button"
					class="mmx-combination-facet__application-edit-dialog-close"
					part="application-edit-dialog-close"
					title="Close"
				>
					<mmx-icon data-size="28px" class="mmx-combination-facet__application-edit-dialog-close-icon" part="application-edit-dialog-close-icon">exit-circle</mmx-icon>
				</button>

				<input type="text" placeholder="Name (Optional)" class="mmx-combination-facet__application-edit-dialog-name-input mmx-form-input mmx-form--size-l" value="" />

				${this.#renderDropdowns(false)}

				<mmx-button
					part="application-dialog-edit-button"
					exportparts="button: button__inner"
					class="mmx-combination-facet__application-edit-dialog-save"
					data-style="${MMX.encodeEntities(this.getPropValue('application-dialog-edit-button-style'))}"
					data-size="${MMX.encodeEntities(this.getPropValue('application-dialog-edit-button-size'))}"
					data-theme="${MMX.encodeEntities(theme_available)}"
					data-theme-class="${MMX.encodeEntities(this.getPropValue('application-dialog-edit-button-theme-class'))}"
					data-width="${!theme_available ? 'full' : MMX.encodeEntities(this.getPropValue('application-dialog-edit-button-theme-width'))}"
					${disabled}
				>
					${this.renderThemeStylesheetTemplate(theme_available)}
					${this.#applicationIsUpdating ? 'Saving' : MMX.encodeEntities(this.getPropValue('application-dialog-edit-button-text'))}
				</mmx-button>
			</dialog>
		`;
	}

	#renderLabelText() {
		const labelType = this.#hasAppliedValues() ? 'applied' : 'inactive';
		const labelText = this.getPropValue(`label-${labelType}-text`);

		if (typeof labelText !== 'string' || !labelText?.length) {
			return '';
		}

		const theme_available = this.getPropValue(`label-${labelType}-theme`);

		return /*html*/`
			<mmx-text
				part="label label-${labelType}"
				class="mmx-combination-facet__label"
				data-theme="${MMX.encodeEntities(theme_available)}"
				data-theme-class="${MMX.encodeEntities(this.getPropValue(`label-${labelType}-theme-class`))}"
				data-style="${MMX.encodeEntities(this.getPropValue(`label-${labelType}-style`))}"
			>
				${this.renderLegacyStylesTemplate(theme_available, this.getPropValue(`label-${labelType}-styles`))}
				${this.renderThemeStylesheetTemplate(theme_available)}
				${MMX.encodeEntities(labelText)}
			</mmx-text>
		`;
	}

	#renderSubmitButton() {
		if (!this.#hasApplications() && this.#hasAppliedValues()) {
			return this.#renderResetButton();
		}

		const disabled = this.#facetStatus() === 'loading' ? 'disabled' : '';

		return /*html*/`
			<mmx-button
				part="submit submit-apply"
				class="mmx-combination-facet__submit"
				exportparts="button: submit__inner"
				data-type="submit"
				data-style="${MMX.encodeEntities(this.getPropValue('submit-style'))}"
				data-size="${MMX.encodeEntities(this.getPropValue('submit-size'))}"
				data-theme="${MMX.encodeEntities(this.getPropValue('submit-theme'))}"
				data-theme-class="${MMX.encodeEntities(this.getPropValue('submit-theme-class'))}"
				data-width="full"
				${disabled}
			>
				${this.renderThemeStylesheetTemplate(this.getPropValue('submit-theme'))}
				${MMX.encodeEntities(this.getPropValue('submit-text'))}
			</mmx-button>
		`;
	}

	#renderResetButton() {
		const disabled = this.#facetStatus() === 'loading' ? 'disabled' : '';

		return /*html*/`
			<mmx-button
				part="submit submit-reset"
				class="mmx-combination-facet__submit"
				exportparts="button: submit__inner"
				data-type="submit"
				data-style="${MMX.encodeEntities(this.getPropValue('reset-style'))}"
				data-size="${MMX.encodeEntities(this.getPropValue('reset-size'))}"
				data-theme="${MMX.encodeEntities(this.getPropValue('reset-theme'))}"
				data-theme-class="${MMX.encodeEntities(this.getPropValue('reset-theme-class'))}"
				data-width="full"
				${disabled}
			>
				${this.renderThemeStylesheetTemplate(this.getPropValue('reset-theme'))}
				${MMX.encodeEntities(this.getPropValue('reset-text'))}
			</mmx-button>
		`;
	}

	#renderDestinationTarget() {
		const target = this.getPropValue('destination-target');
		return target ? `target="${MMX.encodeEntities(target)}"` : '';
	}

	// Selectors

	#form() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__form');
	}

	#facetDropdownController() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__form > mmx-combination-facet-fields');
	}

	#applicationSelect() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-select');
	}

	#applicationSelectText() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-select-text');
	}

	#applicationSelectMenu() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-select-menu');
	}

	#applicationSelectMenuTitle() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-select-menu-title');
	}

	#applicationMenuOptions() {
		return this.shadowRoot.querySelectorAll('.mmx-combination-facet__application-select-menu-option');
	}

	#applicationSelectedMenuOption() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-select-menu-option.selected');
	}

	#applicationMenuOptionInput(option) {
		return option.querySelector('.mmx-combination-facet__application-select-menu-option-input');
	}

	#applicationMenuOptionEditButtons() {
		return this.shadowRoot.querySelectorAll('.mmx-combination-facet__application-select-menu-option-edit-button');
	}

	#applicationMenuOptionDeleteButtons() {
		return this.shadowRoot.querySelectorAll('.mmx-combination-facet__application-select-menu-option-delete-button');
	}

	#applicationMenuAddLink() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-select-menu-add-link');
	}

	#applicationAddDialog() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-add-dialog');
	}

	#applicationAddDialogNameField() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-add-dialog-name-input');
	}

	#applicationAddDialogFacetDropdownController() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-add-dialog mmx-combination-facet-fields');
	}

	#applicationAddDialogSaveButton() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-add-dialog-save');
	}

	#applicationAddDialogCancelButton() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-add-dialog-close');
	}

	#applicationEditDialog() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-edit-dialog');
	}

	#applicationEditDialogFacetDropdownController() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-edit-dialog mmx-combination-facet-fields');
	}

	#applicationEditDialogNameField() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-edit-dialog-name-input');
	}

	#applicationEditDialogSaveButton() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-edit-dialog-save');
	}

	#applicationEditDialogCancelButton() {
		return this.shadowRoot.querySelector('.mmx-combination-facet__application-edit-dialog-close');
	}

	// Facet

	#facetStatus() {
		const facetVariableType = MMX.variableType(this.#facet);

		if (!this.#hasFacetCode()) {
			return 'missing-code';
		}

		if (facetVariableType === 'undefined') {
			return 'loading';
		}

		if (facetVariableType !== 'object') {
			return 'load-failure';
		}

		if (!this.#facet.code?.length) {
			return 'not-found';
		}

		if (this.#fieldCount() === 0) {
			return 'missing-fields';
		}

		return 'valid';
	}

	#hasFacetCode() {
		const facetCode = this.getPropValue('facet-code');
		return typeof facetCode === 'string' && facetCode.length > 0;
	}

	#loadFacet() {
		if (!this.#hasFacetCode()) {
			this.forceUpdate();
			return;
		}

		this.#setFacet(undefined, []);

		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'combofacets',
				Module_Function: 'Runtime_CombinationFacetData_Load',
				CombinationFacet_Code: this.getPropValue('facet-code')
			}
		})
		.then(response => {
			if (!response.data.facet){
				throw new Error( 'Invalid response' );
			}

			this.#afterLoadFacet(response.data);
		})
		.catch((error) => {
			if (error?.error_message === 'Unable to load combination facet') {
				this.#setFacet({}, []);
				return;
			}

			this.#setFacet(null, []);
		})
		.finally(() => {
			this.forceUpdate();
		});
	}

	#afterLoadFacet(data) {
		this.#setFacet(data.facet, data.applied_values);
		this.#setApplications(data.customer_applications);

		if (!this.#hasApplications() && this.#hasAppliedValues()) {
			this.forceUpdate();
			return;
		}
	}

	// Fields

	#fieldCount() {
		return MMX.coerceNumber(this.#facet?.fields?.length, 0);
	}

	#setFacet(facet, appliedValues) {
		const facetVariableType = MMX.variableType(facet);

		if (facetVariableType === 'undefined')		this.#facet = undefined;
		else if (facetVariableType !== 'object' )	this.#facet = null;
		else										this.#facet = Array.isArray(facet.fields) ? structuredClone(facet) : {};

		this.#appliedValues	= Array.isArray(appliedValues) ? appliedValues : [];
		this.#facet?.fields?.map(field => { return this.#setField(field); });

		const facet_dropdown_controller = this.#facetDropdownController();

		if (facet_dropdown_controller) {
			facet_dropdown_controller.setFacet(this.#facet, this.#appliedValues);
		}
	}

	#setField(field = {}) {
		if (typeof field.code !== 'string') {
			return field;
		}

		field.selection = typeof field.selection === 'string' ? field.selection : '';
		field.values = Array.isArray(field.values) ? field.values : [];

		return field;
	}

	// Applications

	#setApplications(applications) {
		this.#applications = applications;
		this.#setApplication(null);

		if (this.#hasCustomerSession() && this.#hasAppliedValues()) {
			const currentApplied = this.#appliedValues.join(' ');

			for (const application of this.#applications) {
				if (currentApplied === application.fields.join(' ')) {
					this.#setApplication(application);
					break;
				}
			}
		}
	}

	#setApplication(application) {
		var text;
		const label = this.#applicationSelectText();
		this.#currentApplication = application;

		if (label) {
			if (application)	text = application.name.length ? application.name : application.fields.join(' ');
			else				text = this.getPropValue('application-label-unapplied');

			label.textContent = text;
		}
	}

	#getApplication(applicationId) {
		return this.#applications.find(application => application.id == applicationId);
	}

	#hasApplications() {
		return this.#applications?.length > 0 ?? false;
	}

	// Applied Values

	#hasAppliedValues() {
		return this.#appliedValues.length > 0;
	}

	#hasCustomerSession() {
		return Array.isArray(this.#applications);
	}

	// Form

	#formIsValid() {
		return this.#facetDropdownController()?.allRequiredDropdownsHaveValues?.();
	}

	#onFormSubmit(e) {
		e.preventDefault();

		if (!this.#hasApplications() && this.#hasAppliedValues()) {
			this.#clearCookie();
			return;
		}

		this.submitForm();
	}

	submitForm() {
		if (this.#hasApplications()) {
			return this.submitFormApplication();
		}

		this.#setCookie();
	}

	submitFormApplication() {
		const selected_option = this.#applicationSelectedMenuOption();

		if (selected_option) {
			const application = this.#getApplication(this.#applicationMenuOptionInput(selected_option)?.value);

			if (application) {
				this.#setApplicationCookie(application.id);
			}
		}
	}

	#getBaseDestinationUrl() {
		const destinationUrl = this.getPropValue('destination-url');

		if (MMX.valueIsEmpty(destinationUrl)) {
			return new URL(window.location.href);
		}

		try {
			return new URL(destinationUrl);
		}
		catch (e) {
			return new URL(destinationUrl, window.location.origin);
		}
	}

	#searchParamKeysToRemove = ['action', 'offset', 'alloffset', 'catlistingoffset', 'relatedoffset', 'searchoffset'];

	#destinationUrl() {
		const url = this.#getBaseDestinationUrl();

		url.searchParams.forEach((value, key) => {
			if (this.#searchParamKeysToRemove.includes(key.toLocaleLowerCase())) {
				url.searchParams.delete(key, value);
			}
		});

		return url;
	}

	// Application Event Handlers

	#onApplicationChange(option, index) {
		this.#applicationMenuOptions()?.forEach((loop_option, loop_index) => {
			if (loop_index === index) {
				loop_option.classList.add('selected');
				loop_option.part = 'application-select-menu-option application-select-menu-option-selected';
			}
			else {
				loop_option.classList.remove('selected');
				loop_option.part = 'application-select-menu-option';
			}
		});

		this.#hideApplicationMenu();

		const application = this.#getApplication(this.#applicationMenuOptionInput(option)?.value);

		if (application) {
			this.#setApplication(application);

			if (this.getPropValue('auto-submit')) {
				this.submitForm();
			}
		}
	}

	#onApplicationEditButtonClicked(event, button) {
		event.preventDefault();

		const application = this.#getApplication(button?.parentNode?.getAttribute('data-application-id'));

		if (application) {
			this.#showApplicationEditDialog(application);
		}
	}

	#onApplicationDeleteButtonClicked(event, button) {
		event.preventDefault();
		this.#hideApplicationMenu();

		const application = this.#getApplication(button?.parentNode?.getAttribute('data-application-id'));
		const delete_confirmation_text = this.getPropValue('application-delete-confirmation-text');

		if (!application) {
			return;
		}

		if (MMX.valueIsEmpty(delete_confirmation_text))	this.#deleteApplication(application.id);
		else if (confirm(delete_confirmation_text))		this.#deleteApplication(application.id);
	}

	#onApplicationSelectMenuShow(event) {
		event.preventDefault();
		this.#showApplicationMenu();
	}

	#onApplicationSelectMenuToggle(event) {
		if (event.newState === 'open')	this.#showApplicationMenuLowLevel();
		else							this.#hideApplicationMenuLowLevel();
	}

	#onApplicationSelectMenuHide(event) {
		event.preventDefault();
		this.#hideApplicationMenu();
	}

	#onApplicationAddLinkClicked(event) {
		event.preventDefault();
		this.#showApplicationAddDialog();
	}

	#onApplicationAddDialogSaveButtonClicked(event) {
		event.preventDefault();
		this.#addApplication();
	}

	#onApplicationAddDialogCancelButtonClicked(event) {
		event.preventDefault();
		this.#hideApplicationAddDialog();
	}

	#onApplicationEditDialogSaveButtonClicked(event) {
		event.preventDefault();

		const application = this.#getApplication(this.#applicationEditDialog()?.getAttribute('data-application-id'));

		if (application) {
			this.#updateApplication(application.id);
		}
	}

	#onApplicationEditDialogCancelButtonClicked(event) {
		event.preventDefault();
		this.#hideApplicationEditDialog();
	}

	// Application Element Toggles

	#showApplicationMenu() {
		this.#applicationSelectMenu().showPopover?.();
	}

	#showApplicationMenuLowLevel() {
		if (this.#applicationSelectMenuVisible) {
			return;
		}

		this.#applicationSelectMenuVisible = true;

		this.#repositionApplicationMenu();
		window?.addEventListener('resize', this.#eventOnWindowResize);
	}

	#hideApplicationMenu() {
		this.#applicationSelectMenu().hidePopover?.();
	}

	#hideApplicationMenuLowLevel() {
		if (!this.#applicationSelectMenuVisible) {
			return;
		}

		this.#applicationSelectMenuVisible = false;
		window?.removeEventListener('resize', this.#eventOnWindowResize);
	}

	#repositionApplicationMenu() {
		if (!this.#applicationSelectMenuVisible) {
			return;
		}

		const menu = this.#applicationSelectMenu();
		const dropdown = this.#applicationSelect();

		if (!menu || !dropdown) {
			return;
		}

		const rect_dropdown 		= dropdown.getBoundingClientRect();
		const rect_menu_parent		= document.body.getBoundingClientRect();

		const overflow_x			= computedStyleValue(document.body, 'overflow-x');
		const overflow_y			= computedStyleValue(document.body, 'overflow-y');
		const scroll_from_top		= ((overflow_y === 'scroll' || overflow_y === 'auto') ? document.body.scrollTop : 0);

		menu.style.top				= ((rect_dropdown.top - rect_menu_parent.top) - scroll_from_top) + 'px';
		menu.style.left				= (rect_dropdown.left - rect_menu_parent.left) + 'px';
		menu.style.width			= (rect_dropdown.width) + 'px';
	}

	#enableApplicationAddDialogButton() {
		const button = this.#applicationAddDialogSaveButton();

		if (button) {
			button.removeAttribute('disabled');
			button.textContent = this.getPropValue('application-dialog-add-button-text');
		}
	}

	#disableApplicationAddDialogButton() {
		const button = this.#applicationAddDialogSaveButton();

		if (button) {
			button.setAttribute('disabled', '');
			button.textContent = 'Saving';
		}
	}

	#enableApplicationEditDialogButton() {
		const button = this.#applicationEditDialogSaveButton();

		if (button) {
			button.removeAttribute('disabled');
			button.textContent = this.getPropValue('application-dialog-edit-button-text');
		}
	}

	#disableApplicationEditDialogButton() {
		const button = this.#applicationEditDialogSaveButton();

		if (button) {
			button.setAttribute('disabled', '');
			button.textContent = 'Saving';
		}
	}

	#showApplicationAddDialog() {
		const facet = structuredClone(this.#facet);
		const dialog = this.#applicationAddDialog();
		const input_name = this.#applicationAddDialogNameField();
		const facet_dropdown_controller = this.#applicationAddDialogFacetDropdownController();

		if (!facet || !dialog || !input_name || !facet_dropdown_controller) {
			return;
		}

		facet.fields?.forEach(field => {
			field.values	= [];
			field.selection	= '';
		});

		input_name.value = '';
		facet_dropdown_controller.setFacet(facet, []);
		dialog.showModal();
		input_name.focus();
	}

	#hideApplicationAddDialog() {
		this.#applicationAddDialog().close();
	}

	#showApplicationEditDialog(application) {
		const facet = structuredClone(this.#facet);
		const dialog = this.#applicationEditDialog();
		const input_name = this.#applicationEditDialogNameField();
		const facet_dropdown_controller = this.#applicationEditDialogFacetDropdownController();

		if (!facet || !application || !dialog || !input_name || !facet_dropdown_controller) {
			return;
		}

		facet.fields?.forEach(field => {
			field.values	= [];
			field.selection	= '';
		});

		facet_dropdown_controller.setFacet(facet, application.fields);
		facet_dropdown_controller.setEditable();

		input_name.value = application.name;
		dialog.setAttribute('data-application-id', application.id);
		dialog.showModal();
		input_name.focus();
	}

	#hideApplicationEditDialog() {
		this.#applicationEditDialog().close();
	}

	// Set Cookie
	#setCookie(data) {
		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'combofacets',
				Module_Function: 'Runtime_CombinationFacetAppliedValueList_Set_Cookie',
				CombinationFacet_Code: this.getPropValue('facet-code'),
				CombinationFacetValues: this.#facetDropdownController()?.allDropdownValues?.()
			}
		})
		.then(() => {
			this.#afterSetCookie();
		})
		.catch(response => {});
	}

	#afterSetCookie() {
		this.#form().action = this.#destinationUrl();
		this.#form().submit();
	}

	// Clear Cookie
	#clearCookie() {
		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'combofacets',
				Module_Function: 'Runtime_CombinationFacetAppliedValueList_Clear_Cookie',
				CombinationFacet_Code: this.getPropValue('facet-code')
			}
		})
		.then(() => {
			this.#afterClearCookie();
		})
		.catch(response => {});
	}

	#afterClearCookie() {
		window.location.reload();
	}

	// Application Management

	#setApplicationCookie(id) {
		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'combofacets',
				Module_Function: 'Runtime_CombinationFacetCustomerApplication_Set_Cookie',
				Application_ID: id
			}
		})
		.then(response => {
			this.#afterSetCookie();
		})
		.catch(error => {
			this.#onError(error);
		});
	}

	#addApplication() {
		this.#applicationIsAdding = true;
		this.#disableApplicationAddDialogButton();

		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'combofacets',
				Module_Function: 'Runtime_CombinationFacetCustomerApplication_Insert',
				CombinationFacet_Code: this.getPropValue('facet-code'),
				Application_Name: this.#applicationAddDialogNameField()?.value ?? '',
				CombinationFacetValues: this.#applicationAddDialogFacetDropdownController()?.allDropdownValues?.()
			}
		})
		.then(response => {
			this.#setApplicationCookie(response.data.id);
		})
		.catch(error => {
			this.#onError(error);
		})
		.finally(() => {
			this.#applicationIsAdding = false;
			this.#enableApplicationAddDialogButton();
		});
	}
	#updateApplication(applicationId) {
		this.#applicationIsUpdating = true;
		this.#disableApplicationEditDialogButton();

		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'combofacets',
				Module_Function: 'Runtime_CombinationFacetCustomerApplication_Update',
				CombinationFacet_Code: this.getPropValue('facet-code'),
				Application_ID: applicationId,
				Application_Name: this.#applicationEditDialogNameField()?.value ?? '',
				CombinationFacetValues: this.#applicationEditDialogFacetDropdownController()?.allDropdownValues?.()
			}
		})
		.then(response => {
			this.#loadFacet();
		})
		.catch(error => {
			this.#onError(error);
		})
		.finally(() => {
			this.#applicationIsUpdating = false;
			this.#enableApplicationEditDialogButton();
		});
	}

	#deleteApplication(applicationId) {
		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'combofacets',
				Module_Function: 'Runtime_CombinationFacetCustomerApplication_Delete',
				Application_ID: applicationId
			}
		})
		.then(response => {
			if (this.#currentApplication?.id == applicationId) {
				this.#clearCookie();
			} else {
				this.#loadFacet();
			}
		})
		.catch(error => {
			this.#onError(error);
		});
	}

	#onError(error) {
		if (!error?.validation_error) {
			alert(error?.error_message || 'An unknown error has occurred');
			return;
		}

		alert(error?.error_field_message);

		if (this.#applicationIsAdding) {
			if (error.error_field === 'Application_Name') {
				this.#applicationAddDialogNameField()?.focus?.();
			}
		}
		else if (this.#applicationIsUpdating) {
			if (error.error_field === 'Application_Name') {
				this.#applicationEditDialogNameField()?.focus?.();
			}
		}
	}
}

if (!customElements.get('mmx-combination-facet')) {
	customElements.define('mmx-combination-facet', MMX_CombinationFacet);
}

class MMX_CombinationFacetFields extends MMX_Element {
	static get props() {
		return {
			'auto-submit': {
				default: true,
				isBoolean: true
			},
			'count-optional': {
				allowAny: true,
				default: 0,
				isNumeric: true
			}
		};
	}

	renderUniquely = true;

	#facet = null;
	#appliedValues = [];

	// Parent class overrides

	render() {
		if (!this.#facet) {
			return '';
		}

		return /*html*/`
			${this.#renderDropdowns()}
		`;
	}

	afterRender() {
		this.#bindEvents();
	}

	#bindEvents() {
		this.#dropdowns()?.forEach((dropdown, index) => {
			dropdown.addEventListener('change', () => {
				this.#onDropdownChange({dropdown, index});
			});
		});
	}

	// Render

	#renderDropdowns() {
		return this.#facet?.fields?.map((field, index) => {
			return this.#renderDropdown(field, index);
		}).join('');
	}

	#renderDropdown(field, index = 0) {
		const required = index < this.#fieldCount() - this.#optionalDropdownCount() ? 'required' : '';
		const disabled = field.values.length > 0 ? '' : 'disabled';

		return /*html*/`
			<div
				part="dropdown"
				class="mmx-combination-facet__dropdown"
			>
				<select
					part="dropdown-select"
					class="mmx-combination-facet__dropdown-select"
					data-field-code="${MMX.encodeEntities(field.code)}"
					title="${MMX.encodeEntities(field.name)}"
					${required}
					${disabled}
				>
					${this.#renderDropdownOptions(field)}
				</select>
			</div>
		`;
	}

	#renderDropdownOptions(field) {
		const firstOption = field.appliedValue ?? field.name;
		let options = /*html*/`<option value="">${MMX.encodeEntities(firstOption)}</option>`;

		return field.values.reduce((options, value) => {
			const selected = field.selection === value ? 'selected' : '';
			options += /*html*/`<option ${selected}>${MMX.encodeEntities(value)}</option>`;
			return options;
		}, options);
	}

	// Fields

	#fieldCount() {
		return MMX.coerceNumber(this.#facet?.fields?.length, 0);
	}

	#getFieldByIndex(index = 0) {
		return this.#facet?.fields?.at(index);
	}

	#loadFieldValues(fieldIndex) {
		fieldIndex = MMX.coerceNumber(fieldIndex, -1);
		this.#loadFieldValuesLowLevel(fieldIndex, this.#getDependentCombinationFacetValues(fieldIndex), true);
	}

	#loadFieldValuesLowLevel(fieldIndex, values, set_focus) {
		fieldIndex = MMX.coerceNumber(fieldIndex, -1);
		const hasNextField = fieldIndex < this.#fieldCount() - 1;

		if (!hasNextField) {
			return;
		}

		if (!this.#facet) {
			return;
		}

		MMX.Runtime_JSON_API_Call({
			params: {
				Function: 'Module',
				Module_Code: 'combofacets',
				Module_Function: 'Runtime_CombinationFacetValueList_Load_Field',
				CombinationFacet_Code: this.#facet.code,
				CombinationFacetValues: values
			}
		})
		.then(response => {
			this.#afterLoadFieldValues(response.data, fieldIndex, set_focus);
		})
		.catch(response => {});
	}

	#afterLoadFieldValues(values, fieldIndex, set_focus) {
		values = Array.isArray(values) ? values : [];

		const nextFieldIndex = fieldIndex + 1;
		const nextField = this.#getFieldByIndex(nextFieldIndex);
		nextField.values = values;

		this.forceUpdate();

		if (set_focus && nextFieldIndex > 0) {
			this.#dropdowns()?.[nextFieldIndex].focus();
		}
	}

	#hasAppliedValues() {
		return this.#appliedValues.length > 0;
	}

	// Dropdowns

	#dropdowns() {
		return this.querySelectorAll('.mmx-combination-facet__dropdown-select');
	}

	#optionalDropdownCount() {
		return MMX.coerceNumber(this.getPropValue('count-optional'), this.constructor.props['count-optional'].default);
	}

	#allDropdownsHaveValues() {
		return this.allDropdownValues().length === this.#fieldCount();
	}

	#getDropdownByFieldCode(fieldCode) {
		return Array.from(this.#dropdowns()).find(dropdown => dropdown.dataset.fieldCode === fieldCode);
	}

	#getDependentCombinationFacetValues(index = -1) {
		return Array.from(this.#dropdowns()).slice(0, index + 1).reduce(this.#reduceDependentCombinationFacetValue, []);
	}

	#reduceDependentCombinationFacetValue(values, dropdown) {
		values.push(dropdown.value);
		return values;
	}

	#reduceDropdownValue(values, dropdown) {
		if (dropdown.value) {
			values.push(dropdown.value);
		}
		return values;
	}

	#onDropdownChange({dropdown, index} = {}) {
		const field = this.#getFieldByIndex(index);
		field.selection = dropdown.value;
		this.#clearDependentDropdowns(index);

		if (this.getPropValue('auto-submit') && this.#allDropdownsHaveValues()) {
			this.onFacetSelectionComplete();
			return;
		}

		if (Array.from(this.#dropdowns()).indexOf(dropdown) === -1) {
			this.forceUpdate();
		}

		if (field.selection) {
			this.#loadFieldValues(index);
		}
	}

	#clearDependentDropdowns(index = -1) {
		this.#facet?.fields?.slice(index + 1).forEach(field => {
			field.selection = '';
			field.values = [];

			const dropdown = this.#getDropdownByFieldCode(field.code);
			dropdown.value = '';
			dropdown.innerHTML = this.#renderDropdownOptions(field);
			dropdown.disabled = true;
		});
	}

	// Public Functions

	allRequiredDropdownsHaveValues() {
		return this.allDropdownValues().length >= this.#fieldCount() - this.#optionalDropdownCount();
	}

	allDropdownValues() {
		return Array.from(this.#dropdowns()).reduce(this.#reduceDropdownValue, []);
	}

	setFacet(facet, appliedValues) {
		this.#facet			= facet;
		this.#appliedValues	= Array.isArray(appliedValues) ? appliedValues : [];

		this.#facet?.fields?.map((field, index) => {
			field.appliedValue	= this.#appliedValues.at(index);
			field.selection		= field.appliedValue;

			if (!field.appliedValue && this.#hasAppliedValues()) {
				field.appliedValue = `Any ${field.name}`;
			}

			return field;
		});

		this.forceUpdate();

		if (!this.#hasAppliedValues()) {
			this.#loadFieldValues();
		}
	}

	setEditable() {
		if (this.#hasAppliedValues()) {
			for (const [index, field] of this.#facet.fields.entries()) {
				const appliedValue = this.#appliedValues.at(index);

				field.selection = appliedValue;

				if (MMX.valueIsEmpty(appliedValue))	field.appliedValue = `Any ${field.name}`;
				else								field.appliedValue = undefined;

				this.#loadFieldValuesLowLevel(index - 1, this.#appliedValues.slice(0, index), false);
			};
		}
	}

	// Callbacks

	onFacetSelectionComplete() { ; }
}

if (!customElements.get('mmx-combination-facet-fields')) {
	customElements.define('mmx-combination-facet-fields', MMX_CombinationFacetFields);
}