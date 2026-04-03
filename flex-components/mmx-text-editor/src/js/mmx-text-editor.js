/**
 * MMX / RICH TEXT EDITOR
 */
class MMX_TextEditor extends MMX_Element {

	static get props() {
		return {
			content: {
				allowAny: true,
				default: ''
			},
			width: {
				default: 'auto',
				isPercentage: true,
				allowAny: true
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-text-editor'];

	constructor() {
		super();
		this.makeShadow();
	}

	render() {
		return /*html*/`
			<div part="content" class="mmx-text-editor">
				${this.renderContent()}
				<slot></slot>
			</div>
		`;
	}

	styles() {
		return /*css*/`
			:host {
				--mmx-text-editor__width: ${MMX.encodeEntities(this.getPropValue('width'))};
			}
		`;
	}

	renderContent() {
		return this.getPropValue('content');
	}
}

if (!customElements.get('mmx-text-editor')) {
	customElements.define('mmx-text-editor', MMX_TextEditor);
}