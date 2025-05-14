/**
 * MMX / IMAGE GALLERY
 */
class MMX_ImageGallery extends MMX_Element {

	static get props() {
		return {};
	}

	styleResourceCodes = ['mmx-base', 'mmx-image-gallery'];
	renderUniquely = true;

	constructor() {
		super();
		this.makeShadow();
		this.#bindComponentEvents();
	}

	// Data
	#images = [];
	#settings = {};
	#imageType;

	onDataChange() {
		this.#setImages(this.data?.images);
		this.#setSettings(this.data?.settings);
	}

	#setImages(images) {
		this.#images = Array.isArray(images) ? images : [];
	}

	get images() {
		return this.#images;
	}

	#setSettings(settings) {
		this.#settings = MMX.variableType(settings) === 'object' ? settings : {};
	}

	setImages(images) {
		const imageType = this.#imageType;

		this.#setImages(images);
		this.forceUpdate();
		this.#moveToImageType(imageType);
	}

	// Render
	render() {
		if (!this.#images?.length) {
			return '';
		}

		return /*html*/`
			<div part="wrapper" class="mmx-image-gallery">
				${this.#renderMain()}
				${this.#renderThumbnail()}
				${this.#renderCloseup()}
			</div>
		`;
	}

	// Component Events
	#bindComponentEvents() {
		this.addEventListener('keydown', (e) => {
			this.#onKeyDown(e);
		});

		this.addEventListener('slider:interaction', (e) => {
			this.#onSliderInteraction(e);
		});
	}

	#onKeyDown(e) {
		switch (e.key) {
			case 'ArrowLeft':
				this.moveToPrev();
				break;
			case 'ArrowRight':
				this.moveToNext();
				break;
			default:
				break;
		}
	}

	#onSliderInteraction(e) {
		const position = MMX.coerceNumber(e.detail.position, 0);
		this.moveToSlide(position);
	}

	// Render Events
	afterRender() {
		this.#bindEvents();
		this.#updateSliders();
	}

	#bindEvents() {
		if (this.#thumbnailEnabled()) {
			this.#slides('thumbnail').forEach((slide, index) => {
				this.#addEngagementListener(slide, () => {
					this.#onThumbnailSlideEngage(index);
				});
			});
		}

		if (this.#closeupEnabled()) {
			this.#slides('main').forEach((slide, index) => {
				this.#addEngagementListener(slide, () => {
					this.#onMainSlideEngage(index);
				});
			});

			this.#closeupCloseButton().addEventListener('click', () => {
				this.closeCloseup();
			});
		}
	}

	#addEngagementListener(element, callback) {
		element?.addEventListener?.('click', (e) => {
			callback?.(e);
		});

		element?.addEventListener?.('keydown', (e) => {
			if ([' ', 'Enter'].includes(e.key)) {
				e.preventDefault();
				callback?.(e);
			}
		});
	}

	// Slider
	#sliders() {
		return this.shadowRoot.querySelectorAll('mmx-hero-slider');
	}

	#slider(part = 'main') {
		return this.shadowRoot.querySelector(`[part~="${part}"]`);
	}

	#slides(part = 'main') {
		return this.shadowRoot.querySelectorAll(`[part~="${part}"] > mmx-hero > img`);
	}

	#invokeOnSliders(method, ...args) {
		this.#sliders().forEach(slider => {
			slider?.[method]?.(...args);
		});

		this.#updateSliders();
	}

	moveToSlide(position) {
		this.#invokeOnSliders('moveToSlide', position);
	}

	moveToNext() {
		this.#invokeOnSliders('moveToNext');
	}

	moveToPrev() {
		this.#invokeOnSliders('moveToPrev');
	}

	#updateSliders() {
		this.#saveImageType();
		this.#updateCloseupCount();
	}

	#renderImagesSlider({location = 'main', perPage = 1, maxWidth = 'none', arrowStyle = 'caret', navStyle = '', dimensions = '580x580'} = {}) {
		const settings = this.#settings?.[location];
		const allowFocus = location === 'thumbnail' || (location === 'main' && this.#closeupEnabled());

		arrowStyle = String(settings.arrow_style?.value ?? arrowStyle);
		dimensions = String(settings?.dimensions?.value ?? dimensions);
		navStyle = String(settings.nav_style?.value ?? navStyle);
		perPage = MMX.coerceNumber(settings.per_page?.value, perPage);

		return /*html*/`
			<mmx-hero-slider
				data-autoplay="false"
				part="${MMX.encodeEntities(location)}"
				data-per-page="${MMX.encodeEntities(perPage)}"
				data-arrow-style="${MMX.encodeEntities(arrowStyle)}"
				data-nav-style="${MMX.encodeEntities(navStyle)}"
				data-size="${MMX.encodeEntities(dimensions)}"
				data-max-width="${MMX.encodeEntities(maxWidth)}"
				data-peek="${MMX.encodeEntities(Math.floor(MMX.coerceNumber(dimensions.split('x').at(0)) / 3))}"
			>
				${this.#images.map(image => {
					return this.#renderImagesSlide({image, dimensions, allowFocus});
				}).join('')}
			</mmx-hero-slider>
		`;
	}

	#renderImagesSlide({image = {}, dimensions = '580x580', allowFocus = false} = {}) {
		const resizedImage = image.sizes?.[dimensions] ?? image.sizes?.original;
		const imageFit = this.#settings?.fit?.value ?? 'contain';
		const tabIndex = allowFocus ? 'tabindex=0' : '';

		return typeof resizedImage?.url !== 'string' ? '' : /*html*/`
			<mmx-hero slot="hero_slide" data-fit="${MMX.encodeEntities(imageFit)}" data-tag="div">
				<img slot="image" src="${MMX.encodeEntities(resizedImage.url)}" loading="lazy" alt="" ${tabIndex} />
			</mmx-hero>
		`;
	}

	// Main
	#renderMain() {
		return this.#renderImagesSlider({location: 'main'});
	}

	#onMainSlideEngage(index = 0) {
		this.openCloseup(index);
	}

	// Thumbnail
	#thumbnailEnabled(){
		return this.#images.length > 1 && this.#settings?.thumbnail?.settings?.enabled;
	}

	#renderThumbnail() {
		if (!this.#thumbnailEnabled()) {
			return '';
		}

		return this.#renderImagesSlider({location: 'thumbnail', perPage: 9, arrowStyle: 'none', navStyle: 'none', maxWidth: 'auto'});
	}

	#onThumbnailSlideEngage(index = 0) {
		this.moveToSlide(index);
	}

	// Closeup
	#closeupEnabled(){
		return this.#images.length > 0 && this.#settings?.closeup?.settings?.enabled;
	}

	#closeup() {
		return this.shadowRoot.querySelector('[part~="closeup"]');
	}

	#closeupDialog() {
		return this.shadowRoot.querySelector('[part~="closeup-dialog"]');
	}

	#closeupCloseButton() {
		return this.shadowRoot.querySelector('[part~="closeup-close-button"]');
	}

	#closeupCount() {
		return this.shadowRoot.querySelector('[part~="closeup-count"]');
	}

	#renderCloseup() {
		if (!this.#closeupEnabled()) {
			return '';
		}

		return /*html*/`
			<dialog part="closeup-dialog">
				${this.#renderCloseupHeader()}
				${this.#renderCloseupMain()}
				${this.#renderCloseupFooter()}
			</dialog>
		`;
	}

	#renderCloseupHeader() {
		return /*html*/`
			<div part="closeup-header">
				<mmx-button
					part="closeup-button closeup-close-button"
					data-style="secondary"
					data-shape="round"
					data-size="xs"
					title="Close Dialog"
				>
					<mmx-icon part="closeup-icon closeup-close-icon">cross</mmx-icon>
				</mmx-button>
			</div>
		`;
	}

	#renderCloseupMain() {
		return /*html*/`
			<div part="closeup-main">
				${this.#renderImagesSlider({location: 'closeup', arrowStyle: 'caret', peek: '100'})}
			</div>
		`;
	}

	#renderCloseupFooter() {
		return /*html*/`
			<div part="closeup-footer">
				<div part="closeup-count"></div>
			</div>
		`;
	}

	#updateCloseupCount() {
		if (!this.#closeupEnabled()) {
			return;
		}

		const state = this.#slider().getSliderState();
		this.#closeupCount().textContent = `Image ${state.position + 1} of ${state.slideCount}`;
	}

	openCloseup() {
		if (!this.#closeupEnabled()) {
			return;
		}

		this.#closeupDialog().showModal();
		this.#closeup().updateSizing();
		this.#updateSliders();
	}

	closeCloseup() {
		if (!this.#closeupEnabled()) {
			return;
		}

		this.#closeupDialog().close();
	}

	#saveImageType() {
		if (!this.#closeupEnabled()) {
			return;
		}

		const state = this.#slider().getSliderState();
		const currentImage = this.#images.at(state.position);
		this.#imageType = currentImage?.code;
	}

	#moveToImageType(imageType) {
		imageType = MMX.valueIsEmpty(imageType) ? this.#settings?.main?.image_type?.value : imageType;
		const imageTypeIndex = this.#images.findIndex(image => image.code === imageType);

		if (imageTypeIndex > -1) {
			this.moveToSlide(imageTypeIndex);
		}
	}
}

if (!customElements.get('mmx-image-gallery')){
	customElements.define('mmx-image-gallery', MMX_ImageGallery);
}