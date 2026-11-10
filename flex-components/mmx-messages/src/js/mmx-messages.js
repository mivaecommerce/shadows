/**
 * MMX / MESSAGE
 */

class MMX_Message extends MMX_Element {

	static get props() {
		return {
			align: {
				options: ['left', 'center', 'right'],
				default: 'center'
			},
			display: {
				options: ['inline', 'inline-block', 'block'],
				default: 'block'
			},
			size: {
				options: ['s', 'm', 'l'],
				default: 'm'
			},
			style: {
				options: ['info', 'warning', 'error', 'success'],
				default: ''
			},
			variant: {
				options: ['flag', 'minimal', 'pill'],
				default: ''
			},
			theme: {
				allowAny: true,
				isBoolean: true,
				default: false
			},
			'theme-class': {
				allowAny: true,
				default: ''
			},
			dom: {
				options: ['light', 'shadow'],
				default: 'shadow'
			},
			'auto-remove': {
				allowAny: true,
				isNumeric: true,
				default: 0
			},
			dismissible: {
				isBoolean: true,
				default: false
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-text', 'mmx-messages', 'mm-theme-styles'];
	renderUniquely = true;

	constructor() {
		super();
		this.makeComponent();
	}

	styles() {
		if (!this.#shouldRenderTheme()) {
			return '';
		}

		// mm-theme-styles is un-layered and sets inline-flex, so restate the display after it
		return /*css*/`
			:host .mmx-message-theme {
				align-items: var(--mmx-theme-message__align-items, normal);
				display: var(--mmx-theme-message__display, ${this.getPropValue('display')});
				gap: var(--mmx-theme-message__gap, normal);
				justify-content: normal;
			}
		`;
	}

	render() {
		if (this.#shouldRenderTheme()) {
			return this.#renderTheme();
		}

		return this.#renderLegacy();
	}

	#shouldRenderTheme() {
		return MMX.isTruthy(this.getPropValue('theme'));
	}

	#renderLegacy() {
		return /*html*/`
			<div
				part="wrapper"
				class="
					mmx-message
					mmx-message--align-${this.getPropValue('align')}
					mmx-message--display-${this.getPropValue('display')}
					mmx-message--size-${this.getPropValue('size')}
					mmx-message--style-${this.getPropValue('style')}
					mmx-message--variant-${this.getPropValue('variant')}
				"
			>
				${this.renderContent()}
				${this.renderClose()}
			</div>
		`;
	}

	#renderTheme() {
		return /*html*/`
			${this.#renderThemeStylesheet()}
			<div
				class="
					mmx-message-theme
					mmx-message--align-${this.getPropValue('align')}
					mmx-message--display-${this.getPropValue('display')}
					${MMX.encodeEntities(this.getPropValue('theme-class'))}
				"
			>
				${this.renderContent()}
				${this.renderClose()}
			</div>
		`;
	}

	#renderThemeStylesheet() {
		const theme_stylesheet = this.querySelector(':scope > template[data-theme-stylesheet]');

		if (!theme_stylesheet) {
			return '';
		}

		return /*html*/`
			<style type="text/css">
				${theme_stylesheet.content.textContent}
			</style>
		`;
	}

	renderContent() {
		if (this.getPropValue('dom') === 'shadow') {
			return this.innerHTML;
		}

		return '<slot></slot>';
	}

	renderClose() {
		if (!MMX.isTruthy(this.getPropValue('dismissible'))) {
			return '';
		}

		return /*html*/`
			<button type="button" part="close" aria-label="Dismiss">
				<mmx-icon data-name="cross"></mmx-icon>
			</button>
		`;
	}

	afterRender() {
		this.#listenForClose();
		this.#initializeAutoRemove();
	}

	#listenForClose() {
		if (!MMX.isTruthy(this.getPropValue('dismissible'))) {
			return;
		}

		this.on('click', '[part~="close"]', () => {
			this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
			this.#removeSelf();
		});
	}

	#removal = 0;

	#initializeAutoRemove() {
		const duration = MMX.coerceNumber(this.getPropValue('auto-remove'), 0);

		if (!(duration > 0)) {
			return;
		}

		clearTimeout(this.#removal);

		this.#removal = setTimeout(() => {
			this.#removeSelf();
		}, duration);
	}

	#removeSelf() {
		this.remove();
	}
}

if (!customElements.get('mmx-message')) {
	customElements.define('mmx-message', MMX_Message);
}