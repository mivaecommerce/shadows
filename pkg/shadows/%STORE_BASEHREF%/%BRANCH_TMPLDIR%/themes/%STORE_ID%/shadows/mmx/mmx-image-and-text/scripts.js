/**
 * MMX / IMAGE AND TEXT
 */
class MMX_ImageAndText extends MMX_Hero {

	static get props() {
		return MMX_ImageAndText.reduceProps(MMX.copy(MMX_Hero.props));
	}

	static reduceProps(props) {
		props['content-location'].options = ['left', 'right'];
		props['content-location'].default = 'left';
		props['size'].options = ['auto', 's', 'm', 'l'];
		delete props['content-height'];
		return props;
	}

	constructor() {
		super();
	}

	onDataChange() {
		this.setSpacing(this.data?.advanced?.spacing);
		MMX.setElementAttributes(this, {
			'data-href': this.data?.link?.url,
			'data-size': this.data?.image?.size?.value,
			'data-content-theme': this.data?.advanced?.content_theme?.value,
			'data-content-width': this.data?.layout?.content_width?.value,
			'data-content-location': this.data?.layout?.image_position?.value,
			'data-align': this.data?.content?.align?.value,
			'data-content-bg-color--mobile': this.data?.advanced?.text_background?.settings?.enabled ? this.data?.advanced?.text_background?.color?.value : undefined,
			'data-content-bg-color--desktop': this.data?.advanced?.text_background?.settings?.enabled ? this.data?.advanced?.text_background?.color?.value : undefined,
			'data-subheading': this.data?.content?.settings?.enabled ? this.data?.content?.subheading?.value : undefined,
			'data-subheading-style': this.data?.content?.settings?.enabled ? this.data?.content?.subheading?.textsettings?.fields?.normal?.subheading_style?.value : undefined,
			'data-heading': this.data?.content?.settings?.enabled ? this.data?.content?.heading?.value : undefined,
			'data-heading-style': this.data?.content?.settings?.enabled ? this.data?.content?.heading?.textsettings?.fields?.normal?.heading_style?.value : undefined,
			'data-heading-tag': this.data?.content?.settings?.enabled ? this.data?.content?.heading?.textsettings?.fields?.normal?.heading_tag?.value : undefined,
			'data-body': this.data?.content?.settings?.enabled ? this.data?.content?.body?.value : undefined,
			'data-body-style': this.data?.content?.settings?.enabled ? this.data?.content?.body?.textsettings?.fields?.normal?.body_style?.value : undefined,
			'data-button': this.data?.content?.settings?.enabled && this.data?.content?.button?.settings?.enabled ? this.data?.content?.button?.button_text?.value : undefined,
			'data-button-style': this.data?.content?.settings?.enabled && this.data?.content?.button?.settings?.enabled ? this.data?.content?.button?.button_text?.textsettings?.fields?.normal?.button_style?.value : undefined,
			'data-button-size': this.data?.content?.settings?.enabled && this.data?.content?.button?.settings?.enabled ? this.data?.content?.button?.button_text?.textsettings?.fields?.normal?.button_size?.value : undefined,
		});
	}
}

if (!customElements.get('mmx-image-and-text')) {
	customElements.define('mmx-image-and-text', MMX_ImageAndText);
}
