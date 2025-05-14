/**
 * MMX / TEXT
 */
class MMX_Text extends MMX_Element {

	static get props() {
		return {
			align: {
				options: [
					'left',
					'center',
					'right'
				],
				default: 'unset'
			},
			tag: {
				options: [
					'h1',
					'h2',
					'h3',
					'h4',
					'h5',
					'h6',
					'p',
					'div',
					'span'
				],
				default: 'div'
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
			style: {
				options: [
					'display-1',
					'display-2',
					'display-3',
					'title-1',
					'title-2',
					'title-3',
					'title-4',
					'subheading-l',
					'subheading-s',
					'subheading-xs',
					'paragraph-l',
					'paragraph-s',
					'paragraph-xs',
					'call-to-action'
				],
				allowAny: true,
				default: 'paragraph-s'
			},
			'chars-per-line': {
				options: [
					'auto',
					'ideal',
					'none'
				],
				default: 'auto',
				allowAny: true
			},
			'max-words': {
				allowAny: true,
				isNumeric: true
			},
			'max-chars': {
				allowAny: true,
				isNumeric: true
			},
			'trim-suffix': {
				options: [
					'',
					'...'
				],
				default: '',
				allowAny: true
			},
			dom: {
				options: ['light', 'shadow'],
				default: 'light'
			},
			source: {
				options: ['markdown'],
				default: '',
				allowAny: true
			},
			'hide-on-empty': {
				allowAny: true,
				isBoolean: true,
				default: true
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-text', 'mm-theme-styles'];

	copyTypes = [
		'paragraph-l',
		'paragraph-s',
		'paragraph-xs',
		'call-to-action'
	];

	headingTagToStyle = {
		h1: 'display-2',
		h2: 'display-3',
		h3: 'title-1',
		h4: 'title-2',
		h5: 'title-3',
		h6: 'title-4'
	};

	idealCharsPerLine = 28; // An ideal count for larger fonts like headings & promo content

	constructor() {
		super();
		this.makeShadow();
	}

	render() {
		const theme = this.getPropValue('theme');

		if (theme)	return this.#renderTheme();
		else		return this.#renderLegacy();
	}

	get hideOnEmpty()
	{
		return this.getPropValue('hide-on-empty');
	}

	#renderLegacy() {
		const tag = this.getPropValue('tag');
		const legacy_styles = this.#renderLegacyStyles();

		if (legacy_styles?.length) {
			this.setAttribute('style', legacy_styles);
		}

		return /*html*/`
			<${tag} class="mmx-text type-${this.getStyleProp()} ${this.getStyleState()}" part="text" ${this.inheritAttrs()}>
				<span class="mmx-text__inner" part="text__inner">
					${this.renderContent()}
				</span>
			</${tag}>
		`;
	}

	#renderLegacyStyles() {
		return this.querySelector(':scope > template[data-legacy-styles]')?.content?.textContent?.trim?.() ?? '';
	}

	#renderTheme() {
		const tag = this.getPropValue('tag');
		const theme_class = this.getPropValue('theme-class');

		return /*html*/`
			${this.#renderThemeStylesheet()}
			<${tag} class="mmx-theme-text ${MMX.encodeEntities(theme_class)}" ${this.inheritAttrs()}>
				<span class="mmx-text__inner" part="text__inner">
					${this.renderContent()}
				</span>
			</${tag}>
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

	styles() {
		return /*css*/`
			:host {
				--mmx-text__inner--max-width: ${this.getInnerMaxWidth()};
				--mmx-text__text-align: ${this.getPropValue('align')};
			}

			${this.shadowDomStyles()}
		`;
	}

	shadowDomStyles() {
		const style = this.getAttribute('style');

		if (!style || !this.shouldRenderInShadowDom()) {
			return '';
		}

		return /*css*/`
			:where(h1, h2, h3, h4, h5, h6) {
				${style};
			}
		`;
	}

	renderContent() {
		const maxChars = this.getPropValue('max-chars');
		const maxWords = this.getPropValue('max-words');

		if (typeof maxChars === 'number') {
			return this.renderContentByMaxChars(maxChars);
		}

		return this.renderContentByMaxWords(maxWords);
	}

	renderContentByMaxChars(maxChars) {
		return this.renderMaxContent(maxChars, '', '');
	}

	renderContentByMaxWords(maxWords) {
		return this.renderMaxContent(maxWords, /\s+/, ' ');
	}

	renderMaxContent(maxCount = 0, splitOn = '', joinWith = '') {
		const parts = this.textContent.trim().split(splitOn);
		if (typeof maxCount === 'undefined' || maxCount === 0 || parts.length <= maxCount) {
			return this.renderSlottedContent();
		}

		const trimmedParts = parts.slice(0, maxCount).join(joinWith);
		return trimmedParts + this.getPropValue('trim-suffix');
	}

	shouldRenderInShadowDom() {
		return this.getPropValue('source') === 'markdown' || this.getPropValue('dom') === 'shadow';
	}

	renderSlottedContent() {
		if (this.shouldRenderInShadowDom()) {
			return this.innerHTML;
		}

		return '<slot></slot>';
	}

	getInnerMaxWidth() {
		const charsPerLine = this.getPropValue('chars-per-line');

		if (charsPerLine === 'none'){
			return 'unset';
		}
		else if (charsPerLine === 'ideal'){
			return this.idealCharsPerLine + 'ch';
		}
		else if (charsPerLine === 'auto'){
			const type = this.getPropValue('style');
			const isCopyType = this.copyTypes.includes(type);

			if (isCopyType){
				return 'unset';
			} else {
				return this.idealCharsPerLine + 'ch';
			}
		}
		else if (!isNaN(charsPerLine)) {
			return charsPerLine + 'ch';
		}

		return charsPerLine;
	}

	getStyleWithoutDefault() {
		if (this.hasPropValue('style')) {
			return this.getPropValue('style');
		}

		if (this.hasPropValue('tag')) {
			const tag = this.getPropValue('tag');
			if (tag in this.headingTagToStyle) {
				return this.headingTagToStyle[tag];
			}
		}

		return '';
	}

	getStyleProp() {
		return this.getStyleWithoutDefault() || MMX_Text.props.style.default;
	}

	getStyleState() {
		if (this.getStyleWithoutDefault()) {
			return 'mmx-text--styled';
		}

		return 'mmx-text--unstyled';
	}
}

if (!customElements.get('mmx-text')){
	customElements.define('mmx-text', MMX_Text);
}