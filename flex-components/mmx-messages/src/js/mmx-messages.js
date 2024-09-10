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
			dom: {
				options: ['light', 'shadow'],
				default: 'shadow'
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-text', 'mmx-messages'];
	renderUniquely = true;

	constructor() {
		super();
		this.makeShadow();
	}

	render() {
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
			</div>
		`;
	}

	renderContent() {
		if (this.getPropValue('dom') === 'shadow') {
			return this.innerHTML;
		}

		return '<slot></slot>';
	}
}

if (!customElements.get('mmx-message')){
	customElements.define('mmx-message', MMX_Message);
}