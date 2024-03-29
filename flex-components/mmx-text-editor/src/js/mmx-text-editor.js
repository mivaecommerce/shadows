/**
 * MMX / RICH TEXT EDITOR
 */
class MMX_TextEditor extends MMX_Element {

	static get props() {
		return {
			content: {
				allowAny: true,
				default: ''
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

	renderContent() {
		return this.getPropValue('content');
	}
}

if (!customElements.get('mmx-text-editor')) {
	customElements.define('mmx-text-editor', MMX_TextEditor);
}