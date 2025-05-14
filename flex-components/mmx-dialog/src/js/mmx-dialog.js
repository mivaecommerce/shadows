/**
 * MMX / DIALOG
 */

class MMX_Dialog extends MMX_Element {
	static get props() {
		return {
			'max-width': {
				allowAny: true,
				default: 'var(--mmx-site-wrapper-width)'
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-dialog'];
	renderUniquely = true;

	constructor() {
		super();
		this.makeShadow();
	}

	// Render
	render() {
		return /*html*/`
			<button part="trigger" type="button" title="Open Modal">
				<slot name="trigger"></slot>
			</button>
			<dialog part="dialog">
				<mmx-button
					part="dialog-close"
					data-style="secondary"
					data-shape="round"
					data-size="xs"
					title="Close Dialog"
				>
					<mmx-icon part="dialog-close-icon">cross</mmx-icon>
				</mmx-button>
				<div part="dialog-header">
					<slot name="header"></slot>
				</div>
				<div part="dialog-content">
					<slot name="content"></slot>
				</div>
			</dialog>
		`;
	}

	styles() {
		const maxWidth = this.getPropValue('max-width');

		if (MMX.valueIsEmpty(maxWidth)) {
			return '';
		}

		return /*css*/`
			:host {
				--mmx-dialog__max-width: ${maxWidth};
			}
		`;
	}

	afterRender() {
		this.#bindEvents();
	}

	// Elements
	#trigger() {
		return this.shadowRoot.querySelector('[part~="trigger"]');
	}

	#dialog() {
		return this.shadowRoot.querySelector('[part~="dialog"]');
	}

	#dialogClose() {
		return this.shadowRoot.querySelector('[part~="dialog-close"]');
	}

	// Events
	#bindEvents() {
		this.#trigger().addEventListener('click', (e) => {
			this.#onTriggerClick(e);
		});

		this.#dialogClose().addEventListener('click', (e) => {
			this.#onDialogCloseClick(e);
		});

		this.#dialog().addEventListener('close', (e) => {
			this.#onDialogClose(e);
		});
	}

	#onTriggerClick() {
		this.showModal();
	}

	#onDialogCloseClick() {
		this.close();
	}

	#onDialogClose() {
		this.dispatchEvent(new Event('close'));
	}

	// Public Methods
	get open() {
		return this.#dialog().open;
	}

	show() {
		return this.#dialog().show();
	}

	showModal() {
		return this.#dialog().showModal();
	}

	close() {
		return this.#dialog().close();
	}
}

if (!customElements.get('mmx-dialog')){
	customElements.define('mmx-dialog', MMX_Dialog);
}